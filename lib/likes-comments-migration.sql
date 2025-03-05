
-- Create likes table
CREATE TABLE IF NOT EXISTS likes (
  id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  post_id UUID REFERENCES posts(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, post_id)
);

-- Enable RLS on likes
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- Create likes policies
CREATE POLICY "Likes are viewable by everyone" 
ON likes FOR SELECT USING (true);

-- Users can create their own likes
CREATE POLICY "Users can create their own likes" 
ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own likes
CREATE POLICY "Users can delete their own likes" 
ON likes FOR DELETE USING (auth.uid() = user_id);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS on comments
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Create comments policies
CREATE POLICY "Comments are viewable by everyone" 
ON comments FOR SELECT USING (true);

-- Users can create their own comments
CREATE POLICY "Users can create their own comments" 
ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own comments
CREATE POLICY "Users can update their own comments" 
ON comments FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete their own comments" 
ON comments FOR DELETE USING (auth.uid() = user_id);
