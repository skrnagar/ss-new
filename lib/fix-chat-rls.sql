
-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Users can view their participations" ON conversation_participants;
DROP POLICY IF EXISTS "Users can create participations" ON conversation_participants;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;

-- Add created_by column if it doesn't exist
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create simplified policies
CREATE POLICY "Users can view their conversations"
ON conversations FOR SELECT
USING (EXISTS (
  SELECT 1 FROM conversation_participants
  WHERE conversation_id = id AND profile_id = auth.uid()
));

CREATE POLICY "Users can create conversations"
ON conversations FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view participants"
ON conversation_participants FOR SELECT
USING (EXISTS (
  SELECT 1 FROM conversation_participants cp
  WHERE cp.conversation_id = conversation_id 
  AND cp.profile_id = auth.uid()
));

CREATE POLICY "Users can add participants"
ON conversation_participants FOR INSERT
WITH CHECK (
  profile_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM conversations
    WHERE id = conversation_id AND created_by = auth.uid()
  )
);

CREATE POLICY "Users can view messages"
ON messages FOR SELECT
USING (EXISTS (
  SELECT 1 FROM conversation_participants
  WHERE conversation_id = messages.conversation_id
  AND profile_id = auth.uid()
));

CREATE POLICY "Users can send messages"
ON messages FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_id = messages.conversation_id
    AND profile_id = auth.uid()
  )
);
