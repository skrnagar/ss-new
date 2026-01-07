-- Fix RLS policies for admin tables
-- Run this in Supabase SQL Editor

-- Drop existing policies
DROP POLICY IF EXISTS "Allow all admin_users operations" ON admin_users;
DROP POLICY IF EXISTS "Allow all admin_sessions operations" ON admin_sessions;
DROP POLICY IF EXISTS "Allow all admin_activity_log operations" ON admin_activity_log;

-- For admin_users: Allow all operations (server-side only)
-- Since this is server-side only, we can be more permissive
CREATE POLICY "Allow all admin_users operations"
  ON admin_users
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- For admin_sessions: Allow all operations
CREATE POLICY "Allow all admin_sessions operations"
  ON admin_sessions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- For admin_activity_log: Allow all operations
CREATE POLICY "Allow all admin_activity_log operations"
  ON admin_activity_log
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Alternative: If the above doesn't work, temporarily disable RLS
-- (Only for testing - re-enable after creating admin user)
-- ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE admin_sessions DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE admin_activity_log DISABLE ROW LEVEL SECURITY;

