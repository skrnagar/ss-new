
-- Drop existing tables and views
DROP VIEW IF EXISTS articles_with_author CASCADE;
DROP TABLE IF EXISTS bookmarks CASCADE;
DROP TABLE IF EXISTS article_likes CASCADE;
DROP TABLE IF EXISTS article_tags CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS articles CASCADE;

-- Create articles table
CREATE TABLE IF NOT EXISTS articles (
  id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  cover_image TEXT,
  excerpt TEXT,
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  read_time INTEGER,
  views INTEGER DEFAULT 0
);

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
  id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create junction tables
CREATE TABLE IF NOT EXISTS article_tags (
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

CREATE TABLE IF NOT EXISTS article_likes (
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (article_id, user_id)
);

CREATE TABLE IF NOT EXISTS bookmarks (
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (article_id, user_id)
);

-- Create view for articles with author info
CREATE OR REPLACE VIEW articles_with_author AS
SELECT 
  a.*,
  p.full_name as author_name,
  p.avatar_url as author_avatar
FROM 
  articles a
  LEFT JOIN profiles p ON a.author_id = p.id;

-- Enable RLS
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public articles are viewable by everyone"
ON articles FOR SELECT
USING (published = true);

CREATE POLICY "Users can create articles"
ON articles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own articles"
ON articles FOR UPDATE
TO authenticated
USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own articles"
ON articles FOR DELETE
TO authenticated
USING (auth.uid() = author_id);

-- Grant access
GRANT SELECT ON articles_with_author TO anon, authenticated;

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
