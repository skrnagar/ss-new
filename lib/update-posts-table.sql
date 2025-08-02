-- Update posts table to add missing columns
-- Run this in your Supabase SQL editor

-- Add link_preview column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'link_preview'
    ) THEN
        ALTER TABLE posts ADD COLUMN link_preview JSONB;
        COMMENT ON COLUMN posts.link_preview IS 'Stores link preview metadata (title, description, image, url, domain) as JSON';
    END IF;
END $$;

-- Add image_urls column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'image_urls'
    ) THEN
        ALTER TABLE posts ADD COLUMN image_urls TEXT[];
        COMMENT ON COLUMN posts.image_urls IS 'Array of image URLs for multiple images';
    END IF;
END $$;

-- Add likes_count column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'likes_count'
    ) THEN
        ALTER TABLE posts ADD COLUMN likes_count INTEGER DEFAULT 0;
        COMMENT ON COLUMN posts.likes_count IS 'Count of likes for the post';
    END IF;
END $$;

-- Add comments_count column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'comments_count'
    ) THEN
        ALTER TABLE posts ADD COLUMN comments_count INTEGER DEFAULT 0;
        COMMENT ON COLUMN posts.comments_count IS 'Count of comments for the post';
    END IF;
END $$;

-- Verify the columns exist
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'posts' 
ORDER BY ordinal_position; 