
-- Create a function to calculate post score
CREATE OR REPLACE FUNCTION calculate_post_score(
  post_id UUID,
  created_at TIMESTAMPTZ,
  like_count BIGINT,
  comment_count BIGINT
) RETURNS FLOAT AS $$
DECLARE
  time_decay FLOAT;
  engagement_score FLOAT;
BEGIN
  -- Calculate time decay (fresher posts score higher)
  time_decay = EXTRACT(EPOCH FROM (now() - created_at)) / 3600.0;
  
  -- Calculate engagement score
  engagement_score = (like_count * 1.5) + (comment_count * 2.0);
  
  -- Combine factors (higher is better)
  RETURN engagement_score / (time_decay + 2.0);
END;
$$ LANGUAGE plpgsql;

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);

-- Create a materialized view for post scores that can be refreshed periodically
DROP MATERIALIZED VIEW IF EXISTS post_scores;
CREATE MATERIALIZED VIEW post_scores AS
SELECT 
  p.id,
  p.created_at,
  CAST(COALESCE((SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id), 0) AS BIGINT) as like_count,
  CAST(COALESCE((SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id), 0) AS BIGINT) as comment_count,
  calculate_post_score(
    p.id, 
    p.created_at,
    CAST(COALESCE((SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id), 0) AS BIGINT),
    CAST(COALESCE((SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id), 0) AS BIGINT)
  ) as score
FROM posts p;

-- Create index on the materialized view
CREATE INDEX IF NOT EXISTS idx_post_scores_score ON post_scores(score DESC);

-- Create function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_post_scores()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY post_scores;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to refresh scores when posts, likes, or comments change
DROP TRIGGER IF EXISTS refresh_post_scores_insert_post ON posts;
DROP TRIGGER IF EXISTS refresh_post_scores_insert_like ON likes;
DROP TRIGGER IF EXISTS refresh_post_scores_insert_comment ON comments;

CREATE TRIGGER refresh_post_scores_insert_post
AFTER INSERT ON posts
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_post_scores();

CREATE TRIGGER refresh_post_scores_insert_like
AFTER INSERT OR DELETE ON likes
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_post_scores();

CREATE TRIGGER refresh_post_scores_insert_comment
AFTER INSERT OR DELETE ON comments
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_post_scores();
