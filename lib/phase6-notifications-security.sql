-- Phase 6 — Notifications & security (run in Supabase SQL Editor)
--
-- IN-APP: Existing `notifications` table + Realtime unchanged.
--
-- EMAIL (transactional via Resend from app):
--   Env: RESEND_API_KEY, RESEND_FROM_EMAIL (or RESEND_FROM), NEXT_PUBLIC_SITE_URL
--   Code: lib/email-resend.ts, e.g. job alerts in app/api/jobs/notify-subscribers/route.ts
--
-- AUTH EMAILS (magic link, confirm signup, reset password) via Resend SMTP:
--   Dashboard → Project Settings → Authentication → SMTP Settings → Enable Custom SMTP
--   Resend: Host smtp.resend.com, Port 465, Username "resend", Password = Resend API key,
--   Sender = verified domain address. See: https://supabase.com/docs/guides/auth/auth-smtp
--
-- MFA / 2FA (TOTP):
--   Dashboard → Authentication → Providers → Multi-factor authentication → enable TOTP.
--   App UI: /settings (enroll / unenroll) and login flow for email+password users.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS email_job_alerts BOOLEAN NOT NULL DEFAULT true;

COMMENT ON COLUMN profiles.email_job_alerts IS
  'When false, transactional emails (e.g. job alert match) are skipped; in-app notifications still apply.';
