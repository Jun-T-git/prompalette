-- Add slug column to prompts table
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS slug TEXT;

-- Create index for slug
CREATE INDEX IF NOT EXISTS idx_prompts_slug ON prompts(slug);

-- Create unique index for slug per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_prompts_user_slug 
ON prompts(user_id, slug) 
WHERE slug IS NOT NULL;

-- Function to generate slug from title and quick_access_key
CREATE OR REPLACE FUNCTION generate_prompt_slug(title_input TEXT, quick_key_input TEXT DEFAULT NULL)
RETURNS TEXT AS $$
DECLARE
  slug_base TEXT;
  final_slug TEXT;
BEGIN
  -- Use quick_access_key if available, otherwise generate from title
  IF quick_key_input IS NOT NULL AND quick_key_input != '' THEN
    slug_base := quick_key_input;
  ELSE
    -- Convert title to slug: lowercase, replace spaces with hyphens, remove special chars
    slug_base := LOWER(TRIM(title_input));
    slug_base := REGEXP_REPLACE(slug_base, '[^a-z0-9\s-]', '', 'g');
    slug_base := REGEXP_REPLACE(slug_base, '\s+', '-', 'g');
    slug_base := REGEXP_REPLACE(slug_base, '-+', '-', 'g');
    slug_base := TRIM(slug_base, '-');
  END IF;
  
  -- Ensure slug is not empty
  IF slug_base = '' OR slug_base IS NULL THEN
    slug_base := 'untitled';
  END IF;
  
  final_slug := slug_base;
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Update existing prompts to have slugs
UPDATE prompts 
SET slug = generate_prompt_slug(title, quick_access_key)
WHERE slug IS NULL;

-- Function to auto-generate slug for new prompts
CREATE OR REPLACE FUNCTION ensure_prompt_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 1;
  user_uuid UUID;
BEGIN
  -- Only generate slug if not provided
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    base_slug := generate_prompt_slug(NEW.title, NEW.quick_access_key);
    final_slug := base_slug;
    user_uuid := NEW.user_id;
    
    -- Ensure uniqueness by adding counter if necessary
    WHILE EXISTS (
      SELECT 1 FROM prompts 
      WHERE user_id = user_uuid 
      AND slug = final_slug 
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    ) LOOP
      counter := counter + 1;
      final_slug := base_slug || '-' || counter;
    END LOOP;
    
    NEW.slug := final_slug;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate slug
DROP TRIGGER IF EXISTS trigger_ensure_prompt_slug ON prompts;
CREATE TRIGGER trigger_ensure_prompt_slug
  BEFORE INSERT OR UPDATE ON prompts
  FOR EACH ROW
  EXECUTE FUNCTION ensure_prompt_slug();