
-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create connections table
CREATE TABLE IF NOT EXISTS connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  connected_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, connected_user_id)
);

-- Add RLS policies
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

-- Policy to view connections
CREATE POLICY "Users can view their own connections"
  ON connections
  FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = connected_user_id);

-- Policy to create connections
CREATE POLICY "Users can create connections"
  ON connections
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy to update connections
CREATE POLICY "Users can update their connections"
  ON connections
  FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() = connected_user_id);
