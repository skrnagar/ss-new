
-- Add foreign key constraint between comments.user_id and profiles.id
ALTER TABLE comments
ADD CONSTRAINT fk_comments_profiles
FOREIGN KEY (user_id) REFERENCES profiles(id);
