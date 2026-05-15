-- Knowledge Center tables + RLS (no storage.objects policies — run 01b in Dashboard if uploads fail)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.knowledge_resources (
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
  contributed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.knowledge_resources ADD COLUMN IF NOT EXISTS expires_at DATE;
ALTER TABLE public.knowledge_resources ADD COLUMN IF NOT EXISTS download_count INTEGER DEFAULT 0;
ALTER TABLE public.knowledge_resources ALTER COLUMN status SET DEFAULT 'approved';

CREATE INDEX IF NOT EXISTS knowledge_resources_category_idx ON public.knowledge_resources (category);
CREATE INDEX IF NOT EXISTS knowledge_resources_industry_idx ON public.knowledge_resources (industry);
CREATE INDEX IF NOT EXISTS knowledge_resources_status_idx ON public.knowledge_resources (status);
CREATE INDEX IF NOT EXISTS knowledge_resources_contributor_idx ON public.knowledge_resources (contributed_by);
CREATE INDEX IF NOT EXISTS knowledge_resources_created_idx ON public.knowledge_resources (created_at DESC);

GRANT SELECT ON public.knowledge_resources TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.knowledge_resources TO authenticated;

CREATE OR REPLACE FUNCTION public.increment_knowledge_download(resource_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.knowledge_resources
  SET download_count = COALESCE(download_count, 0) + 1
  WHERE id = resource_id AND status = 'approved';
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_knowledge_download(UUID) TO anon, authenticated;

ALTER TABLE public.knowledge_resources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Approved resources are viewable by everyone" ON public.knowledge_resources;
CREATE POLICY "Approved resources are viewable by everyone"
  ON public.knowledge_resources FOR SELECT
  USING (status = 'approved' OR auth.uid() = contributed_by);

DROP POLICY IF EXISTS "Authenticated users can contribute resources" ON public.knowledge_resources;
CREATE POLICY "Authenticated users can contribute resources"
  ON public.knowledge_resources FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = contributed_by);

DROP POLICY IF EXISTS "Contributors can update their own resources" ON public.knowledge_resources;
CREATE POLICY "Contributors can update their own resources"
  ON public.knowledge_resources FOR UPDATE TO authenticated
  USING (auth.uid() = contributed_by);

DROP POLICY IF EXISTS "Contributors can delete their own resources" ON public.knowledge_resources;
CREATE POLICY "Contributors can delete their own resources"
  ON public.knowledge_resources FOR DELETE TO authenticated
  USING (auth.uid() = contributed_by);

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('knowledge-resources', 'knowledge-resources', true, 104857600, NULL)
ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 104857600, allowed_mime_types = NULL;

NOTIFY pgrst, 'reload schema';
