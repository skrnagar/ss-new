
-- Drop existing foreign key if it exists
ALTER TABLE articles 
DROP CONSTRAINT IF EXISTS articles_author_id_fkey;

-- Re-add the foreign key constraint 
ALTER TABLE articles
ADD CONSTRAINT articles_author_id_fkey 
FOREIGN KEY (author_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- Create a view to join articles with profiles
CREATE OR REPLACE VIEW articles_with_author AS
SELECT 
    articles.*,
    profiles.full_name,
    profiles.avatar_url
FROM 
    articles
    LEFT JOIN auth.users ON articles.author_id = auth.users.id
    LEFT JOIN profiles ON auth.users.id = profiles.id;

-- Grant access to the view
GRANT SELECT ON articles_with_author TO anon, authenticated;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';
