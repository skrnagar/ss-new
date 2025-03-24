
-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create conversations table
CREATE TABLE conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create conversation_participants table
CREATE TABLE conversation_participants (
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  profile_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  PRIMARY KEY (conversation_id, profile_id),
  FOREIGN KEY (profile_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create messages table
CREATE TABLE messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Set up RLS policies
CREATE POLICY "Allow users to create conversations"
ON conversations FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow users to view their conversations"
ON conversations FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_participants.conversation_id = id
    AND conversation_participants.profile_id = auth.uid()
  )
);

CREATE POLICY "Allow users to create conversation participants"
ON conversation_participants FOR INSERT
TO authenticated
WITH CHECK (
  profile_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_id = conversation_participants.conversation_id
    AND profile_id = auth.uid()
  )
);

CREATE POLICY "Allow users to view conversation participants"
ON conversation_participants FOR SELECT
TO authenticated
USING (
  profile_id = auth.uid() OR
  conversation_id IN (
    SELECT conversation_id FROM conversation_participants
    WHERE profile_id = auth.uid()
  )
);

CREATE POLICY "Allow users to send messages"
ON messages FOR INSERT
TO authenticated
WITH CHECK (
  sender_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_id = messages.conversation_id
    AND profile_id = auth.uid()
  )
);

CREATE POLICY "Allow users to view messages"
ON messages FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_id = messages.conversation_id
    AND profile_id = auth.uid()
  )
);
