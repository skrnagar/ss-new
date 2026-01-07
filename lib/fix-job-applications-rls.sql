-- Fix Job Applications RLS - Allow Job Posters to View Applications
-- This fixes the issue where applications count shows but applications list is empty

-- Drop existing policies that might be too restrictive
DROP POLICY IF EXISTS "Users can view their own applications" ON public.job_applications;
DROP POLICY IF EXISTS "Job posters can view application status" ON public.job_applications;

-- Create comprehensive policy for viewing applications
-- Users can view:
-- 1. Their own applications
-- 2. Applications to jobs they posted
-- 3. Applications to jobs for companies they admin
CREATE POLICY "Users can view applications"
  ON public.job_applications FOR SELECT
  USING (
    -- View own applications
    auth.uid() = user_id 
    OR
    -- View applications to jobs you posted
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = job_applications.job_id 
      AND jobs.posted_by = auth.uid()
    )
    OR
    -- View applications to jobs for companies you admin
    EXISTS (
      SELECT 1 FROM jobs
      JOIN company_admins ON company_admins.company_id = jobs.company_id
      WHERE jobs.id = job_applications.job_id
      AND company_admins.user_id = auth.uid()
    )
  );

-- Keep existing insert policy
DROP POLICY IF EXISTS "Users can create applications" ON public.job_applications;
CREATE POLICY "Users can create applications"
  ON public.job_applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Update policy for job posters/company admins
DROP POLICY IF EXISTS "Job posters can update application status" ON public.job_applications;
CREATE POLICY "Job posters can update applications"
  ON public.job_applications FOR UPDATE
  USING (
    -- Job poster
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = job_applications.job_id 
      AND jobs.posted_by = auth.uid()
    )
    OR
    -- Company admin
    EXISTS (
      SELECT 1 FROM jobs
      JOIN company_admins ON company_admins.company_id = jobs.company_id
      WHERE jobs.id = job_applications.job_id
      AND company_admins.user_id = auth.uid()
    )
  );

-- Keep existing delete policy
DROP POLICY IF EXISTS "Users can delete their own applications" ON public.job_applications;
CREATE POLICY "Users can delete their applications"
  ON public.job_applications FOR DELETE
  USING (auth.uid() = user_id);

-- Also fix profiles table policy to ensure job posters can see applicant profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- Verify policies
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('job_applications', 'profiles')
ORDER BY tablename, policyname;

-- Test query (replace with your user_id and job_id)
-- SELECT COUNT(*) FROM job_applications WHERE job_id = 'your-job-id';

SELECT 'Job applications RLS policies fixed! Job posters can now view all applications.' as result;

