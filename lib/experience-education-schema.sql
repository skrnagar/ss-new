-- Experience and Education Schema
-- Run this in your Supabase SQL Editor

-- Create experience table
CREATE TABLE IF NOT EXISTS public.experiences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  employment_type VARCHAR(100), -- Full-time, Part-time, Contract, etc.
  location VARCHAR(255),
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN DEFAULT FALSE,
  description TEXT,
  skills TEXT[], -- Array of skills
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create education table
CREATE TABLE IF NOT EXISTS public.education (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  school VARCHAR(255) NOT NULL,
  degree VARCHAR(255), -- Bachelor's, Master's, PhD, etc.
  field_of_study VARCHAR(255),
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN DEFAULT FALSE,
  grade VARCHAR(50), -- GPA, percentage, etc.
  activities TEXT, -- Clubs, societies, etc.
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;

-- RLS Policies for experiences
DROP POLICY IF EXISTS "Public experiences are viewable by everyone" ON public.experiences;
CREATE POLICY "Public experiences are viewable by everyone"
  ON public.experiences FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert their own experiences" ON public.experiences;
CREATE POLICY "Users can insert their own experiences"
  ON public.experiences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own experiences" ON public.experiences;
CREATE POLICY "Users can update their own experiences"
  ON public.experiences FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own experiences" ON public.experiences;
CREATE POLICY "Users can delete their own experiences"
  ON public.experiences FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for education
DROP POLICY IF EXISTS "Public education is viewable by everyone" ON public.education;
CREATE POLICY "Public education is viewable by everyone"
  ON public.education FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert their own education" ON public.education;
CREATE POLICY "Users can insert their own education"
  ON public.education FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own education" ON public.education;
CREATE POLICY "Users can update their own education"
  ON public.education FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own education" ON public.education;
CREATE POLICY "Users can delete their own education"
  ON public.education FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_experiences_user_id ON public.experiences(user_id);
CREATE INDEX IF NOT EXISTS idx_experiences_start_date ON public.experiences(start_date DESC);
CREATE INDEX IF NOT EXISTS idx_education_user_id ON public.education(user_id);
CREATE INDEX IF NOT EXISTS idx_education_start_date ON public.education(start_date DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_experiences_updated_at ON public.experiences;
CREATE TRIGGER update_experiences_updated_at
    BEFORE UPDATE ON public.experiences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_education_updated_at ON public.education;
CREATE TRIGGER update_education_updated_at
    BEFORE UPDATE ON public.education
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

SELECT 'Experience and Education schema created successfully!' as result;
