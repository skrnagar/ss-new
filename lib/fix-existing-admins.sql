-- Fix existing admin users - approve all super_admins and existing admins
-- Run this in Supabase SQL Editor

-- First, add the column if it doesn't exist
ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false;

-- Approve all existing super_admin users
UPDATE admin_users 
SET is_approved = true 
WHERE role = 'super_admin';

-- Approve all existing admin users that were created before the approval system
-- (This assumes you want to approve existing admins - adjust as needed)
UPDATE admin_users 
SET is_approved = true 
WHERE is_approved = false 
  AND created_at < NOW() - INTERVAL '1 day';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_admin_users_is_approved ON admin_users(is_approved);

