-- Phase 5: Operations / ESG dashboards, LMS skeleton, compliance tracker
-- Run in Supabase SQL Editor after profiles exist.

-- ---------------------------------------------------------------------------
-- Incidents (KPIs & real-time trend source)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reported_by UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  category TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'closed')),
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_incidents_reported_by ON public.incidents (reported_by);
CREATE INDEX IF NOT EXISTS idx_incidents_occurred_at ON public.incidents (occurred_at DESC);

ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS incidents_select_own ON public.incidents;
CREATE POLICY incidents_select_own ON public.incidents
  FOR SELECT TO authenticated USING (reported_by = auth.uid());

DROP POLICY IF EXISTS incidents_insert_own ON public.incidents;
CREATE POLICY incidents_insert_own ON public.incidents
  FOR INSERT TO authenticated WITH CHECK (reported_by = auth.uid());

DROP POLICY IF EXISTS incidents_update_own ON public.incidents;
CREATE POLICY incidents_update_own ON public.incidents
  FOR UPDATE TO authenticated USING (reported_by = auth.uid());

-- ---------------------------------------------------------------------------
-- ESG metric entries (monthly / periodic KPIs)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.esg_metric_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  period_month DATE NOT NULL,
  metric_type TEXT NOT NULL,
  value NUMERIC,
  unit TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (owner_id, period_month, metric_type)
);

CREATE INDEX IF NOT EXISTS idx_esg_owner_period ON public.esg_metric_entries (owner_id, period_month);

ALTER TABLE public.esg_metric_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS esg_select_own ON public.esg_metric_entries;
CREATE POLICY esg_select_own ON public.esg_metric_entries
  FOR SELECT TO authenticated USING (owner_id = auth.uid());

DROP POLICY IF EXISTS esg_mutate_own ON public.esg_metric_entries;
CREATE POLICY esg_mutate_own ON public.esg_metric_entries
  FOR ALL TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

-- ---------------------------------------------------------------------------
-- LMS: courses, modules (video / article / quiz in one row via module_type)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.lms_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.lms_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.lms_courses (id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  title TEXT NOT NULL,
  module_type TEXT NOT NULL CHECK (module_type IN ('video', 'article', 'quiz')),
  video_url TEXT,
  content_md TEXT,
  quiz_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lms_modules_course ON public.lms_modules (course_id);

CREATE TABLE IF NOT EXISTS public.lms_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.lms_courses (id) ON DELETE CASCADE,
  progress_percent SMALLINT NOT NULL DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  completed_at TIMESTAMPTZ,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id)
);

CREATE TABLE IF NOT EXISTS public.lms_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.lms_courses (id) ON DELETE CASCADE,
  credential_code TEXT NOT NULL UNIQUE,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id)
);

-- Catalog reads use the anon key when logged out; enrollments/certificates stay authenticated-only.
GRANT SELECT ON public.lms_courses TO anon, authenticated;
GRANT SELECT ON public.lms_modules TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lms_enrollments TO authenticated;
GRANT SELECT, INSERT ON public.lms_certificates TO authenticated;

ALTER TABLE public.lms_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_certificates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS lms_courses_select_published ON public.lms_courses;
CREATE POLICY lms_courses_select_published ON public.lms_courses
  FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS lms_modules_select_published ON public.lms_modules;
CREATE POLICY lms_modules_select_published ON public.lms_modules
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.lms_courses c WHERE c.id = course_id AND c.is_published = true)
  );

DROP POLICY IF EXISTS lms_enrollments_own ON public.lms_enrollments;
CREATE POLICY lms_enrollments_own ON public.lms_enrollments
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS lms_certificates_own ON public.lms_certificates;
CREATE POLICY lms_certificates_own ON public.lms_certificates
  FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS lms_certificates_insert_own ON public.lms_certificates;
CREATE POLICY lms_certificates_insert_own ON public.lms_certificates
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Compliance obligations (personal / workspace tracker for scaffold)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.compliance_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  framework TEXT,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (
    status IN ('not_started', 'in_progress', 'complete', 'overdue')
  ),
  notes TEXT,
  evidence_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_compliance_owner ON public.compliance_items (owner_id);
CREATE INDEX IF NOT EXISTS idx_compliance_due ON public.compliance_items (due_date);

ALTER TABLE public.compliance_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS compliance_select_own ON public.compliance_items;
CREATE POLICY compliance_select_own ON public.compliance_items
  FOR SELECT TO authenticated USING (owner_id = auth.uid());

DROP POLICY IF EXISTS compliance_mutate_own ON public.compliance_items;
CREATE POLICY compliance_mutate_own ON public.compliance_items
  FOR ALL TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Seed: sample published course + quiz (optional demo)
-- ---------------------------------------------------------------------------
INSERT INTO public.lms_courses (slug, title, description, duration_minutes, is_published)
VALUES (
  'ehs-induction-starter',
  'EHS Induction (starter)',
  'Intro to Safety Shaper training scaffold: video placeholder, reading, and a short quiz.',
  30,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.lms_modules (course_id, sort_order, title, module_type, video_url, content_md, quiz_json)
SELECT c.id,
  1,
  'Safety culture overview',
  'video',
  null,
  null,
  null
FROM public.lms_courses c
WHERE c.slug = 'ehs-induction-starter'
  AND NOT EXISTS (
    SELECT 1 FROM public.lms_modules m WHERE m.course_id = c.id AND m.sort_order = 1
  );

INSERT INTO public.lms_modules (course_id, sort_order, title, module_type, video_url, content_md, quiz_json)
SELECT c.id,
  2,
  'Hazard recognition basics',
  'article',
  null,
  '# Hazard recognition

Use **STOP**, **THINK**, and **ACT** before tasks change. Document near misses to learn.',
  null
FROM public.lms_courses c
WHERE c.slug = 'ehs-induction-starter'
  AND NOT EXISTS (
    SELECT 1 FROM public.lms_modules m WHERE m.course_id = c.id AND m.sort_order = 2
  );

INSERT INTO public.lms_modules (course_id, sort_order, title, module_type, video_url, content_md, quiz_json)
SELECT c.id,
  3,
  'Checkpoint quiz',
  'quiz',
  null,
  null,
  '{"questions":[{"prompt":"What should you do before starting unfamiliar work?","choices":["Skip the brief to save time","Stop, think, and verify controls","Wait for someone else to decide"],"correctIndex":1},{"prompt":"Near misses should be:","choices":["Ignored if no one was hurt","Reported and reviewed for learning","Only discussed verbally"],"correctIndex":1}]}'::jsonb
FROM public.lms_courses c
WHERE c.slug = 'ehs-induction-starter'
  AND NOT EXISTS (
    SELECT 1 FROM public.lms_modules m WHERE m.course_id = c.id AND m.sort_order = 3
  );

NOTIFY pgrst, 'reload schema';
