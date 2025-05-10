
-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  link TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT valid_notification_type CHECK (type IN ('connection_request', 'connection_accepted', 'connection_withdrawn'))
);

-- Add RLS policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- Create function to create connection notification
CREATE OR REPLACE FUNCTION create_connection_notification()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Create notification for connection request
    INSERT INTO notifications (user_id, type, content, link)
    VALUES (
      NEW.connected_user_id,
      'connection_request',
      format('You have a new connection request from %s', (SELECT full_name FROM profiles WHERE id = NEW.user_id)),
      format('/profile/%s', (SELECT username FROM profiles WHERE id = NEW.user_id))
    );
  ELSIF TG_OP = 'UPDATE' AND NEW.status = 'accepted' THEN
    -- Create notification for accepted connection
    INSERT INTO notifications (user_id, type, content, link)
    VALUES (
      NEW.user_id,
      'connection_accepted',
      format('Your connection request was accepted by %s', (SELECT full_name FROM profiles WHERE id = NEW.connected_user_id)),
      format('/profile/%s', (SELECT username FROM profiles WHERE id = NEW.connected_user_id))
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for connection notifications
CREATE TRIGGER connection_notification_trigger
  AFTER INSERT OR UPDATE ON connections
  FOR EACH ROW
  EXECUTE FUNCTION create_connection_notification();
