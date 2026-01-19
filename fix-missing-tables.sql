-- Fix for missing tables causing PGRST205 errors
-- Run this SQL in your Supabase dashboard SQL editor

-- Create enum for user roles (if not exists)
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('owner', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create user_roles table (if not exists)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create features table (if not exists)
CREATE TABLE IF NOT EXISTS public.features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'upcoming',
  sort_order INTEGER DEFAULT 0,
  link TEXT, -- Added from later migration
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on features
ALTER TABLE public.features ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (if not exists)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- User roles policies
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Owners can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'owner'));

CREATE POLICY "Owners can manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'owner'));

-- Features policies - public read, owner write
CREATE POLICY "Anyone can view features"
  ON public.features FOR SELECT
  USING (true);

CREATE POLICY "Owners can manage features"
  ON public.features FOR ALL
  USING (public.has_role(auth.uid(), 'owner'));

-- Function to update timestamps (if not exists)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Timestamp triggers (if not exists)
DO $$ BEGIN
    CREATE TRIGGER update_features_updated_at
      BEFORE UPDATE ON public.features
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Insert default features (if table is empty)
INSERT INTO public.features (title, description, sort_order) VALUES
  ('Upcoming Feature 1', 'This feature will be added soon.', 1),
  ('Upcoming Feature 2', 'This feature will be added soon.', 2),
  ('Upcoming Feature 3', 'This feature will be added soon.', 3),
  ('Upcoming Feature 4', 'This feature will be added soon.', 4)
ON CONFLICT DO NOTHING;

-- Verify tables were created
SELECT 'user_roles table created successfully' as status 
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles' AND table_schema = 'public')
UNION ALL
SELECT 'features table created successfully' as status 
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'features' AND table_schema = 'public');