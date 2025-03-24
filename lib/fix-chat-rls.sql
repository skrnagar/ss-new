
-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update conversations" ON conversations;
DROP POLICY IF EXISTS "Users can view participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can add participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can view messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create simplified policies for conversations
CREATE POLICY "Users can view their conversations"
ON conversations FOR SELECT
USING (EXISTS (
  SELECT 1 FROM conversation_participants
  WHERE conversation_id = id AND profile_id = auth.uid()
));

CREATE POLICY "Users can create conversations"
ON conversations FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update conversations"
ON conversations FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM conversation_participants
  WHERE conversation_id = id AND profile_id = auth.uid()
));

-- Create simplified policies for participants
CREATE POLICY "Users can view participants"
ON conversation_participants FOR SELECT
USING (true);

CREATE POLICY "Users can add participants"
ON conversation_participants FOR INSERT
WITH CHECK (true);

-- Create simplified policies for messages
CREATE POLICY "Users can view messages"
ON messages FOR SELECT
USING (
  conversation_id IN (
    SELECT conversation_id FROM conversation_participants
    WHERE profile_id = auth.uid()
  )
);

CREATE POLICY "Users can send messages"
ON messages FOR INSERT
WITH CHECK (
  conversation_id IN (
    SELECT conversation_id FROM conversation_participants
    WHERE profile_id = auth.uid()
  )
);
