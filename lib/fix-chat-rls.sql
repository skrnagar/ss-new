
-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for participants" ON conversations;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON conversations;
DROP POLICY IF EXISTS "Enable read access for own participants" ON conversation_participants;
DROP POLICY IF EXISTS "Enable insert access for participants" ON conversation_participants;
DROP POLICY IF EXISTS "Enable read access for conversation messages" ON messages;
DROP POLICY IF EXISTS "Enable insert access for messages" ON messages;

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT ALL ON conversations TO authenticated;
GRANT ALL ON conversation_participants TO authenticated;
GRANT ALL ON messages TO authenticated;

-- Policies for conversations
CREATE POLICY "Enable read access for participants" ON conversations
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_participants.conversation_id = conversations.id
    AND conversation_participants.profile_id = auth.uid()
  )
);

CREATE POLICY "Enable insert access for authenticated users" ON conversations
FOR INSERT TO authenticated
WITH CHECK (true);

-- Policies for conversation participants
CREATE POLICY "Enable read access for own participants" ON conversation_participants
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Enable insert access for participants" ON conversation_participants
FOR INSERT TO authenticated
WITH CHECK (true);

-- Policies for messages
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
