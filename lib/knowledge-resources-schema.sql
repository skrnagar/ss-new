-- Knowledge Center schema (Safety Shaper / SafetyShaper project)
-- Prefer: npm run db:bootstrap  (applies lib/production/*.sql via service role)
-- Or run lib/production/01-knowledge-tables.sql in Supabase SQL Editor.
-- Storage object policies: run lib/production/01b-storage-policies.sql in Dashboard if uploads fail.
-- Manual fallback: run the WHOLE file once in: Supabase Dashboard → SQL Editor → New query → Run
--
-- ERRORS YOU MIGHT SEE BEFORE RUNNING THIS:
-- • POST .../rest/v1/knowledge_resources → 404 = table not in DB or PostgREST cache stale (this script fixes both).
-- • POST .../storage/v1/object/knowledge-resources/... → 400 = usually RLS on storage.objects, or bucket MIME/size limits.
--
-- If uploads fail with 400: run section 4 again; ensure allowed_mime_types is NULL (all types).
-- If the bucket was created only in Dashboard: still run section 4 policies + UPDATE on storage.buckets for MIME.
-- If inserts fail with 404: table missing — run section 1; then NOTIFY at end refreshes PostgREST.

-- 1. Table -------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS knowledge_resources (
  id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  industry TEXT,
  tags TEXT[],
  file_url TEXT,
  file_name TEXT,
  file_size BIGINT,
  file_type TEXT,
  external_url TEXT,
  expires_at DATE,
  download_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'approved'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  contributed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Backfill new columns if the table already existed from an older revision.
ALTER TABLE knowledge_resources
  ADD COLUMN IF NOT EXISTS expires_at DATE;
ALTER TABLE knowledge_resources
  ADD COLUMN IF NOT EXISTS download_count INTEGER DEFAULT 0;
ALTER TABLE knowledge_resources
  ALTER COLUMN status SET DEFAULT 'approved';

CREATE INDEX IF NOT EXISTS knowledge_resources_category_idx
  ON knowledge_resources (category);
CREATE INDEX IF NOT EXISTS knowledge_resources_industry_idx
  ON knowledge_resources (industry);
CREATE INDEX IF NOT EXISTS knowledge_resources_status_idx
  ON knowledge_resources (status);
CREATE INDEX IF NOT EXISTS knowledge_resources_contributor_idx
  ON knowledge_resources (contributed_by);
CREATE INDEX IF NOT EXISTS knowledge_resources_created_idx
  ON knowledge_resources (created_at DESC);

-- API access (RLS still applies per row)
GRANT SELECT ON knowledge_resources TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON knowledge_resources TO authenticated;

-- 2. Download counter RPC ----------------------------------------------------
CREATE OR REPLACE FUNCTION increment_knowledge_download(resource_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE knowledge_resources
  SET download_count = COALESCE(download_count, 0) + 1
  WHERE id = resource_id AND status = 'approved';
END;
$$;

GRANT EXECUTE ON FUNCTION increment_knowledge_download(UUID)
  TO anon, authenticated;

-- 3. RLS ---------------------------------------------------------------------
ALTER TABLE knowledge_resources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Approved resources are viewable by everyone"
  ON knowledge_resources;
CREATE POLICY "Approved resources are viewable by everyone"
  ON knowledge_resources FOR SELECT
  USING (status = 'approved' OR auth.uid() = contributed_by);

DROP POLICY IF EXISTS "Authenticated users can contribute resources"
  ON knowledge_resources;
CREATE POLICY "Authenticated users can contribute resources"
  ON knowledge_resources FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = contributed_by);

DROP POLICY IF EXISTS "Contributors can update their own resources"
  ON knowledge_resources;
CREATE POLICY "Contributors can update their own resources"
  ON knowledge_resources FOR UPDATE
  TO authenticated
  USING (auth.uid() = contributed_by);

DROP POLICY IF EXISTS "Contributors can delete their own resources"
  ON knowledge_resources;
CREATE POLICY "Contributors can delete their own resources"
  ON knowledge_resources FOR DELETE
  TO authenticated
  USING (auth.uid() = contributed_by);

-- 4. Storage bucket ----------------------------------------------------------
-- Public bucket; allowed_mime_types NULL = accept all types (PDF, Office, images, video).
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('knowledge-resources', 'knowledge-resources', true, 104857600, NULL)
ON CONFLICT (id) DO UPDATE
  SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = NULL;

UPDATE storage.buckets
SET allowed_mime_types = NULL
WHERE id = 'knowledge-resources';

DROP POLICY IF EXISTS "Knowledge resources are publicly readable"
  ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload knowledge resources"
  ON storage.objects;
DROP POLICY IF EXISTS "Users can manage their own knowledge uploads"
  ON storage.objects;
DROP POLICY IF EXISTS "knowledge_resources_select_public"
  ON storage.objects;
DROP POLICY IF EXISTS "knowledge_resources_insert_authenticated"
  ON storage.objects;
DROP POLICY IF EXISTS "knowledge_resources_update_owner"
  ON storage.objects;
DROP POLICY IF EXISTS "knowledge_resources_delete_owner"
  ON storage.objects;

CREATE POLICY "knowledge_resources_select_public"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'knowledge-resources');

CREATE POLICY "knowledge_resources_insert_authenticated"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'knowledge-resources'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "knowledge_resources_update_owner"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'knowledge-resources'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'knowledge-resources'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "knowledge_resources_delete_owner"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'knowledge-resources'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 5. Refresh PostgREST schema cache -----------------------------------------
NOTIFY pgrst, 'reload schema';
