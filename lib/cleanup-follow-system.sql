-- =============================================
-- Follow System Cleanup Script (Run First)
-- =============================================
-- This script will completely remove the old, broken follow system,
-- including all related triggers, functions, and tables to ensure
-- a clean slate for the new implementation.

-- Drop all possible old functions and triggers, ignoring errors if they don't exist.
DROP FUNCTION IF EXISTS create_connection_notification() CASCADE;
DROP FUNCTION IF EXISTS create_follow_notification() CASCADE;
DROP FUNCTION IF EXISTS handle_new_activity() CASCADE;
DROP FUNCTION IF EXISTS create_activity_record() CASCADE;
DROP FUNCTION IF EXISTS process_new_event_and_notify() CASCADE;

-- Drop the follows table completely.
DROP TABLE IF EXISTS public.follows;

-- We will leave the notifications and activities tables, but the triggers
-- that wrote to them from the 'follows' table are now gone.

SELECT 'Old follow system completely removed.' as result; 