
-- Drop existing policies
DROP POLICY IF EXISTS "Posts are viewable by everyone" ON posts;
DROP POLICY IF EXISTS "Users can create their own posts" ON posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON posts;

-- Drop and recreate materialized view
DROP MATERIALIZED VIEW IF EXISTS post_scores;

-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Posts are viewable by everyone" 
ON posts FOR SELECT USING (true);

CREATE POLICY "Users can create their own posts" 
ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" 
ON posts FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" 
ON posts FOR DELETE USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON posts TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Recreate materialized view with correct permissions
CREATE MATERIALIZED VIEW post_scores AS
SELECT 
    p.id as post_id,
    p.user_id,
    COALESCE(COUNT(DISTINCT l.id), 0) as like_count,
    COALESCE(COUNT(DISTINCT c.id), 0) as comment_count
FROM posts p
LEFT JOIN likes l ON p.id = l.post_id
LEFT JOIN comments c ON p.id = c.post_id
GROUP BY p.id, p.user_id;

-- Set correct ownership and permissions
ALTER MATERIALIZED VIEW post_scores OWNER TO postgres;
GRANT SELECT ON post_scores TO authenticated;
GRANT SELECT ON post_scores TO anon;
