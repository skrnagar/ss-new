-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create follows table to manage user relationships
CREATE TABLE IF NOT EXISTS follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(follower_id, following_id)
);

-- Add RLS policies
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- Policy for viewing follows (optional, can be restricted)
DROP POLICY IF EXISTS "Users can view follows" ON follows;
CREATE POLICY "Users can view follows"
  ON follows
  FOR SELECT
  USING (true); -- Or more restrictive, e.g., auth.uid() = follower_id

-- Policy for creating a follow relationship
DROP POLICY IF EXISTS "Users can follow others" ON follows;
CREATE POLICY "Users can follow others"
  ON follows
  FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

-- Policy for unfollowing
DROP POLICY IF EXISTS "Users can unfollow" ON follows;
CREATE POLICY "Users can unfollow"
  ON follows
  FOR DELETE
  USING (auth.uid() = follower_id); 