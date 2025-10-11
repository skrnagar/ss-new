-- Jobs Schema - LinkedIn-style Job Posting System
-- Run this in your Supabase SQL Editor

-- Create jobs table
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  company_name VARCHAR(255) NOT NULL, -- Fallback if no company page
  posted_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  employment_type VARCHAR(100), -- Full-time, Part-time, Contract, etc.
  workplace_type VARCHAR(100), -- On-site, Remote, Hybrid
  location VARCHAR(255),
  salary_min INTEGER,
  salary_max INTEGER,
  salary_currency VARCHAR(10) DEFAULT 'USD',
  experience_level VARCHAR(100), -- Entry, Mid, Senior, Executive
  industry VARCHAR(255),
  skills_required TEXT[], -- Array of required skills
  benefits TEXT[], -- Array of benefits
  application_deadline DATE,
  is_active BOOLEAN DEFAULT TRUE,
  views_count INTEGER DEFAULT 0,
  applications_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create job_applications table
CREATE TABLE IF NOT EXISTS public.job_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  cover_letter TEXT,
  resume_url TEXT,
  status VARCHAR(50) DEFAULT 'pending', -- pending, reviewed, shortlisted, rejected, accepted
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT, -- Internal notes from recruiter
  UNIQUE(job_id, user_id) -- One application per job per user
);

-- Create saved_jobs table (bookmarks)
CREATE TABLE IF NOT EXISTS public.saved_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(job_id, user_id)
);

-- Create job_alerts table
CREATE TABLE IF NOT EXISTS public.job_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  keywords TEXT[],
  location VARCHAR(255),
  employment_type VARCHAR(100),
  experience_level VARCHAR(100),
  frequency VARCHAR(50) DEFAULT 'daily', -- daily, weekly, instant
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_sent_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for jobs
DROP POLICY IF EXISTS "Public jobs are viewable by everyone" ON public.jobs;
CREATE POLICY "Public jobs are viewable by everyone"
  ON public.jobs FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Authenticated users can create jobs" ON public.jobs;
CREATE POLICY "Authenticated users can create jobs"
  ON public.jobs FOR INSERT
  WITH CHECK (auth.uid() = posted_by);

DROP POLICY IF EXISTS "Job posters can update their jobs" ON public.jobs;
CREATE POLICY "Job posters can update their jobs"
  ON public.jobs FOR UPDATE
  USING (
    auth.uid() = posted_by OR
    EXISTS (
      SELECT 1 FROM company_admins 
      WHERE company_admins.company_id = jobs.company_id 
      AND company_admins.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Job posters can delete their jobs" ON public.jobs;
CREATE POLICY "Job posters can delete their jobs"
  ON public.jobs FOR DELETE
  USING (
    auth.uid() = posted_by OR
    EXISTS (
      SELECT 1 FROM company_admins 
      WHERE company_admins.company_id = jobs.company_id 
      AND company_admins.user_id = auth.uid()
    )
  );

-- RLS Policies for job_applications
DROP POLICY IF EXISTS "Users can view their own applications" ON public.job_applications;
CREATE POLICY "Users can view their own applications"
  ON public.job_applications FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = job_applications.job_id 
      AND jobs.posted_by = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM jobs
      JOIN company_admins ON company_admins.company_id = jobs.company_id
      WHERE jobs.id = job_applications.job_id
      AND company_admins.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create applications" ON public.job_applications;
CREATE POLICY "Users can create applications"
  ON public.job_applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Job posters can update application status" ON public.job_applications;
CREATE POLICY "Job posters can update application status"
  ON public.job_applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = job_applications.job_id 
      AND jobs.posted_by = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM jobs
      JOIN company_admins ON company_admins.company_id = jobs.company_id
      WHERE jobs.id = job_applications.job_id
      AND company_admins.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete their own applications" ON public.job_applications;
CREATE POLICY "Users can delete their own applications"
  ON public.job_applications FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for saved_jobs
DROP POLICY IF EXISTS "Users can view their saved jobs" ON public.saved_jobs;
CREATE POLICY "Users can view their saved jobs"
  ON public.saved_jobs FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can save jobs" ON public.saved_jobs;
CREATE POLICY "Users can save jobs"
  ON public.saved_jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unsave jobs" ON public.saved_jobs;
CREATE POLICY "Users can unsave jobs"
  ON public.saved_jobs FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for job_alerts
DROP POLICY IF EXISTS "Users can manage their own alerts" ON public.job_alerts;
CREATE POLICY "Users can manage their own alerts"
  ON public.job_alerts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON public.jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_posted_by ON public.jobs(posted_by);
CREATE INDEX IF NOT EXISTS idx_jobs_is_active ON public.jobs(is_active);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON public.jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON public.jobs(location);
CREATE INDEX IF NOT EXISTS idx_jobs_employment_type ON public.jobs(employment_type);
CREATE INDEX IF NOT EXISTS idx_jobs_experience_level ON public.jobs(experience_level);
CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON public.job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_user_id ON public.job_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON public.job_applications(status);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_user_id ON public.saved_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_job_id ON public.saved_jobs(job_id);

-- Function to increment views count
CREATE OR REPLACE FUNCTION increment_job_views()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE jobs 
  SET views_count = views_count + 1 
  WHERE id = NEW.job_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update applications count
CREATE OR REPLACE FUNCTION update_job_applications_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE jobs 
    SET applications_count = applications_count + 1 
    WHERE id = NEW.job_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE jobs 
    SET applications_count = GREATEST(0, applications_count - 1) 
    WHERE id = OLD.job_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for applications count
DROP TRIGGER IF EXISTS trigger_update_job_applications_count ON public.job_applications;
CREATE TRIGGER trigger_update_job_applications_count
  AFTER INSERT OR DELETE ON public.job_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_job_applications_count();

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_jobs_updated_at ON public.jobs;
CREATE TRIGGER update_jobs_updated_at
    BEFORE UPDATE ON public.jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

SELECT 'Jobs schema created successfully!' as result;
