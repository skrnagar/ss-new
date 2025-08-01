-- =============================================
-- Notification Enhancement for Likes and Comments
-- =============================================

-- Update the notification types to include likes and comments
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS valid_notification_type;
ALTER TABLE notifications ADD CONSTRAINT valid_notification_type
  CHECK (type IN ('connection_request', 'connection_accepted', 'new_follower', 'post_like', 'post_comment'));

-- Create a function to handle like notifications
CREATE OR REPLACE FUNCTION handle_like_notification()
RETURNS TRIGGER AS $$
DECLARE
  liker_profile RECORD;
  post_owner_id UUID;
  post_content TEXT;
BEGIN
  -- Get the liker's profile information
  SELECT full_name, username INTO liker_profile 
  FROM profiles 
  WHERE id = NEW.user_id;
  
  -- Get the post owner and content
  SELECT user_id, content INTO post_owner_id, post_content
  FROM posts 
  WHERE id = NEW.post_id;
  
  -- Don't create notification if user likes their own post
  IF NEW.user_id = post_owner_id THEN
    RETURN NEW;
  END IF;
  
  -- Create notification for the post owner
  INSERT INTO notifications (user_id, type, content, link)
  VALUES (
    post_owner_id,
    'post_like',
    format('%s liked your post', liker_profile.full_name),
    format('/posts/%s', NEW.post_id)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to handle comment notifications
CREATE OR REPLACE FUNCTION handle_comment_notification()
RETURNS TRIGGER AS $$
DECLARE
  commenter_profile RECORD;
  post_owner_id UUID;
  post_content TEXT;
  comment_preview TEXT;
BEGIN
  -- Get the commenter's profile information
  SELECT full_name, username INTO commenter_profile 
  FROM profiles 
  WHERE id = NEW.user_id;
  
  -- Get the post owner and content
  SELECT user_id, content INTO post_owner_id, post_content
  FROM posts 
  WHERE id = NEW.post_id;
  
  -- Don't create notification if user comments on their own post
  IF NEW.user_id = post_owner_id THEN
    RETURN NEW;
  END IF;
  
  -- Create a preview of the comment (first 50 characters)
  comment_preview := CASE 
    WHEN length(NEW.content) > 50 THEN substring(NEW.content from 1 for 50) || '...'
    ELSE NEW.content
  END;
  
  -- Create notification for the post owner
  INSERT INTO notifications (user_id, type, content, link)
  VALUES (
    post_owner_id,
    'post_comment',
    format('%s commented: "%s"', commenter_profile.full_name, comment_preview),
    format('/posts/%s', NEW.post_id)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for likes and comments
DROP TRIGGER IF EXISTS trigger_like_notification ON likes;
CREATE TRIGGER trigger_like_notification
  AFTER INSERT ON likes
  FOR EACH ROW EXECUTE FUNCTION handle_like_notification();

DROP TRIGGER IF EXISTS trigger_comment_notification ON comments;
CREATE TRIGGER trigger_comment_notification
  AFTER INSERT ON comments
  FOR EACH ROW EXECUTE FUNCTION handle_comment_notification();

-- Add RLS policies for notifications if they don't exist
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
CREATE POLICY "Users can view their own notifications" ON notifications 
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
CREATE POLICY "Users can update their own notifications" ON notifications 
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can create notifications" ON notifications;
CREATE POLICY "System can create notifications" ON notifications 
  FOR INSERT WITH CHECK (true); 