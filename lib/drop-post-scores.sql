
-- First drop any dependencies and grants
REVOKE ALL ON post_scores FROM authenticated;
REVOKE ALL ON post_scores FROM anon;

-- Drop the materialized view
DROP MATERIALIZED VIEW IF EXISTS post_scores CASCADE;

-- Drop any related triggers if they exist
DROP TRIGGER IF EXISTS update_post_scores ON posts CASCADE;
DROP TRIGGER IF EXISTS update_post_scores ON likes CASCADE;
DROP TRIGGER IF EXISTS update_post_scores ON comments CASCADE;

-- Drop the function with CASCADE to handle dependencies
DROP FUNCTION IF EXISTS refresh_post_scores() CASCADE;
