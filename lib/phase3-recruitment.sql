-- Phase 3: Recruitment & networking (run in Supabase SQL Editor)

-- 1) Notifications: job alerts + optional email tracking --------------------
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMPTZ;

ALTER TABLE notifications DROP CONSTRAINT IF EXISTS valid_notification_type;
ALTER TABLE notifications ADD CONSTRAINT valid_notification_type CHECK (
  type IN (
    'connection_request',
    'connection_accepted',
    'connection_withdrawn',
    'new_follower',
    'post_like',
    'post_comment',
    'job_alert'
  )
);

-- 2) Jobs: EHS / sector grouping ---------------------------------------------
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS job_category VARCHAR(64) DEFAULT 'general';
COMMENT ON COLUMN jobs.job_category IS 'general | ehs_safety | environmental | compliance';

CREATE INDEX IF NOT EXISTS idx_jobs_job_category ON public.jobs(job_category);

-- 3) Job alerts: industry / sector filter ------------------------------------
ALTER TABLE job_alerts ADD COLUMN IF NOT EXISTS industry TEXT;

NOTIFY pgrst, 'reload schema';
