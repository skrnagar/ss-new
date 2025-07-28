-- =============================================
-- Add Test Follows Data
-- =============================================
-- This script will add some test follow relationships
-- to help verify that the followers/following pages work correctly

-- First, let's see what profiles exist
SELECT 
  'Available profiles' as info,
  id,
  username,
  full_name
FROM public.profiles
LIMIT 10;

-- Add some test follows (replace the UUIDs with actual profile IDs from your database)
-- You'll need to replace these UUIDs with actual profile IDs from your profiles table

-- Example follows (uncomment and modify with real profile IDs):
/*
INSERT INTO public.follows (follower_id, following_id)
VALUES 
  ('PROFILE_ID_1', 'PROFILE_ID_2'),  -- Profile 1 follows Profile 2
  ('PROFILE_ID_2', 'PROFILE_ID_1'),  -- Profile 2 follows Profile 1
  ('PROFILE_ID_3', 'PROFILE_ID_1'),  -- Profile 3 follows Profile 1
  ('PROFILE_ID_1', 'PROFILE_ID_3');  -- Profile 1 follows Profile 3
ON CONFLICT (follower_id, following_id) DO NOTHING;
*/

-- Check the current follows data
SELECT 
  'Current follows data' as info,
  f.id,
  f.follower_id,
  f.following_id,
  f.created_at,
  follower.username as follower_username,
  following.username as following_username
FROM public.follows f
LEFT JOIN public.profiles follower ON f.follower_id = follower.id
LEFT JOIN public.profiles following ON f.following_id = following.id
ORDER BY f.created_at DESC
LIMIT 10;

SELECT 'To add test follows, uncomment and modify the INSERT statement above with real profile IDs.' as instruction; 