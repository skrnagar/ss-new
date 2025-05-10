
-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Users can view participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can add participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can view messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Conversations policies
CREATE POLICY "Users can view their conversations"
ON conversations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM conversation_participants 
    WHERE conversation_participants.conversation_id = conversations.id 
    AND conversation_participants.profile_id = auth.uid()
  )
);

CREATE POLICY "Users can create conversations"
ON conversations FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Participant policies
CREATE POLICY "Users can view participants"
ON conversation_participants FOR SELECT
USING (
  profile_id = auth.uid() OR
  conversation_id IN (
    SELECT conversation_id 
    FROM conversation_participants 
    WHERE profile_id = auth.uid()
  )
);

CREATE POLICY "Users can add participants"
ON conversation_participants FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT profile_id 
    FROM conversation_participants 
    WHERE conversation_id = conversation_participants.conversation_id
  ) OR 
  auth.uid() = conversation_participants.profile_id
);

-- Messages policies
CREATE POLICY "Users can view messages"
ON messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_participants.conversation_id = messages.conversation_id
    AND conversation_participants.profile_id = auth.uid()
  )
);

CREATE POLICY "Users can send messages"
ON messages FOR INSERT
WITH CHECK (
  sender_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_participants.conversation_id = NEW.conversation_id
    AND conversation_participants.profile_id = auth.uid()
  )
);
