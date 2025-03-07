
-- Completely reset profiles RLS
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies on profiles to start clean
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Simple policy setup
CREATE POLICY "Everyone can view profiles" 
ON profiles FOR SELECT 
USING (true);

CREATE POLICY "Users can insert profiles" 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their profiles" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

-- Additional grants
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON profiles TO service_role;
