
-- First drop existing policies
DO $$ 
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Public Access" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update their own uploads" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete their own uploads" ON storage.objects;

  -- Create new policies
  CREATE POLICY "Article covers public access" ON storage.objects FOR SELECT 
    USING (bucket_id = 'article-covers' AND metadata->>'mime_type' LIKE 'image/%');
  
  CREATE POLICY "Article covers authenticated upload" ON storage.objects FOR INSERT 
    WITH CHECK (
      bucket_id = 'article-covers' 
      AND auth.role() = 'authenticated'
    );
  
  CREATE POLICY "Article covers owner update" ON storage.objects FOR UPDATE 
    USING (
      bucket_id = 'article-covers' 
      AND auth.uid() = owner
    );
  
  CREATE POLICY "Article covers owner delete" ON storage.objects FOR DELETE 
    USING (
      bucket_id = 'article-covers' 
      AND auth.uid() = owner
    );
END $$;
