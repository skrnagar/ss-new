
-- Run this to update posts table policies

-- First drop existing policies if they exist
DROP POLICY IF EXISTS "Posts are viewable by everyone" ON posts;
DROP POLICY IF EXISTS "Users can create their own posts" ON posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON posts;

-- Create new policies with correct user_id check
CREATE POLICY "Posts are viewable by everyone" 
ON posts FOR SELECT USING (true);

-- Users can create their own posts
CREATE POLICY "Users can create their own posts" 
ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own posts
CREATE POLICY "Users can update their own posts" 
ON posts FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own posts
CREATE POLICY "Users can delete their own posts" 
ON posts FOR DELETE USING (auth.uid() = user_id);

-- Storage bucket policies
-- Create policy to allow authenticated users to upload to post-images bucket
BEGIN;
  INSERT INTO storage.buckets (id, name, public) 
  VALUES ('post-images', 'post-images', true)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO storage.buckets (id, name, public) 
  VALUES ('post-videos', 'post-videos', true)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO storage.buckets (id, name, public) 
  VALUES ('post-documents', 'post-documents', true)
  ON CONFLICT (id) DO NOTHING;
COMMIT;

-- Create RLS policies for storage buckets
BEGIN;
  -- Anyone can read
  CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id IN ('post-images', 'post-videos', 'post-documents'));
  
  -- Authenticated users can upload
  CREATE POLICY "Authenticated users can upload" ON storage.objects 
    FOR INSERT WITH CHECK (
      bucket_id IN ('post-images', 'post-videos', 'post-documents') 
      AND auth.role() = 'authenticated'
    );
  
  -- Users can update and delete their own uploads
  CREATE POLICY "Users can update their own uploads" ON storage.objects 
    FOR UPDATE USING (
      bucket_id IN ('post-images', 'post-videos', 'post-documents') 
      AND auth.uid() = owner
    );
  
  CREATE POLICY "Users can delete their own uploads" ON storage.objects 
    FOR DELETE USING (
      bucket_id IN ('post-images', 'post-videos', 'post-documents') 
      AND auth.uid() = owner
    );
COMMIT;
