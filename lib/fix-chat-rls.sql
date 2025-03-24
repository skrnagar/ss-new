
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
DROP POLICY IF EXISTS "Users can insert conversations" ON conversations;
DROP POLICY IF EXISTS "Users can view their conversation participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can insert conversation participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can insert messages in their conversations" ON messages;

-- Create simplified policies
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

CREATE POLICY "Allow users to create conversations"
ON conversations FOR INSERT
TO authenticated
WITH CHECK (true);

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

CREATE POLICY "Allow users to create conversation participants"
ON conversation_participants FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow users to view messages"
ON messages FOR SELECT
TO authenticated
USING (
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
  conversation_id IN (
    SELECT conversation_id FROM conversation_participants
    WHERE profile_id = auth.uid()
  )
);
