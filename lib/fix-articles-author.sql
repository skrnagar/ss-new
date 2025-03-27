
-- First drop the existing foreign key constraint
ALTER TABLE articles 
DROP CONSTRAINT IF EXISTS articles_author_id_fkey;

-- Then add the correct foreign key constraint
ALTER TABLE articles
ADD CONSTRAINT articles_author_id_fkey 
FOREIGN KEY (author_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;
