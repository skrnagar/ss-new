
-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
DROP POLICY IF EXISTS "Users can insert conversations" ON conversations;
DROP POLICY IF EXISTS "Allow users to view their conversations" ON conversations;
DROP POLICY IF EXISTS "Allow users to create conversations" ON conversations;

DROP POLICY IF EXISTS "Users can view their conversation participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can insert conversation participants" ON conversation_participants;
DROP POLICY IF EXISTS "Allow users to view conversation participants" ON conversation_participants;
DROP POLICY IF EXISTS "Allow users to create conversation participants" ON conversation_participants;

DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can insert messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Allow users to view messages" ON messages;
DROP POLICY IF EXISTS "Allow users to send messages" ON messages;

-- Create new simplified policies
CREATE POLICY "enable_select_conversations"
ON conversations FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_id = id
    AND profile_id = auth.uid()
  )
);

CREATE POLICY "enable_insert_conversations"
ON conversations FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "enable_select_participants"
ON conversation_participants FOR SELECT
TO authenticated
USING (
  profile_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_id = conversation_participants.conversation_id
    AND profile_id = auth.uid()
  )
);

CREATE POLICY "enable_insert_participants"
ON conversation_participants FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "enable_select_messages"
ON messages FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_id = messages.conversation_id
    AND profile_id = auth.uid()
  )
);

CREATE POLICY "enable_insert_messages"
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
