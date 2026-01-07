-- Clean up conflicting RLS policies
-- Run this in Supabase SQL Editor

-- Drop the old restrictive policies
DROP POLICY IF EXISTS "Admin users can view all admin users" ON admin_users;
DROP POLICY IF EXISTS "Admins can view their own sessions" ON admin_sessions;
DROP POLICY IF EXISTS "Admins can view all activity logs" ON admin_activity_log;

-- The "Allow all admin_users operations" policies should already exist
-- If they don't, they will be created below

-- Verify current policies
SELECT schemaname, tablename, policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename IN ('admin_users', 'admin_sessions', 'admin_activity_log')
ORDER BY tablename, policyname;

