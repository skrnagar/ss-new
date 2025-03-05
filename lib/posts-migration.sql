
-- Add video_url column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'video_url'
    ) THEN
        ALTER TABLE posts ADD COLUMN video_url TEXT;
    END IF;
END $$;

-- Add document_url column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'document_url'
    ) THEN
        ALTER TABLE posts ADD COLUMN document_url TEXT;
    END IF;
END $$;

-- Create a function to add columns if they don't exist
CREATE OR REPLACE FUNCTION add_column_if_not_exists(
  table_name text,
  column_name text,
  column_type text
) RETURNS void AS $$
DECLARE
  column_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = add_column_if_not_exists.table_name 
    AND column_name = add_column_if_not_exists.column_name
  ) INTO column_exists;
  
  IF NOT column_exists THEN
    EXECUTE format('ALTER TABLE %I ADD COLUMN %I %s', 
      table_name, column_name, column_type);
  END IF;
END;
$$ LANGUAGE plpgsql;
