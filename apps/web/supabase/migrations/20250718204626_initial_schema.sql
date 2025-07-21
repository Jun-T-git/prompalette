-- PromPalette Database Schema
-- Initial migration

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  avatar_url TEXT,
  username TEXT NOT NULL UNIQUE,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create prompts table
CREATE TABLE IF NOT EXISTS prompts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  quick_access_key TEXT,
  is_public BOOLEAN NOT NULL DEFAULT true,
  view_count INTEGER DEFAULT 0,
  copy_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_prompts_user_id ON prompts(user_id);
CREATE INDEX IF NOT EXISTS idx_prompts_is_public ON prompts(is_public);
CREATE INDEX IF NOT EXISTS idx_prompts_tags ON prompts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_prompts_quick_access_key ON prompts(quick_access_key);
CREATE INDEX IF NOT EXISTS idx_prompts_created_at ON prompts(created_at);
CREATE INDEX IF NOT EXISTS idx_prompts_view_count ON prompts(view_count);
CREATE INDEX IF NOT EXISTS idx_prompts_copy_count ON prompts(copy_count);

-- Create unique index for quick_access_key per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_prompts_user_quick_key 
ON prompts(user_id, quick_access_key) 
WHERE quick_access_key IS NOT NULL;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prompts_updated_at 
  BEFORE UPDATE ON prompts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view public profiles" 
  ON users FOR SELECT 
  USING (is_public = true OR auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON users FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON users FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Prompts policies
CREATE POLICY "Anyone can view public prompts" 
  ON prompts FOR SELECT 
  USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can manage own prompts" 
  ON prompts FOR ALL 
  USING (auth.uid() = user_id);

-- Create function to search prompts
CREATE OR REPLACE FUNCTION search_prompts(
  search_query TEXT DEFAULT '',
  tag_filter TEXT DEFAULT NULL,
  username_filter TEXT DEFAULT NULL,
  quick_key_filter TEXT DEFAULT NULL,
  include_private BOOLEAN DEFAULT false,
  user_id_param UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  title TEXT,
  content TEXT,
  tags TEXT[],
  quick_access_key TEXT,
  is_public BOOLEAN,
  view_count INTEGER,
  copy_count INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  username TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    p.title,
    p.content,
    p.tags,
    p.quick_access_key,
    p.is_public,
    p.view_count,
    p.copy_count,
    p.created_at,
    p.updated_at,
    u.username
  FROM prompts p
  JOIN users u ON p.user_id = u.id
  WHERE 
    (p.is_public = true OR (include_private AND p.user_id = user_id_param))
    AND (
      search_query = '' OR 
      p.title ILIKE '%' || search_query || '%' OR 
      p.content ILIKE '%' || search_query || '%'
    )
    AND (tag_filter IS NULL OR tag_filter = ANY(p.tags))
    AND (username_filter IS NULL OR u.username = username_filter)
    AND (quick_key_filter IS NULL OR p.quick_access_key = quick_key_filter)
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to generate unique username
CREATE OR REPLACE FUNCTION generate_unique_username(base_name TEXT)
RETURNS TEXT AS $$
DECLARE
  clean_name TEXT;
  final_username TEXT;
  counter INTEGER := 1;
BEGIN
  -- Clean the name
  clean_name := lower(regexp_replace(base_name, '[^a-zA-Z0-9]', '', 'g'));
  clean_name := left(clean_name, 20);
  
  -- Try the base name first
  final_username := clean_name;
  
  -- Check if username exists and increment if needed
  WHILE EXISTS (SELECT 1 FROM users WHERE username = final_username) LOOP
    final_username := clean_name || counter;
    counter := counter + 1;
    
    -- Prevent infinite loop
    IF counter > 9999 THEN
      final_username := clean_name || extract(epoch from now())::integer;
      EXIT;
    END IF;
  END LOOP;
  
  RETURN final_username;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;