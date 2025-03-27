
-- First drop the existing foreign key constraint if it exists
ALTER TABLE articles 
DROP CONSTRAINT IF EXISTS articles_author_id_fkey;

-- Then add the correct foreign key constraint
ALTER TABLE articles
ADD CONSTRAINT articles_author_id_fkey 
FOREIGN KEY (author_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- Create a view to join articles with profiles
CREATE OR REPLACE VIEW public.articles_with_profiles AS
SELECT 
  articles.*,
  profiles.full_name,
  profiles.avatar_url
FROM 
  articles
  LEFT JOIN profiles ON articles.author_id = profiles.id;

-- Grant access to the view
GRANT SELECT ON articles_with_profiles TO anon, authenticated;
