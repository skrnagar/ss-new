
CREATE OR REPLACE FUNCTION calculate_post_score(
  post_id UUID,
  created_at TIMESTAMP,
  like_count INT,
  comment_count INT
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

-- Create index for efficient post retrieval
CREATE INDEX IF NOT EXISTS idx_posts_score ON posts (
  created_at DESC,
  (calculate_post_score(id, created_at, 
    (SELECT COUNT(*) FROM likes WHERE post_id = posts.id),
    (SELECT COUNT(*) FROM comments WHERE post_id = posts.id)
  )) DESC
);
