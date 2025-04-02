
-- Drop existing policies
DROP POLICY IF EXISTS "Posts are viewable by everyone" ON posts;
DROP POLICY IF EXISTS "Users can create their own posts" ON posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON posts;

-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Create new policies
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
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Drop and recreate materialized view with proper permissions
DROP MATERIALIZED VIEW IF EXISTS post_scores;
CREATE MATERIALIZED VIEW post_scores AS
SELECT 
    p.id as post_id,
    p.user_id,
    COALESCE(l.like_count, 0) as like_count,
    COALESCE(c.comment_count, 0) as comment_count
FROM posts p
LEFT JOIN (
    SELECT post_id, COUNT(*) as like_count 
    FROM likes 
    GROUP BY post_id
) l ON p.id = l.post_id
LEFT JOIN (
    SELECT post_id, COUNT(*) as comment_count 
    FROM comments 
    GROUP BY post_id
) c ON p.id = c.post_id;

-- Grant permissions for materialized view
ALTER MATERIALIZED VIEW post_scores OWNER TO postgres;
GRANT SELECT ON post_scores TO authenticated;
GRANT SELECT ON post_scores TO anon;
