-- =============================================
-- One-Time Activities Data Migration Script
-- =============================================
-- This script will clean up inconsistent data in the 'activities' table
-- that was introduced by previous, faulty scripts.
--
-- Run this script ONCE to fix your data.
-- =============================================

-- Step 1: Update old activity types to the new, clean format.
-- This is safe to run multiple times, but only needs to be run once.
UPDATE public.activities
SET type = 'post'
WHERE type = 'new_post';

UPDATE public.activities
SET type = 'comment'
WHERE type = 'new_comment';

UPDATE public.activities
SET type = 'like'
WHERE type = 'new_like';

UPDATE public.activities
SET type = 'follow'
WHERE type = 'new_follower';

-- Step 2: Drop the old, permissive constraint and add the new, strict one.
-- This ensures all future data is clean.
ALTER TABLE public.activities DROP CONSTRAINT IF EXISTS activities_type_check;

ALTER TABLE public.activities ADD CONSTRAINT activities_type_check
  CHECK (type IN ('comment', 'like', 'post', 'follow'));

-- Step 3: Notify PostgREST to reload the schema
NOTIFY pgrst, 'reload schema';

SELECT 'Activity data migrated and schema cleaned successfully.' as result; 