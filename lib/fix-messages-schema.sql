-- Fix messages table schema to add seen fields if they don't exist
-- Run this in your Supabase dashboard SQL editor

-- Add seen and seen_at columns if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='messages' AND column_name='seen') THEN
        ALTER TABLE messages ADD COLUMN seen BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='messages' AND column_name='seen_at') THEN
        ALTER TABLE messages ADD COLUMN seen_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='messages' AND column_name='image_url') THEN
        ALTER TABLE messages ADD COLUMN image_url TEXT;
    END IF;
END $$;

-- Create index for better performance on seen field
CREATE INDEX IF NOT EXISTS idx_messages_seen ON messages(seen);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_seen ON messages(conversation_id, seen);

-- Update existing messages to set seen to false if null
UPDATE messages SET seen = FALSE WHERE seen IS NULL;

-- Enable realtime for messages table (this is crucial for real-time subscriptions)
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Notify schema reload
NOTIFY pgrst, 'reload schema';

SELECT 'Messages schema fixed successfully!' as result;
