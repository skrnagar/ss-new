
-- Drop existing policies
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

-- Grant necessary permissions
GRANT ALL ON conversations TO authenticated;
GRANT ALL ON conversation_participants TO authenticated;
GRANT ALL ON messages TO authenticated;

-- Create policies for conversations
CREATE POLICY "Enable read access for participants" ON conversations
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_participants.conversation_id = id
    AND conversation_participants.profile_id = auth.uid()
  )
);

CREATE POLICY "Enable insert access for authenticated users" ON conversations
FOR INSERT TO authenticated
WITH CHECK (true);

-- Create policies for conversation participants
CREATE POLICY "Enable read access for own participants" ON conversation_participants
FOR SELECT TO authenticated
USING (profile_id = auth.uid() OR conversation_id IN (
  SELECT conversation_id FROM conversation_participants WHERE profile_id = auth.uid()
));

CREATE POLICY "Enable insert access for participants" ON conversation_participants
FOR INSERT TO authenticated
WITH CHECK (profile_id = auth.uid() OR conversation_id IN (
  SELECT conversation_id FROM conversation_participants WHERE profile_id = auth.uid()
));

-- Create policies for messages
CREATE POLICY "Enable read access for conversation messages" ON messages
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_participants.conversation_id = conversation_id
    AND conversation_participants.profile_id = auth.uid()
  )
);

CREATE POLICY "Enable insert access for messages" ON messages
FOR INSERT TO authenticated
WITH CHECK (
  sender_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_participants.conversation_id = conversation_id
    AND conversation_participants.profile_id = auth.uid()
  )
);
