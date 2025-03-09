
-- Add foreign key constraint between events.user_id and profiles.id
ALTER TABLE events
ADD CONSTRAINT fk_events_profiles
FOREIGN KEY (user_id) REFERENCES auth.users(id);

-- Create index to improve join performance
CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
