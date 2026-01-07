-- Fix Job Applications Access Issues
-- This allows job posters to view applicant details

-- First, ensure profiles table has necessary fields and RLS is configured
-- Add email column to profiles if it doesn't exist (for easy access)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Update existing profiles with email from auth.users
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN 
    SELECT id, email FROM auth.users
  LOOP
    UPDATE public.profiles 
    SET email = user_record.email 
    WHERE id = user_record.id AND (email IS NULL OR email = '');
  END LOOP;
END $$;

-- Create a function to auto-sync email from auth.users
CREATE OR REPLACE FUNCTION sync_profile_email()
RETURNS TRIGGER AS $$
BEGIN
  -- When a user signs up or changes email, update profiles table
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) 
  DO UPDATE SET email = EXCLUDED.email;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users (if not exists)
DROP TRIGGER IF EXISTS on_auth_user_email_change ON auth.users;
CREATE TRIGGER on_auth_user_email_change
  AFTER INSERT OR UPDATE OF email ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_profile_email();

-- Add RLS policy to allow job posters to view applicant profiles
DROP POLICY IF EXISTS "Job posters can view applicant profiles" ON public.profiles;
CREATE POLICY "Job posters can view applicant profiles"
  ON public.profiles FOR SELECT
  USING (
    -- Allow viewing own profile
    auth.uid() = id OR
    -- Allow viewing profiles of users who applied to jobs you posted
    EXISTS (
      SELECT 1 FROM job_applications ja
      JOIN jobs j ON j.id = ja.job_id
      WHERE ja.user_id = profiles.id
      AND (j.posted_by = auth.uid() OR EXISTS (
        SELECT 1 FROM company_admins ca
        WHERE ca.company_id = j.company_id
        AND ca.user_id = auth.uid()
      ))
    ) OR
    -- Allow viewing if they are your connection
    EXISTS (
      SELECT 1 FROM connections
      WHERE (user_id = auth.uid() AND connected_user_id = profiles.id)
      OR (user_id = profiles.id AND connected_user_id = auth.uid())
      AND status = 'accepted'
    ) OR
    -- Allow viewing if they follow you or you follow them
    EXISTS (
      SELECT 1 FROM followers
      WHERE (follower_id = auth.uid() AND following_id = profiles.id)
      OR (follower_id = profiles.id AND following_id = auth.uid())
    )
  );

-- Ensure the existing profile view policy is also present
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- Add index for better performance on job application queries
CREATE INDEX IF NOT EXISTS idx_job_applications_job_user 
  ON public.job_applications(job_id, user_id);

CREATE INDEX IF NOT EXISTS idx_jobs_posted_by 
  ON public.jobs(posted_by);

-- Verify the policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles' OR tablename = 'job_applications'
ORDER BY tablename, policyname;

SELECT 'Job applications access policies updated successfully!' as result;

