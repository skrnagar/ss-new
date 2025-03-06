
-- First, make sure table has RLS enabled
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments FORCE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can create their own comments" ON comments;
DROP POLICY IF EXISTS "Users can read all comments" ON comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON comments;
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON comments;

-- Create simple, clear policies that will definitely work
-- Everyone can read comments
CREATE POLICY "Everyone can read comments" 
ON comments FOR SELECT 
USING (true);

-- Only authenticated users can create comments as themselves
CREATE POLICY "Users can create comments" 
ON comments FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Only owners can update their comments
CREATE POLICY "Users can update own comments" 
ON comments FOR UPDATE 
USING (auth.uid() = user_id);

-- Only owners can delete their comments
CREATE POLICY "Users can delete own comments" 
ON comments FOR DELETE 
USING (auth.uid() = user_id);

-- Display success message
DO $$
BEGIN
  RAISE NOTICE 'Comments table RLS policies have been successfully recreated';
END $$;
-- Add policies for users to create their own comments
CREATE POLICY IF NOT EXISTS "Users can insert their own comments" ON comments
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add policies for users to update their own comments
CREATE POLICY IF NOT EXISTS "Users can update their own comments" ON comments
FOR UPDATE USING (auth.uid() = user_id);

-- Add policies for users to delete their own comments
CREATE POLICY IF NOT EXISTS "Users can delete their own comments" ON comments
FOR DELETE USING (auth.uid() = user_id);

-- Debug issues with the comments table by ensuring the FK constraint exists
ALTER TABLE IF EXISTS comments
DROP CONSTRAINT IF EXISTS comments_user_id_fkey,
ADD CONSTRAINT comments_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS comments
DROP CONSTRAINT IF EXISTS comments_post_id_fkey,
ADD CONSTRAINT comments_post_id_fkey
FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE;
