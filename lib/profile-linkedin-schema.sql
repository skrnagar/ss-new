-- LinkedIn-style professional profile extensions (Safety Shaper)
-- Run once in Supabase → SQL Editor after base profiles / experiences exist.

-- Profiles: visibility, cover, CV metadata, parsed resume stub ----------------
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS position TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_profile_public BOOLEAN DEFAULT TRUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS recruiter_visible BOOLEAN DEFAULT TRUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS auditor_visible BOOLEAN DEFAULT TRUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cv_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cv_visibility TEXT DEFAULT 'private';
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_cv_visibility_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_cv_visibility_check
  CHECK (cv_visibility IS NULL OR cv_visibility IN ('private', 'public'));

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS resume_parsed_json JSONB;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS years_experience NUMERIC(5, 1);

UPDATE profiles SET is_profile_public = TRUE WHERE is_profile_public IS NULL;

-- Public profile visibility (replaces open SELECT) -----------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "profiles_select_public_or_own" ON profiles;
CREATE POLICY "profiles_select_public_or_own"
  ON profiles FOR SELECT
  USING (
    (COALESCE(is_profile_public, TRUE) = TRUE)
    OR (auth.uid() = id)
  );

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Experience: company logo ------------------------------------------------------
ALTER TABLE experiences ADD COLUMN IF NOT EXISTS company_logo_url TEXT;

-- Skills + endorsements ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS profile_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  proficiency SMALLINT DEFAULT 3 CHECK (proficiency BETWEEN 1 AND 5),
  industry_tag TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT profile_skills_user_name_unique UNIQUE (user_id, name)
);

CREATE TABLE IF NOT EXISTS profile_skill_endorsements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  skill_id UUID NOT NULL REFERENCES profile_skills(id) ON DELETE CASCADE,
  endorser_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT profile_skill_endorsements_unique UNIQUE (skill_id, endorser_id)
);

CREATE TABLE IF NOT EXISTS profile_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  project_url TEXT,
  start_date DATE,
  end_date DATE,
  is_international BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profile_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  achieved_at DATE,
  award_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS helper: profile owner or public profile ----------------------------------
CREATE OR REPLACE FUNCTION public.profile_is_visible(pid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((SELECT is_profile_public FROM profiles WHERE id = pid), TRUE)
    OR auth.uid() = pid;
$$;

GRANT EXECUTE ON FUNCTION public.profile_is_visible(UUID) TO anon, authenticated;

ALTER TABLE profile_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_skill_endorsements ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_achievements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profile_skills_select" ON profile_skills;
CREATE POLICY "profile_skills_select" ON profile_skills FOR SELECT
  USING (public.profile_is_visible(user_id));

DROP POLICY IF EXISTS "profile_skills_mutate_own" ON profile_skills;
DROP POLICY IF EXISTS "profile_skills_insert_own" ON profile_skills;
DROP POLICY IF EXISTS "profile_skills_update_own" ON profile_skills;
DROP POLICY IF EXISTS "profile_skills_delete_own" ON profile_skills;

CREATE POLICY "profile_skills_insert_own" ON profile_skills FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profile_skills_update_own" ON profile_skills FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profile_skills_delete_own" ON profile_skills FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "profile_endorsements_select" ON profile_skill_endorsements;
CREATE POLICY "profile_endorsements_select" ON profile_skill_endorsements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profile_skills s
      WHERE s.id = skill_id AND public.profile_is_visible(s.user_id)
    )
  );

DROP POLICY IF EXISTS "profile_endorsements_insert" ON profile_skill_endorsements;
CREATE POLICY "profile_endorsements_insert" ON profile_skill_endorsements FOR INSERT
  TO authenticated
  WITH CHECK (
    endorser_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profile_skills s
      WHERE s.id = skill_id AND s.user_id <> auth.uid()
    )
  );

DROP POLICY IF EXISTS "profile_endorsements_delete_own" ON profile_skill_endorsements;
CREATE POLICY "profile_endorsements_delete_own" ON profile_skill_endorsements FOR DELETE
  TO authenticated
  USING (endorser_id = auth.uid());

DROP POLICY IF EXISTS "profile_projects_select" ON profile_projects;
CREATE POLICY "profile_projects_select" ON profile_projects FOR SELECT
  USING (public.profile_is_visible(user_id));

DROP POLICY IF EXISTS "profile_projects_mutate_own" ON profile_projects;
DROP POLICY IF EXISTS "profile_projects_insert_own" ON profile_projects;
DROP POLICY IF EXISTS "profile_projects_update_own" ON profile_projects;
DROP POLICY IF EXISTS "profile_projects_delete_own" ON profile_projects;

CREATE POLICY "profile_projects_insert_own" ON profile_projects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profile_projects_update_own" ON profile_projects FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profile_projects_delete_own" ON profile_projects FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "profile_achievements_select" ON profile_achievements;
CREATE POLICY "profile_achievements_select" ON profile_achievements FOR SELECT
  USING (public.profile_is_visible(user_id));

DROP POLICY IF EXISTS "profile_achievements_mutate_own" ON profile_achievements;
DROP POLICY IF EXISTS "profile_achievements_insert_own" ON profile_achievements;
DROP POLICY IF EXISTS "profile_achievements_update_own" ON profile_achievements;
DROP POLICY IF EXISTS "profile_achievements_delete_own" ON profile_achievements;

CREATE POLICY "profile_achievements_insert_own" ON profile_achievements FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profile_achievements_update_own" ON profile_achievements FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profile_achievements_delete_own" ON profile_achievements FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Covers / CV: use post-images (covers/*) and post-documents (resumes/*) — RLS already on app buckets.
NOTIFY pgrst, 'reload schema';
