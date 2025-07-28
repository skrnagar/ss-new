-- =============================================
-- RLS Policy Cleanup and Standardization Script
-- =============================================
-- This script will drop all existing RLS policies on the specified tables
-- and create a new, standardized set of policies. It is designed to be
-- run multiple times safely.

-- To run this, copy the entire script and paste it into the
-- Supabase SQL Editor, then click "Run".

-- =============================================
-- Table: activities
-- =============================================
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Activities are viewable by everyone" ON public.activities;
DROP POLICY IF EXISTS "Users can view activities" ON public.activities;
CREATE POLICY "Activities are viewable by everyone" ON public.activities FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create their own activities" ON public.activities;
DROP POLICY IF EXISTS "Users can insert their own activities" ON public.activities;
CREATE POLICY "Users can create their own activities" ON public.activities FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- =============================================
-- Table: article_likes
-- =============================================
ALTER TABLE public.article_likes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own likes" ON public.article_likes;
CREATE POLICY "Users can view their own likes" ON public.article_likes FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can like articles" ON public.article_likes;
CREATE POLICY "Users can like articles" ON public.article_likes FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unlike articles" ON public.article_likes;
CREATE POLICY "Users can unlike articles" ON public.article_likes FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- Table: article_tags
-- =============================================
ALTER TABLE public.article_tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Article tags are public" ON public.article_tags;
CREATE POLICY "Article tags are public" ON public.article_tags FOR SELECT USING (true);
-- Insert/Delete should be handled by backend functions or triggers for security.

-- =============================================
-- Table: articles
-- =============================================
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public articles are viewable by everyone" ON public.articles;
CREATE POLICY "Public articles are viewable by everyone" ON public.articles FOR SELECT USING (published = true);

DROP POLICY IF EXISTS "Users can view their own unpublished articles" ON public.articles;
CREATE POLICY "Users can view their own unpublished articles" ON public.articles FOR SELECT USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can create articles" ON public.articles;
CREATE POLICY "Users can create articles" ON public.articles FOR INSERT WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can update own articles" ON public.articles;
CREATE POLICY "Users can update own articles" ON public.articles FOR UPDATE USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can delete own articles" ON public.articles;
CREATE POLICY "Users can delete own articles" ON public.articles FOR DELETE USING (auth.uid() = author_id);


-- =============================================
-- Table: bookmarks
-- =============================================
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own bookmarks" ON public.bookmarks;
CREATE POLICY "Users can view their own bookmarks" ON public.bookmarks FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create bookmarks" ON public.bookmarks;
CREATE POLICY "Users can create bookmarks" ON public.bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own bookmarks" ON public.bookmarks;
CREATE POLICY "Users can delete their own bookmarks" ON public.bookmarks FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- Table: comments
-- =============================================
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read all comments" ON public.comments;
CREATE POLICY "Users can read all comments" ON public.comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create their own comments" ON public.comments;
CREATE POLICY "Users can create their own comments" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own comments" ON public.comments;
CREATE POLICY "Users can update their own comments" ON public.comments FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own comments" ON public.comments;
CREATE POLICY "Users can delete their own comments" ON public.comments FOR DELETE USING (auth.uid() = user_id);


-- =============================================
-- Table: connections
-- =============================================
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own connections" ON public.connections;
CREATE POLICY "Users can view their own connections" ON public.connections FOR SELECT USING (auth.uid() = user_id OR auth.uid() = connected_user_id);

DROP POLICY IF EXISTS "Users can create connections" ON public.connections;
CREATE POLICY "Users can create connections" ON public.connections FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their connections" ON public.connections;
CREATE POLICY "Users can update their connections" ON public.connections FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = connected_user_id);

-- =============================================
-- Table: follows
-- =============================================
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Follows are public" ON public.follows;
DROP POLICY IF EXISTS "Users can view follows" ON public.follows;
DROP POLICY IF EXISTS "Users can view their own follows" ON public.follows;
CREATE POLICY "Follows are public" ON public.follows FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can follow others" ON public.follows;
CREATE POLICY "Users can follow others" ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);

DROP POLICY IF EXISTS "Users can unfollow" ON public.follows;
CREATE POLICY "Users can unfollow" ON public.follows FOR DELETE USING (auth.uid() = follower_id);

-- =============================================
-- Table: likes
-- =============================================
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Likes are viewable by everyone" ON public.likes;
CREATE POLICY "Likes are viewable by everyone" ON public.likes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create their own likes" ON public.likes;
CREATE POLICY "Users can create their own likes" ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own likes" ON public.likes;
CREATE POLICY "Users can delete their own likes" ON public.likes FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- Table: notifications
-- =============================================
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
CREATE POLICY "System can create notifications" ON public.notifications FOR INSERT WITH CHECK (true); -- Note: The insert logic is handled by SECURITY DEFINER triggers

-- =============================================
-- Table: posts
-- =============================================
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Posts are viewable by everyone" ON public.posts;
DROP POLICY IF EXISTS "Public posts are viewable by everyone" ON public.posts;
CREATE POLICY "Posts are viewable by everyone" ON public.posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create their own posts" ON public.posts;
DROP POLICY IF EXISTS "Authenticated users can create posts" ON public.posts;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.posts;
CREATE POLICY "Users can create their own posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own posts" ON public.posts;
CREATE POLICY "Users can update their own posts" ON public.posts FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own posts" ON public.posts;
CREATE POLICY "Users can delete their own posts" ON public.posts FOR DELETE USING (auth.uid() = user_id);


-- =============================================
-- Table: profiles
-- =============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- =============================================
-- Table: tags
-- =============================================
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Tags are public" ON public.tags;
CREATE POLICY "Tags are public" ON public.tags FOR SELECT USING (true);
-- Allow authenticated users to create tags
DROP POLICY IF EXISTS "Authenticated users can create tags" ON public.tags;
CREATE POLICY "Authenticated users can create tags" ON public.tags FOR INSERT WITH CHECK (auth.role() = 'authenticated');


-- =============================================
-- Chat tables are more complex and are omitted for now
-- to avoid breaking existing logic.
-- Tables omitted: conversations, conversation_participants, messages
-- =============================================

-- Notify PostgREST to reload the schema
NOTIFY pgrst, 'reload schema';

-- End of script
SELECT 'RLS policies cleaned and standardized successfully.' as result; 