-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "conversation_participants_read" ON conversations;
DROP POLICY IF EXISTS "participant_read" ON conversation_participants;
DROP POLICY IF EXISTS "participant_insert" ON conversation_participants;
DROP POLICY IF EXISTS "message_read" ON messages;
DROP POLICY IF EXISTS "message_insert" ON messages;
DROP POLICY IF EXISTS "Enable read access for participants" ON conversations;
DROP POLICY IF EXISTS "Enable read access for own participants" ON conversation_participants;
DROP POLICY IF EXISTS "Enable read for participants" ON conversation_participants;
DROP POLICY IF EXISTS "Enable insert for participants" ON conversation_participants;
DROP POLICY IF EXISTS "Enable insert for own participants" ON conversation_participants;
DROP POLICY IF EXISTS "Enable read access for messages" ON messages;
DROP POLICY IF EXISTS "Enable insert for messages" ON messages;
DROP POLICY IF EXISTS "Users can view conversations they are part of" ON conversation_participants;
DROP POLICY IF EXISTS "Users can create conversations they are part of" ON conversation_participants;
DROP POLICY IF EXISTS "Users can delete their own conversation participants" ON conversation_participants;


-- Grant necessary permissions
GRANT ALL ON conversations TO authenticated;
GRANT ALL ON conversation_participants TO authenticated;
GRANT ALL ON messages TO authenticated;

-- Conversation policies
CREATE POLICY "conversation_access" ON conversations
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM conversation_participants cp
    WHERE cp.conversation_id = id 
    AND cp.profile_id = auth.uid()
  )
);

-- Simple participant policies
CREATE POLICY "participant_access" ON conversation_participants
FOR ALL TO authenticated
USING (profile_id = auth.uid());

-- Message policies
CREATE POLICY "message_access" ON messages
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM conversation_participants cp
    WHERE cp.conversation_id = messages.conversation_id
    AND cp.profile_id = auth.uid()
  )
);