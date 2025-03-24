
-- Drop existing policies
DROP POLICY IF EXISTS "enable_select_conversations" ON conversations;
DROP POLICY IF EXISTS "enable_insert_conversations" ON conversations;
DROP POLICY IF EXISTS "enable_select_participants" ON conversation_participants;
DROP POLICY IF EXISTS "enable_insert_participants" ON conversation_participants;
DROP POLICY IF EXISTS "enable_select_messages" ON messages;
DROP POLICY IF EXISTS "enable_insert_messages" ON messages;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON conversations TO authenticated;
GRANT ALL ON conversation_participants TO authenticated;
GRANT ALL ON messages TO authenticated;

-- Create policies for conversations
CREATE POLICY "enable_select_conversations"
ON conversations FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM conversation_participants
  WHERE conversation_id = conversations.id
  AND profile_id = auth.uid()
));

CREATE POLICY "enable_insert_conversations"
ON conversations FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create policies for conversation participants
CREATE POLICY "enable_select_participants"
ON conversation_participants FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM conversation_participants
  WHERE conversation_id = conversation_participants.conversation_id
  AND profile_id = auth.uid()
));

CREATE POLICY "enable_insert_participants"
ON conversation_participants FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create policies for messages
CREATE POLICY "enable_select_messages"
ON messages FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM conversation_participants
  WHERE conversation_id = messages.conversation_id
  AND profile_id = auth.uid()
));

CREATE POLICY "enable_insert_messages"
ON messages FOR INSERT
TO authenticated
WITH CHECK (sender_id = auth.uid());
