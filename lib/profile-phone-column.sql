-- Optional contact field for profile edit UI (run once in Supabase SQL Editor if missing)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
