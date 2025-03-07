-- Create comments table if it doesn't exist
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS on comments
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Comments policies
CREATE POLICY IF NOT EXISTS "Comments are viewable by everyone" 
ON comments FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Users can insert their own comments" 
ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update their own comments" 
ON comments FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete their own comments" 
ON comments FOR DELETE USING (auth.uid() = user_id);

-- Create likes table if it doesn't exist
CREATE TABLE IF NOT EXISTS likes (
  id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(post_id, user_id)  -- Ensure a user can only like a post once
);

-- Enable RLS on likes
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- Likes policies
CREATE POLICY IF NOT EXISTS "Likes are viewable by everyone" 
ON likes FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Users can insert their own likes" 
ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete their own likes" 
ON likes FOR DELETE USING (auth.uid() = user_id);

-- Add schema for activities

-- Create a join table between posts and profiles for user activities
CREATE OR REPLACE VIEW user_activities AS
  SELECT 'post' as type, posts.id as item_id, posts.user_id, posts.content, posts.created_at, posts.id as post_id
  FROM posts
  UNION ALL
  SELECT 'comment' as type, comments.id as item_id, comments.user_id, comments.content, comments.created_at, comments.post_id
  FROM comments
  UNION ALL
  SELECT 'like' as type, likes.id as item_id, likes.user_id, '' as content, likes.created_at, likes.post_id
  FROM likes;

-- Add index to improve performance
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);