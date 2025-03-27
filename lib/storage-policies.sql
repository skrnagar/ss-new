
-- Enable storage policies for article-covers bucket
BEGIN;
  -- Create policy for public read access
  CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'article-covers');
  
  -- Create policy for authenticated users to upload
  CREATE POLICY "Authenticated users can upload" ON storage.objects 
    FOR INSERT WITH CHECK (
      bucket_id = 'article-covers' 
      AND auth.role() = 'authenticated'
    );
  
  -- Create policy for users to update their own uploads
  CREATE POLICY "Users can update their own uploads" ON storage.objects 
    FOR UPDATE USING (
      bucket_id = 'article-covers' 
      AND auth.uid() = owner
    );
  
  -- Create policy for users to delete their own uploads
  CREATE POLICY "Users can delete their own uploads" ON storage.objects 
    FOR DELETE USING (
      bucket_id = 'article-covers' 
      AND auth.uid() = owner
    );
COMMIT;
