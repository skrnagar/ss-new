
-- Allow users to upload their own avatars to storage
CREATE POLICY "Users can upload their own avatars" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'avatars' AND 
  auth.uid() = (storage.foldername(name))[1]::uuid
);

-- Allow users to update their own avatars in storage
CREATE POLICY "Users can update their own avatars" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'avatars' AND 
  auth.uid() = (storage.foldername(name))[1]::uuid
);

-- Allow users to read any avatar
CREATE POLICY "Anyone can view avatars" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'avatars');

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);
