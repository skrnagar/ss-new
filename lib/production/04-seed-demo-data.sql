-- Demo seed (idempotent). Safe to re-run.

INSERT INTO public.knowledge_resources (title, description, category, industry, tags, external_url, status, download_count)
SELECT 'Workplace Risk Assessment Template', 'Editable template for job hazard analysis and control hierarchy documentation.', 'risk-assessment', 'manufacturing', ARRAY['template', 'JHA', 'ISO 45001']::text[], 'https://www.osha.gov/sites/default/files/publications/osha3071.pdf', 'approved', 42
WHERE NOT EXISTS (SELECT 1 FROM public.knowledge_resources WHERE title = 'Workplace Risk Assessment Template');

INSERT INTO public.knowledge_resources (title, description, category, industry, tags, status, download_count)
SELECT 'Emergency Response Plan Checklist', 'Annual review checklist for evacuation routes, muster points, and drill records.', 'safety-plan', 'construction', ARRAY['emergency', 'checklist']::text[], 'approved', 18
WHERE NOT EXISTS (SELECT 1 FROM public.knowledge_resources WHERE title = 'Emergency Response Plan Checklist');

INSERT INTO public.knowledge_resources (title, description, category, industry, tags, external_url, status, download_count)
SELECT 'ISO 14001 Environmental Aspects Guide', 'Identify aspects, impacts, and operational controls for EMS audits.', 'compliance', 'general', ARRAY['ISO 14001', 'ESG']::text[], 'https://www.iso.org/standard/60857.html', 'approved', 31
WHERE NOT EXISTS (SELECT 1 FROM public.knowledge_resources WHERE title = 'ISO 14001 Environmental Aspects Guide');

INSERT INTO public.knowledge_resources (title, description, category, industry, tags, status, download_count)
SELECT 'Contractor Safety Orientation Deck', 'Site induction outline: PPE, permits, reporting, and stop work authority.', 'training', 'oil-gas', ARRAY['contractor', 'induction']::text[], 'approved', 9
WHERE NOT EXISTS (SELECT 1 FROM public.knowledge_resources WHERE title = 'Contractor Safety Orientation Deck');

WITH ranked AS (
  SELECT id, row_number() OVER (ORDER BY created_at NULLS LAST) AS rn FROM public.profiles LIMIT 3
)
UPDATE public.profiles p SET
  professional_role = 'auditor',
  auditor_verification_status = 'approved',
  auditor_verification_reviewed_at = now(),
  auditor_services_summary = 'ISO 45001 · site audits · construction & manufacturing',
  headline = COALESCE(p.headline, 'Independent EHS Auditor'),
  latitude = COALESCE(p.latitude, 37.7749),
  longitude = COALESCE(p.longitude, -122.4194)
FROM ranked r WHERE p.id = r.id AND r.rn = 1;

WITH ranked AS (
  SELECT id, row_number() OVER (ORDER BY created_at NULLS LAST) AS rn FROM public.profiles LIMIT 3
)
UPDATE public.profiles p SET
  professional_role = 'auditor',
  auditor_verification_status = 'pending',
  auditor_verification_requested_at = now(),
  auditor_services_summary = 'Fire safety & permit-to-work audits (pending approval)'
FROM ranked r WHERE p.id = r.id AND r.rn = 2;

INSERT INTO public.compliance_items (owner_id, title, framework, due_date, status, notes)
SELECT id, 'Annual OSHA 300A posting', 'OSHA', (CURRENT_DATE + INTERVAL '30 days')::date, 'in_progress', 'Verify establishment counts'
FROM public.profiles
WHERE NOT EXISTS (SELECT 1 FROM public.compliance_items c WHERE c.title = 'Annual OSHA 300A posting' AND c.owner_id = profiles.id)
ORDER BY created_at NULLS LAST LIMIT 1;

INSERT INTO public.incidents (reported_by, title, severity, category, status, occurred_at)
SELECT id, 'Near miss — forklift pedestrian interface', 'medium', 'material handling', 'open', now() - INTERVAL '3 days'
FROM public.profiles
WHERE NOT EXISTS (
  SELECT 1 FROM public.incidents i WHERE i.title = 'Near miss — forklift pedestrian interface' AND i.reported_by = profiles.id
)
ORDER BY created_at NULLS LAST LIMIT 1;

INSERT INTO public.esg_metric_entries (owner_id, period_month, metric_type, value, unit)
SELECT id, date_trunc('month', CURRENT_DATE)::date, 'scope1_tco2e', 124.5, 'tCO₂e'
FROM public.profiles
ORDER BY created_at NULLS LAST LIMIT 1
ON CONFLICT (owner_id, period_month, metric_type) DO NOTHING;

NOTIFY pgrst, 'reload schema';
