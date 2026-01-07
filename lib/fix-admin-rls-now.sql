-- Quick fix for RLS - Run this in Supabase SQL Editor
-- This will allow inserts into admin_users table

-- Drop existing policies
DROP POLICY IF EXISTS "Allow all admin_users operations" ON admin_users;
DROP POLICY IF EXISTS "Allow all admin_sessions operations" ON admin_sessions;
DROP POLICY IF EXISTS "Allow all admin_activity_log operations" ON admin_activity_log;

-- Create new policies that allow all operations
CREATE POLICY "Allow all admin_users operations"
  ON admin_users
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all admin_sessions operations"
  ON admin_sessions
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all admin_activity_log operations"
  ON admin_activity_log
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Verify policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename IN ('admin_users', 'admin_sessions', 'admin_activity_log');

