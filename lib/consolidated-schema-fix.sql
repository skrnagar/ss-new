-- =============================================
-- Consolidated Schema Fix - Single Source of Truth
-- =============================================
-- This script will completely reset and rebuild the schemas and logic for
-- activities, notifications, follows, and their related triggers.
-- It is designed to be run multiple times safely.
--
-- Run this script ONCE to fix all related issues.
-- =============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------
-- Table: notifications
-- ---------------------------------------------
-- Recreate with the correct check constraint
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  link TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
-- Drop the old constraint and add the new one to ensure it's correct
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS valid_notification_type;
ALTER TABLE notifications ADD CONSTRAINT valid_notification_type
  CHECK (type IN ('connection_request', 'connection_accepted', 'new_follower'));

-- ---------------------------------------------
-- Table: follows
-- ---------------------------------------------
CREATE TABLE IF NOT EXISTS follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(follower_id, following_id)
);

-- ---------------------------------------------
-- Table: activities
-- ---------------------------------------------
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
-- Clean up old data from previous faulty scripts
UPDATE public.activities SET type = 'post' WHERE type = 'new_post';
UPDATE public.activities SET type = 'comment' WHERE type = 'new_comment';
UPDATE public.activities SET type = 'like' WHERE type = 'new_like';
UPDATE public.activities SET type = 'follow' WHERE type = 'new_follower';
-- Drop and re-add the check constraint to ensure it's correct
ALTER TABLE activities DROP CONSTRAINT IF EXISTS activities_type_check;
ALTER TABLE activities ADD CONSTRAINT activities_type_check
  CHECK (type IN ('comment', 'like', 'post', 'follow'));


-- =============================================
-- The One Trigger Function to Rule Them All
-- =============================================
-- Drop all old functions and triggers to prevent conflicts
DROP FUNCTION IF EXISTS create_connection_notification() CASCADE;
DROP FUNCTION IF EXISTS create_follow_notification() CASCADE;
DROP FUNCTION IF EXISTS handle_new_activity() CASCADE;
DROP FUNCTION IF EXISTS create_activity_record() CASCADE;

-- Create a new, single function to handle all logic
CREATE OR REPLACE FUNCTION process_new_event_and_notify()
RETURNS TRIGGER AS $$
DECLARE
  profile_full_name TEXT;
  profile_username TEXT;
BEGIN
  -- ----------- On new POST -----------
  IF TG_TABLE_NAME = 'posts' THEN
    INSERT INTO activities (user_id, type, data)
    VALUES (NEW.user_id, 'post', jsonb_build_object('post_id', NEW.id, 'content', NEW.content));

  -- ----------- On new COMMENT -----------
  ELSIF TG_TABLE_NAME = 'comments' THEN
    INSERT INTO activities (user_id, type, data)
    VALUES (NEW.user_id, 'comment', jsonb_build_object('post_id', NEW.post_id, 'content', NEW.content));

  -- ----------- On new LIKE -----------
  ELSIF TG_TABLE_NAME = 'likes' THEN
    INSERT INTO activities (user_id, type, data)
    VALUES (NEW.user_id, 'like', jsonb_build_object('post_id', NEW.post_id));

  -- ----------- On new FOLLOW -----------
  ELSIF TG_TABLE_NAME = 'follows' THEN
    -- Log the activity
    INSERT INTO activities (user_id, type, data)
    VALUES (NEW.follower_id, 'follow', jsonb_build_object('following_id', NEW.following_id));
    -- Create notification for the user who was followed
    SELECT full_name, username INTO profile_full_name, profile_username FROM profiles WHERE id = NEW.follower_id;
    INSERT INTO notifications (user_id, type, content, link)
    VALUES (
      NEW.following_id,
      'new_follower',
      format('%s started following you', profile_full_name),
      format('/profile/%s', profile_username)
    );

  -- ----------- On new CONNECTION -----------
  ELSIF TG_TABLE_NAME = 'connections' THEN
    IF TG_OP = 'INSERT' THEN
      -- Create notification for connection request
      SELECT full_name, username INTO profile_full_name, profile_username FROM profiles WHERE id = NEW.user_id;
      INSERT INTO notifications (user_id, type, content, link)
      VALUES (
        NEW.connected_user_id,
        'connection_request',
        format('You have a new connection request from %s', profile_full_name),
        format('/profile/%s', profile_username)
      );
    ELSIF TG_OP = 'UPDATE' AND NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
      -- Create notification for accepted connection for the original sender
      SELECT full_name, username INTO profile_full_name, profile_username FROM profiles WHERE id = NEW.connected_user_id;
      INSERT INTO notifications (user_id, type, content, link)
      VALUES (
        NEW.user_id,
        'connection_accepted',
        format('Your connection request was accepted by %s', profile_full_name),
        format('/profile/%s', profile_username)
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =============================================
-- Triggers
-- =============================================
-- Drop old triggers just in case
DROP TRIGGER IF EXISTS after_post_insert ON posts;
DROP TRIGGER IF EXISTS after_comment_insert ON comments;
DROP TRIGGER IF EXISTS after_like_insert ON likes;
DROP TRIGGER IF EXISTS after_follow_insert ON follows;
DROP TRIGGER IF EXISTS connection_notification_trigger ON connections;

-- Create new, unified triggers
CREATE TRIGGER trigger_new_post
  AFTER INSERT ON posts
  FOR EACH ROW EXECUTE FUNCTION process_new_event_and_notify();

CREATE TRIGGER trigger_new_comment
  AFTER INSERT ON comments
  FOR EACH ROW EXECUTE FUNCTION process_new_event_and_notify();

CREATE TRIGGER trigger_new_like
  AFTER INSERT ON likes
  FOR EACH ROW EXECUTE FUNCTION process_new_event_and_notify();

CREATE TRIGGER trigger_new_follow
  AFTER INSERT ON follows
  FOR EACH ROW EXECUTE FUNCTION process_new_event_and_notify();

CREATE TRIGGER trigger_connection_change
  AFTER INSERT OR UPDATE ON connections
  FOR EACH ROW EXECUTE FUNCTION process_new_event_and_notify();


-- Notify PostgREST to reload the schema
NOTIFY pgrst, 'reload schema';

SELECT 'Consolidated schema fix applied successfully.' as result; 