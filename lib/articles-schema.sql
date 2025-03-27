
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
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- Create article_tags junction table
CREATE TABLE IF NOT EXISTS article_tags (
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

-- Create article_likes table
CREATE TABLE IF NOT EXISTS article_likes (
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (article_id, user_id)
);

-- Create bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (article_id, user_id)
);

-- Create view for articles with author info
CREATE OR REPLACE VIEW articles_with_author AS
SELECT 
    articles.*,
    profiles.full_name,
    profiles.avatar_url
FROM 
    articles
    LEFT JOIN auth.users ON articles.author_id = auth.users.id
    LEFT JOIN profiles ON auth.users.id = profiles.id;

-- Enable RLS
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Public articles are viewable by everyone" ON articles;
DROP POLICY IF EXISTS "Users can create articles" ON articles;
DROP POLICY IF EXISTS "Users can update own articles" ON articles;
DROP POLICY IF EXISTS "Users can delete own articles" ON articles;

-- Create policies
CREATE POLICY "Public articles are viewable by everyone"
ON articles FOR SELECT
USING (published = true);

CREATE POLICY "Users can create articles"
ON articles FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can update own articles"
ON articles FOR UPDATE
TO authenticated
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can delete own articles"
ON articles FOR DELETE
TO authenticated
USING (auth.uid() = author_id);

-- Tags policies
CREATE POLICY "Tags are viewable by everyone"
ON tags FOR SELECT
TO PUBLIC
USING (true);

CREATE POLICY "Authenticated users can create tags"
ON tags FOR INSERT
TO authenticated
WITH CHECK (true);

-- Article tags policies
CREATE POLICY "Article tags are viewable by everyone"
ON article_tags FOR SELECT
TO PUBLIC
USING (true);

CREATE POLICY "Users can manage article tags"
ON article_tags 
FOR ALL
TO authenticated
USING (EXISTS (
  SELECT 1 FROM articles 
  WHERE articles.id = article_tags.article_id 
  AND articles.author_id = auth.uid()
));

-- Article likes policies
CREATE POLICY "Article likes are viewable by everyone"
ON article_likes FOR SELECT
TO PUBLIC
USING (true);

CREATE POLICY "Authenticated users can manage their likes"
ON article_likes
FOR ALL
TO authenticated
USING (user_id = auth.uid());

-- Bookmarks policies
CREATE POLICY "Users can view their own bookmarks"
ON bookmarks FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can manage their bookmarks"
ON bookmarks
FOR ALL
TO authenticated
USING (user_id = auth.uid());

-- Grant access to the view
GRANT SELECT ON articles_with_author TO anon, authenticated;

-- Create functions
CREATE OR REPLACE FUNCTION increment_article_views(article_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE articles
  SET views = views + 1
  WHERE id = article_id;
END;
$$ LANGUAGE plpgsql;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';
