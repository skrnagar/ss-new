
-- First drop any dependencies and grants
REVOKE ALL ON post_scores FROM authenticated;
REVOKE ALL ON post_scores FROM anon;

-- Drop the materialized view
DROP MATERIALIZED VIEW IF EXISTS post_scores CASCADE;

-- Drop any related triggers if they exist
DROP TRIGGER IF EXISTS update_post_scores ON posts;
DROP TRIGGER IF EXISTS update_post_scores ON likes;
DROP TRIGGER IF EXISTS update_post_scores ON comments;

-- Drop any related functions if they exist
DROP FUNCTION IF EXISTS refresh_post_scores();
