
-- Enable row level security
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Make sure RLS is enabled
ALTER TABLE comments FORCE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can create their own comments" ON comments;
DROP POLICY IF EXISTS "Users can read all comments" ON comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON comments;
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON comments;

-- Create comprehensive policies
-- Allow users to insert their own comments (using auth.uid())
CREATE POLICY "Users can create their own comments" 
ON comments FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Allow everyone to read all comments
CREATE POLICY "Users can read all comments" 
ON comments FOR SELECT
USING (true);

-- Allow users to update their own comments
CREATE POLICY "Users can update their own comments" 
ON comments FOR UPDATE 
USING (auth.uid() = user_id);

-- Allow users to delete their own comments
CREATE POLICY "Users can delete their own comments" 
ON comments FOR DELETE 
USING (auth.uid() = user_id);
