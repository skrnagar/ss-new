
-- Add missing columns to the profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS company TEXT,
ADD COLUMN IF NOT EXISTS position TEXT,
ADD COLUMN IF NOT EXISTS location TEXT;
