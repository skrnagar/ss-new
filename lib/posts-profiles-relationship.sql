
-- Add foreign key constraint between posts.user_id and profiles.id
ALTER TABLE posts
ADD CONSTRAINT fk_posts_profiles
FOREIGN KEY (user_id) REFERENCES profiles(id);
