
-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT ALL ON conversations TO authenticated;
GRANT ALL ON conversation_participants TO authenticated;
GRANT ALL ON messages TO authenticated;

-- Conversations policies
CREATE POLICY "Enable read access for participants" ON conversations
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_participants.conversation_id = id
    AND conversation_participants.profile_id = auth.uid()
  )
);

-- Conversation participants policies
CREATE POLICY "Enable read access for conversation participants" ON conversation_participants
FOR SELECT TO authenticated
USING (
  profile_id = auth.uid() OR
  conversation_id IN (
    SELECT conversation_id FROM conversation_participants
    WHERE profile_id = auth.uid()
  )
);

CREATE POLICY "Enable insert for participants" ON conversation_participants
FOR INSERT TO authenticated
WITH CHECK (profile_id = auth.uid());

-- Messages policies
CREATE POLICY "Enable read access for conversation messages" ON messages
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_participants.conversation_id = messages.conversation_id
    AND conversation_participants.profile_id = auth.uid()
  )
);

CREATE POLICY "Enable insert access for messages" ON messages
FOR INSERT TO authenticated
WITH CHECK (
  sender_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_participants.conversation_id = messages.conversation_id
    AND conversation_participants.profile_id = auth.uid()
  )
);
