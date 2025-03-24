-- Drop all existing policies
DROP POLICY IF EXISTS "enable_select_conversations" ON conversations;
DROP POLICY IF EXISTS "enable_insert_conversations" ON conversations;
DROP POLICY IF EXISTS "enable_select_participants" ON conversation_participants;
DROP POLICY IF EXISTS "enable_insert_participants" ON conversation_participants;
DROP POLICY IF EXISTS "enable_select_messages" ON messages;
DROP POLICY IF EXISTS "enable_insert_messages" ON messages;

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create simplified policies
CREATE POLICY "enable_select_conversations"
ON conversations FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM conversation_participants cp
    WHERE cp.conversation_id = conversations.id
    AND cp.profile_id = auth.uid()
  )
);

CREATE POLICY "enable_insert_conversations"
ON conversations FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "enable_select_participants"
ON conversation_participants FOR SELECT
TO authenticated
USING (profile_id = auth.uid());

CREATE POLICY "enable_insert_participants"
ON conversation_participants FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "enable_select_messages"
ON messages FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM conversation_participants cp
    WHERE cp.conversation_id = messages.conversation_id
    AND cp.profile_id = auth.uid()
  )
);

CREATE POLICY "enable_insert_messages"
ON messages FOR INSERT
TO authenticated
WITH CHECK (sender_id = auth.uid());