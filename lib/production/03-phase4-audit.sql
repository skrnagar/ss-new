-- Phase 4: auditor profiles + bookings (no storage.objects policies)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS professional_role TEXT NOT NULL DEFAULT 'job_seeker';
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_professional_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_professional_role_check
  CHECK (professional_role IN ('job_seeker', 'recruiter', 'auditor'));

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS auditor_verification_status TEXT NOT NULL DEFAULT 'none';
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_auditor_verification_status_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_auditor_verification_status_check
  CHECK (auditor_verification_status IN ('none', 'pending', 'approved', 'rejected'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS auditor_verification_requested_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS auditor_verification_reviewed_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS auditor_verification_notes TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS auditor_services_summary TEXT;

CREATE INDEX IF NOT EXISTS idx_profiles_professional_role ON public.profiles (professional_role);
CREATE INDEX IF NOT EXISTS idx_profiles_auditor_verification ON public.profiles (auditor_verification_status);
CREATE INDEX IF NOT EXISTS idx_profiles_geo ON public.profiles (latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.audit_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  auditor_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'requested'
    CHECK (status IN ('requested', 'confirmed', 'in_progress', 'completed', 'cancelled', 'declined')),
  scheduled_start TIMESTAMPTZ,
  scheduled_end TIMESTAMPTZ,
  site_address TEXT,
  site_notes TEXT,
  scope_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT audit_bookings_distinct_parties CHECK (client_id <> auditor_id)
);

CREATE INDEX IF NOT EXISTS idx_audit_bookings_client ON public.audit_bookings (client_id);
CREATE INDEX IF NOT EXISTS idx_audit_bookings_auditor ON public.audit_bookings (auditor_id);
CREATE INDEX IF NOT EXISTS idx_audit_bookings_status ON public.audit_bookings (status);

CREATE TABLE IF NOT EXISTS public.audit_checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.audit_bookings (id) ON DELETE CASCADE,
  sort_order INT NOT NULL DEFAULT 0,
  title TEXT NOT NULL,
  description TEXT,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_audit_checklist_booking ON public.audit_checklist_items (booking_id);

CREATE TABLE IF NOT EXISTS public.audit_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.audit_bookings (id) ON DELETE CASCADE,
  checklist_item_id UUID REFERENCES public.audit_checklist_items (id) ON DELETE SET NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT,
  uploaded_by UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_evidence_booking ON public.audit_evidence (booking_id);

CREATE TABLE IF NOT EXISTS public.audit_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.audit_bookings (id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  auditor_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (booking_id)
);

CREATE INDEX IF NOT EXISTS idx_audit_reviews_auditor ON public.audit_reviews (auditor_id);

GRANT SELECT, INSERT, UPDATE ON public.audit_bookings TO authenticated;
GRANT SELECT, UPDATE ON public.audit_checklist_items TO authenticated;
GRANT SELECT, INSERT ON public.audit_evidence TO authenticated;
GRANT SELECT, INSERT ON public.audit_reviews TO authenticated;
GRANT SELECT ON public.audit_reviews TO anon;

CREATE OR REPLACE FUNCTION public.seed_audit_checklist_for_booking()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.audit_checklist_items (booking_id, sort_order, title, description)
  VALUES
    (NEW.id, 1, 'Opening meeting & scope', 'Confirm scope, criteria, attendees, and confidentiality.'),
    (NEW.id, 2, 'Document & records review', 'Sample permits, training, incidents, risk registers, and KPIs.'),
    (NEW.id, 3, 'Site / field observations', 'Walkthrough, PPE, controls, contractors, emergency readiness.'),
    (NEW.id, 4, 'Findings & objective evidence', 'Record nonconformities, positives, and linked evidence.'),
    (NEW.id, 5, 'Closing & agreed actions', 'Summarize outcomes, actions, owners, and follow-up timing.');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_booking_checklist ON public.audit_bookings;
CREATE TRIGGER trg_audit_booking_checklist
  AFTER INSERT ON public.audit_bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.seed_audit_checklist_for_booking();

ALTER TABLE public.audit_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS audit_bookings_select ON public.audit_bookings;
CREATE POLICY audit_bookings_select ON public.audit_bookings FOR SELECT USING (client_id = auth.uid() OR auditor_id = auth.uid());

DROP POLICY IF EXISTS audit_bookings_insert ON public.audit_bookings;
CREATE POLICY audit_bookings_insert ON public.audit_bookings FOR INSERT WITH CHECK (client_id = auth.uid());

DROP POLICY IF EXISTS audit_bookings_update ON public.audit_bookings;
CREATE POLICY audit_bookings_update ON public.audit_bookings FOR UPDATE USING (client_id = auth.uid() OR auditor_id = auth.uid());

DROP POLICY IF EXISTS audit_checklist_select ON public.audit_checklist_items;
CREATE POLICY audit_checklist_select ON public.audit_checklist_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.audit_bookings b WHERE b.id = booking_id AND (b.client_id = auth.uid() OR b.auditor_id = auth.uid()))
);

DROP POLICY IF EXISTS audit_checklist_update ON public.audit_checklist_items;
CREATE POLICY audit_checklist_update ON public.audit_checklist_items FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.audit_bookings b WHERE b.id = booking_id AND (b.client_id = auth.uid() OR b.auditor_id = auth.uid()))
);

DROP POLICY IF EXISTS audit_evidence_select ON public.audit_evidence;
CREATE POLICY audit_evidence_select ON public.audit_evidence FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.audit_bookings b WHERE b.id = booking_id AND (b.client_id = auth.uid() OR b.auditor_id = auth.uid()))
);

DROP POLICY IF EXISTS audit_evidence_insert ON public.audit_evidence;
CREATE POLICY audit_evidence_insert ON public.audit_evidence FOR INSERT WITH CHECK (
  uploaded_by = auth.uid()
  AND EXISTS (SELECT 1 FROM public.audit_bookings b WHERE b.id = booking_id AND (b.client_id = auth.uid() OR b.auditor_id = auth.uid()))
);

DROP POLICY IF EXISTS audit_reviews_select ON public.audit_reviews;
CREATE POLICY audit_reviews_select ON public.audit_reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS audit_reviews_insert ON public.audit_reviews;
CREATE POLICY audit_reviews_insert ON public.audit_reviews FOR INSERT WITH CHECK (
  reviewer_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.audit_bookings b
    WHERE b.id = booking_id AND b.client_id = auth.uid() AND b.status = 'completed' AND b.auditor_id = auditor_id
  )
);

-- Public read for approved auditors on find map (anon + authenticated)
DROP POLICY IF EXISTS profiles_select_approved_auditors ON public.profiles;
CREATE POLICY profiles_select_approved_auditors ON public.profiles FOR SELECT USING (
  professional_role = 'auditor' AND auditor_verification_status = 'approved'
  OR auth.uid() = id
);

INSERT INTO storage.buckets (id, name, public) VALUES ('audit-evidence', 'audit-evidence', false) ON CONFLICT (id) DO NOTHING;

NOTIFY pgrst, 'reload schema';
