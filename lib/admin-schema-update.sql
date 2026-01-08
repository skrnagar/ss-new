-- Add is_approved column to admin_users table
ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false;

-- Update existing super_admin users to be approved
UPDATE admin_users 
SET is_approved = true 
WHERE role = 'super_admin';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_admin_users_is_approved ON admin_users(is_approved);

