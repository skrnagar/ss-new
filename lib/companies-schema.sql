-- Companies Schema - LinkedIn-style Company Pages
-- Run this in your Supabase SQL Editor

-- Create companies table
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(255) NOT NULL UNIQUE, -- URL-friendly name
  tagline VARCHAR(255), -- Short description (like "Building a safer world")
  description TEXT,
  industry VARCHAR(255),
  company_size VARCHAR(100), -- "1-10", "11-50", "51-200", etc.
  company_type VARCHAR(100), -- "Public", "Private", "Non-profit", etc.
  founded_year INTEGER,
  website_url VARCHAR(500),
  linkedin_url VARCHAR(500),
  twitter_url VARCHAR(500),
  headquarters_location VARCHAR(255),
  specialties TEXT[], -- Array of specialties
  logo_url TEXT,
  cover_image_url TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  verified BOOLEAN DEFAULT FALSE,
  employee_count INTEGER DEFAULT 0,
  follower_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create company_admins table (for managing who can edit company page)
CREATE TABLE IF NOT EXISTS public.company_admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'admin', -- admin, super_admin, editor
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(company_id, user_id)
);

-- Create company_followers table
CREATE TABLE IF NOT EXISTS public.company_followers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(company_id, user_id)
);

-- Create company_posts table (posts from company page)
CREATE TABLE IF NOT EXISTS public.company_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  posted_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_urls TEXT[],
  video_url TEXT,
  document_url TEXT,
  link_preview JSONB,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Modify experiences table to link to companies (if not already done)
ALTER TABLE public.experiences 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for companies
DROP POLICY IF EXISTS "Public companies are viewable by everyone" ON public.companies;
CREATE POLICY "Public companies are viewable by everyone"
  ON public.companies FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can create companies" ON public.companies;
CREATE POLICY "Authenticated users can create companies"
  ON public.companies FOR INSERT
  WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Company admins can update companies" ON public.companies;
CREATE POLICY "Company admins can update companies"
  ON public.companies FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM company_admins 
      WHERE company_admins.company_id = companies.id 
      AND company_admins.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Company creator can delete company" ON public.companies;
CREATE POLICY "Company creator can delete company"
  ON public.companies FOR DELETE
  USING (auth.uid() = created_by);

-- RLS Policies for company_admins
DROP POLICY IF EXISTS "Everyone can view company admins" ON public.company_admins;
CREATE POLICY "Everyone can view company admins"
  ON public.company_admins FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Company admins can add other admins" ON public.company_admins;
CREATE POLICY "Company admins can add other admins"
  ON public.company_admins FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM company_admins 
      WHERE company_admins.company_id = company_admins.company_id 
      AND company_admins.user_id = auth.uid()
      AND company_admins.role = 'super_admin'
    ) OR 
    EXISTS (
      SELECT 1 FROM companies 
      WHERE companies.id = company_admins.company_id 
      AND companies.created_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Company admins can remove admins" ON public.company_admins;
CREATE POLICY "Company admins can remove admins"
  ON public.company_admins FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM company_admins ca
      WHERE ca.company_id = company_admins.company_id 
      AND ca.user_id = auth.uid()
      AND ca.role = 'super_admin'
    )
  );

-- RLS Policies for company_followers
DROP POLICY IF EXISTS "Everyone can view company followers" ON public.company_followers;
CREATE POLICY "Everyone can view company followers"
  ON public.company_followers FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can follow companies" ON public.company_followers;
CREATE POLICY "Users can follow companies"
  ON public.company_followers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unfollow companies" ON public.company_followers;
CREATE POLICY "Users can unfollow companies"
  ON public.company_followers FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for company_posts
DROP POLICY IF EXISTS "Public company posts are viewable by everyone" ON public.company_posts;
CREATE POLICY "Public company posts are viewable by everyone"
  ON public.company_posts FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Company admins can create posts" ON public.company_posts;
CREATE POLICY "Company admins can create posts"
  ON public.company_posts FOR INSERT
  WITH CHECK (
    auth.uid() = posted_by AND
    EXISTS (
      SELECT 1 FROM company_admins 
      WHERE company_admins.company_id = company_posts.company_id 
      AND company_admins.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Company admins can update posts" ON public.company_posts;
CREATE POLICY "Company admins can update posts"
  ON public.company_posts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM company_admins 
      WHERE company_admins.company_id = company_posts.company_id 
      AND company_admins.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Company admins can delete posts" ON public.company_posts;
CREATE POLICY "Company admins can delete posts"
  ON public.company_posts FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM company_admins 
      WHERE company_admins.company_id = company_posts.company_id 
      AND company_admins.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_companies_slug ON public.companies(slug);
CREATE INDEX IF NOT EXISTS idx_companies_name ON public.companies(name);
CREATE INDEX IF NOT EXISTS idx_companies_industry ON public.companies(industry);
CREATE INDEX IF NOT EXISTS idx_companies_created_by ON public.companies(created_by);
CREATE INDEX IF NOT EXISTS idx_company_admins_company_id ON public.company_admins(company_id);
CREATE INDEX IF NOT EXISTS idx_company_admins_user_id ON public.company_admins(user_id);
CREATE INDEX IF NOT EXISTS idx_company_followers_company_id ON public.company_followers(company_id);
CREATE INDEX IF NOT EXISTS idx_company_followers_user_id ON public.company_followers(user_id);
CREATE INDEX IF NOT EXISTS idx_company_posts_company_id ON public.company_posts(company_id);
CREATE INDEX IF NOT EXISTS idx_experiences_company_id ON public.experiences(company_id);

-- Function to update follower count
CREATE OR REPLACE FUNCTION update_company_follower_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE companies 
    SET follower_count = follower_count + 1 
    WHERE id = NEW.company_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE companies 
    SET follower_count = GREATEST(0, follower_count - 1) 
    WHERE id = OLD.company_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for follower count
DROP TRIGGER IF EXISTS trigger_update_company_follower_count ON public.company_followers;
CREATE TRIGGER trigger_update_company_follower_count
  AFTER INSERT OR DELETE ON public.company_followers
  FOR EACH ROW
  EXECUTE FUNCTION update_company_follower_count();

-- Function to update employee count
CREATE OR REPLACE FUNCTION update_company_employee_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT' AND NEW.is_current = TRUE AND NEW.company_id IS NOT NULL) THEN
    UPDATE companies 
    SET employee_count = employee_count + 1 
    WHERE id = NEW.company_id;
    RETURN NEW;
  ELSIF (TG_OP = 'UPDATE') THEN
    IF (OLD.is_current = TRUE AND NEW.is_current = FALSE AND OLD.company_id IS NOT NULL) THEN
      UPDATE companies 
      SET employee_count = GREATEST(0, employee_count - 1) 
      WHERE id = OLD.company_id;
    ELSIF (OLD.is_current = FALSE AND NEW.is_current = TRUE AND NEW.company_id IS NOT NULL) THEN
      UPDATE companies 
      SET employee_count = employee_count + 1 
      WHERE id = NEW.company_id;
    END IF;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE' AND OLD.is_current = TRUE AND OLD.company_id IS NOT NULL) THEN
    UPDATE companies 
    SET employee_count = GREATEST(0, employee_count - 1) 
    WHERE id = OLD.company_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for employee count
DROP TRIGGER IF EXISTS trigger_update_company_employee_count ON public.experiences;
CREATE TRIGGER trigger_update_company_employee_count
  AFTER INSERT OR UPDATE OR DELETE ON public.experiences
  FOR EACH ROW
  EXECUTE FUNCTION update_company_employee_count();

-- Function to auto-create admin record when company is created
CREATE OR REPLACE FUNCTION create_company_admin()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO company_admins (company_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'super_admin');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create admin
DROP TRIGGER IF EXISTS trigger_create_company_admin ON public.companies;
CREATE TRIGGER trigger_create_company_admin
  AFTER INSERT ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION create_company_admin();

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_companies_updated_at ON public.companies;
CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON public.companies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_company_posts_updated_at ON public.company_posts;
CREATE TRIGGER update_company_posts_updated_at
    BEFORE UPDATE ON public.company_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

SELECT 'Companies schema created successfully!' as result;
