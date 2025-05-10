
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Users can view participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can join conversations" ON conversation_participants;
DROP POLICY IF EXISTS "Users can view messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can update seen status" ON messages;

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Simple policies for conversation_participants
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

CREATE POLICY "Users can join conversations"
ON conversation_participants FOR INSERT
WITH CHECK (profile_id = auth.uid());

-- Simple policies for conversations
CREATE POLICY "Users can view conversations"
ON conversations FOR SELECT
USING (id IN (
  SELECT conversation_id
  FROM conversation_participants
  WHERE profile_id = auth.uid()
));

CREATE POLICY "Users can create conversations"
ON conversations FOR INSERT
WITH CHECK (created_by = auth.uid());

-- Simple policies for messages
CREATE POLICY "Users can view messages"
ON messages FOR SELECT
USING (conversation_id IN (
  SELECT conversation_id
  FROM conversation_participants
  WHERE profile_id = auth.uid()
));

CREATE POLICY "Users can send messages"
ON messages FOR INSERT
WITH CHECK (
  sender_id = auth.uid() AND
  conversation_id IN (
    SELECT conversation_id
    FROM conversation_participants
    WHERE profile_id = auth.uid()
  )
);

CREATE POLICY "Users can update seen status"
ON messages FOR UPDATE
USING (conversation_id IN (
  SELECT conversation_id
  FROM conversation_participants
  WHERE profile_id = auth.uid()
));
