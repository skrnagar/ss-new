
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

-- Grant permissions for materialized view
GRANT ALL ON post_scores TO authenticated;
GRANT SELECT ON post_scores TO anon;

-- Ensure materialized view can be refreshed
ALTER MATERIALIZED VIEW IF EXISTS post_scores OWNER TO postgres;
GRANT ALL ON post_scores TO postgres;
