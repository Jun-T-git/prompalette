-- PromPalette MVP Features Migration
-- Adds support for Desktop sync, advanced search, and trending/popular features

-- Add desktop sync fields to prompts table
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS desktop_id TEXT;
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;

-- Create sync_sessions table for tracking sync operations
CREATE TABLE IF NOT EXISTS sync_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL UNIQUE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  uploaded INTEGER DEFAULT 0,
  updated INTEGER DEFAULT 0,
  conflicts INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'failed', 'completed_with_conflicts')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create sync_conflicts table for tracking sync conflicts
CREATE TABLE IF NOT EXISTS sync_conflicts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES sync_sessions(id) ON DELETE CASCADE,
  desktop_id TEXT NOT NULL,
  web_version INTEGER NOT NULL,
  desktop_version INTEGER NOT NULL,
  conflict_type TEXT NOT NULL CHECK (conflict_type IN ('version_mismatch', 'content_conflict', 'metadata_conflict')),
  resolved BOOLEAN DEFAULT FALSE,
  resolution_strategy TEXT CHECK (resolution_strategy IN ('keep_web', 'keep_desktop', 'merge', 'manual')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for sync operations
CREATE INDEX IF NOT EXISTS idx_prompts_desktop_id ON prompts(desktop_id);
CREATE INDEX IF NOT EXISTS idx_prompts_version ON prompts(version);
CREATE INDEX IF NOT EXISTS idx_prompts_user_desktop ON prompts(user_id, desktop_id);
CREATE INDEX IF NOT EXISTS idx_sync_sessions_user_id ON sync_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sync_sessions_session_id ON sync_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_sync_sessions_status ON sync_sessions(status);
CREATE INDEX IF NOT EXISTS idx_sync_conflicts_user_id ON sync_conflicts(user_id);
CREATE INDEX IF NOT EXISTS idx_sync_conflicts_session_id ON sync_conflicts(session_id);
CREATE INDEX IF NOT EXISTS idx_sync_conflicts_resolved ON sync_conflicts(resolved);

-- Add composite indexes for advanced search optimization
CREATE INDEX IF NOT EXISTS idx_prompts_public_created ON prompts(is_public, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prompts_public_views ON prompts(is_public, view_count DESC);
CREATE INDEX IF NOT EXISTS idx_prompts_public_copies ON prompts(is_public, copy_count DESC);
CREATE INDEX IF NOT EXISTS idx_prompts_user_created ON prompts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prompts_updated_at ON prompts(updated_at DESC);

-- Create composite index for popularity scoring (view_count + copy_count)
CREATE INDEX IF NOT EXISTS idx_prompts_popularity_score ON prompts((view_count + copy_count * 2) DESC) WHERE is_public = true;

-- Add full-text search capabilities
-- Create tsvector column for full-text search
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS search_vector TSVECTOR;

-- Create function to update search vector
CREATE OR REPLACE FUNCTION update_prompt_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', 
    coalesce(NEW.title, '') || ' ' || 
    coalesce(NEW.content, '') || ' ' ||
    coalesce(array_to_string(NEW.tags, ' '), '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update search vector
DROP TRIGGER IF EXISTS trigger_update_prompt_search_vector ON prompts;
CREATE TRIGGER trigger_update_prompt_search_vector
  BEFORE INSERT OR UPDATE ON prompts
  FOR EACH ROW EXECUTE FUNCTION update_prompt_search_vector();

-- Create GIN index for full-text search
CREATE INDEX IF NOT EXISTS idx_prompts_search_vector ON prompts USING GIN(search_vector);

-- Update existing rows to populate search_vector
UPDATE prompts SET search_vector = to_tsvector('english', 
  coalesce(title, '') || ' ' || 
  coalesce(content, '') || ' ' ||
  coalesce(array_to_string(tags, ' '), '')
) WHERE search_vector IS NULL;

-- Create updated_at triggers for new tables
CREATE TRIGGER update_sync_sessions_updated_at 
  BEFORE UPDATE ON sync_sessions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create RLS policies for sync tables
ALTER TABLE sync_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_conflicts ENABLE ROW LEVEL SECURITY;

-- Sync sessions policies
CREATE POLICY "Users can manage own sync sessions" 
  ON sync_sessions FOR ALL 
  USING (auth.uid() = user_id);

-- Sync conflicts policies  
CREATE POLICY "Users can manage own sync conflicts" 
  ON sync_conflicts FOR ALL 
  USING (auth.uid() = user_id);

-- Create advanced search function with better performance
CREATE OR REPLACE FUNCTION advanced_search_prompts(
  search_query TEXT DEFAULT '',
  tag_filters TEXT[] DEFAULT NULL,
  author_filter TEXT DEFAULT NULL,
  date_from DATE DEFAULT NULL,
  date_to DATE DEFAULT NULL,
  is_public_filter BOOLEAN DEFAULT NULL,
  sort_by TEXT DEFAULT 'created_at',
  sort_order TEXT DEFAULT 'desc',
  limit_count INTEGER DEFAULT 20,
  offset_count INTEGER DEFAULT 0,
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
  username TEXT,
  user_name TEXT,
  user_avatar_url TEXT,
  total_count BIGINT
) AS $$
DECLARE
  base_query TEXT;
  where_conditions TEXT[] := ARRAY[]::TEXT[];
  order_clause TEXT;
  total_count_val BIGINT;
BEGIN
  -- Build WHERE conditions
  IF search_query != '' THEN
    where_conditions := array_append(where_conditions, 
      'p.search_vector @@ plainto_tsquery(''english'', ' || quote_literal(search_query) || ')');
  END IF;
  
  IF tag_filters IS NOT NULL AND array_length(tag_filters, 1) > 0 THEN
    where_conditions := array_append(where_conditions, 
      'p.tags && ' || quote_literal(tag_filters));
  END IF;
  
  IF author_filter IS NOT NULL THEN
    where_conditions := array_append(where_conditions, 
      'u.username = ' || quote_literal(author_filter));
  END IF;
  
  IF date_from IS NOT NULL THEN
    where_conditions := array_append(where_conditions, 
      'p.created_at >= ' || quote_literal(date_from));
  END IF;
  
  IF date_to IS NOT NULL THEN
    where_conditions := array_append(where_conditions, 
      'p.created_at <= ' || quote_literal(date_to) || ' + INTERVAL ''1 day''');
  END IF;
  
  IF is_public_filter IS NOT NULL THEN
    where_conditions := array_append(where_conditions, 
      'p.is_public = ' || is_public_filter);
  ELSE
    -- Default visibility logic
    IF user_id_param IS NOT NULL THEN
      where_conditions := array_append(where_conditions, 
        '(p.is_public = true OR p.user_id = ' || quote_literal(user_id_param) || ')');
    ELSE
      where_conditions := array_append(where_conditions, 'p.is_public = true');
    END IF;
  END IF;
  
  -- Build ORDER BY clause
  CASE sort_by
    WHEN 'created_at' THEN order_clause := 'p.created_at ' || sort_order;
    WHEN 'updated_at' THEN order_clause := 'p.updated_at ' || sort_order;
    WHEN 'view_count' THEN order_clause := 'p.view_count ' || sort_order;
    WHEN 'copy_count' THEN order_clause := 'p.copy_count ' || sort_order;
    WHEN 'title' THEN order_clause := 'p.title ' || sort_order;
    ELSE order_clause := 'p.created_at desc';
  END CASE;
  
  -- Get total count first
  base_query := 'SELECT COUNT(*) FROM prompts p JOIN users u ON p.user_id = u.id';
  IF array_length(where_conditions, 1) > 0 THEN
    base_query := base_query || ' WHERE ' || array_to_string(where_conditions, ' AND ');
  END IF;
  
  EXECUTE base_query INTO total_count_val;
  
  -- Build main query
  base_query := 'SELECT p.id, p.user_id, p.title, p.content, p.tags, p.quick_access_key, 
                 p.is_public, p.view_count, p.copy_count, p.created_at, p.updated_at,
                 u.username, u.name, u.avatar_url, $1 as total_count
                 FROM prompts p 
                 JOIN users u ON p.user_id = u.id';
  
  IF array_length(where_conditions, 1) > 0 THEN
    base_query := base_query || ' WHERE ' || array_to_string(where_conditions, ' AND ');
  END IF;
  
  base_query := base_query || ' ORDER BY ' || order_clause || 
                ' LIMIT ' || limit_count || ' OFFSET ' || offset_count;
  
  RETURN QUERY EXECUTE base_query USING total_count_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Create unique index for desktop sync to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_prompts_user_desktop_unique 
ON prompts(user_id, desktop_id) 
WHERE desktop_id IS NOT NULL;

-- Add comments for documentation
COMMENT ON TABLE sync_sessions IS 'Tracks Desktop-Web sync operations';
COMMENT ON TABLE sync_conflicts IS 'Stores sync conflicts for manual resolution';
COMMENT ON COLUMN prompts.desktop_id IS 'Unique identifier from Desktop app for sync';
COMMENT ON COLUMN prompts.version IS 'Version number for conflict resolution';
COMMENT ON COLUMN prompts.search_vector IS 'Full-text search index for title, content, and tags';
COMMENT ON FUNCTION advanced_search_prompts IS 'High-performance search with filtering and pagination';