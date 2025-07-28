-- =============================================
-- Test Follows Table Script
-- =============================================
-- This script will help verify that the follows table is working correctly

-- Check if the follows table exists and has the correct structure
SELECT 
  'Table exists' as check_type,
  EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'follows'
  ) as result;

-- Check the table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'follows'
ORDER BY ordinal_position;

-- Check RLS policies
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'follows';

-- Check if there are any follows records
SELECT 
  'Total follows records' as metric,
  COUNT(*) as count
FROM public.follows;

-- Show sample follows data (if any exists)
SELECT 
  f.id,
  f.follower_id,
  f.following_id,
  f.created_at,
  follower.full_name as follower_name,
  following.full_name as following_name
FROM public.follows f
LEFT JOIN public.profiles follower ON f.follower_id = follower.id
LEFT JOIN public.profiles following ON f.following_id = following.id
LIMIT 5;

-- Test the query that the followers page uses
-- Replace 'YOUR_USER_ID_HERE' with an actual user ID from your profiles table
SELECT 
  'Followers query test' as test_name,
  f.follower_id,
  p.id,
  p.username,
  p.full_name,
  p.avatar_url,
  p.headline
FROM public.follows f
JOIN public.profiles p ON f.follower_id = p.id
WHERE f.following_id = 'YOUR_USER_ID_HERE'  -- Replace with actual user ID
LIMIT 3; 