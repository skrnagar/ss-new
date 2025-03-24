
-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Enable read access for participants" ON conversations;
DROP POLICY IF EXISTS "Enable read access for conversation participants" ON conversation_participants;
DROP POLICY IF EXISTS "Enable insert for participants" ON conversation_participants;
DROP POLICY IF EXISTS "Enable read access for conversation messages" ON messages;
DROP POLICY IF EXISTS "Enable insert access for messages" ON messages;

-- Grant necessary permissions
GRANT ALL ON conversations TO authenticated;
GRANT ALL ON conversation_participants TO authenticated;
GRANT ALL ON messages TO authenticated;

-- Simple conversation policies
CREATE POLICY "Enable read access for participants" ON conversations
FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM conversation_participants cp
  WHERE cp.conversation_id = id 
  AND cp.profile_id = auth.uid()
));

-- Simplified participant policies to avoid recursion
DROP POLICY IF EXISTS "Enable read access for participants" ON conversation_participants;
CREATE POLICY "Enable read for participants" ON conversation_participants
FOR SELECT TO authenticated
USING (profile_id = auth.uid());

CREATE POLICY "Enable insert for participants" ON conversation_participants
FOR INSERT TO authenticated
WITH CHECK (profile_id = auth.uid());

-- Message policies
CREATE POLICY "Enable read access for messages" ON messages
FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM conversation_participants cp
  WHERE cp.conversation_id = messages.conversation_id
  AND cp.profile_id = auth.uid()
));

CREATE POLICY "Enable insert for messages" ON messages
FOR INSERT TO authenticated
WITH CHECK (
  sender_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM conversation_participants cp
    WHERE cp.conversation_id = conversation_id
    AND cp.profile_id = auth.uid()
  )
);
