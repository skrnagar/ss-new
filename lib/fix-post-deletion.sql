-- =============================================
-- Fix Post Deletion by Adding CASCADE Constraints
-- =============================================

-- Drop existing foreign key constraints
ALTER TABLE IF EXISTS likes 
DROP CONSTRAINT IF EXISTS likes_post_id_fkey;

ALTER TABLE IF EXISTS comments 
DROP CONSTRAINT IF EXISTS comments_post_id_fkey;

-- Add foreign key constraints with CASCADE deletion
ALTER TABLE likes 
ADD CONSTRAINT likes_post_id_fkey 
FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE;

ALTER TABLE comments 
ADD CONSTRAINT comments_post_id_fkey 
FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE;

-- Also fix the user_id foreign key constraints to reference profiles instead of auth.users
ALTER TABLE IF EXISTS likes 
DROP CONSTRAINT IF EXISTS likes_user_id_fkey;

ALTER TABLE IF EXISTS comments 
DROP CONSTRAINT IF EXISTS comments_user_id_fkey;

-- Add foreign key constraints for user_id referencing profiles
ALTER TABLE likes 
ADD CONSTRAINT likes_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE comments 
ADD CONSTRAINT comments_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Verify the constraints are properly set
SELECT 
    tc.table_name, 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
    JOIN information_schema.referential_constraints AS rc
      ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name IN ('likes', 'comments')
ORDER BY tc.table_name, kcu.column_name; 