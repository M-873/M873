-- Manual SQL script to create missing tables for the deployed site
-- This script should be run in the Supabase SQL editor

-- Create features table
CREATE TABLE IF NOT EXISTS public.features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'upcoming',
  sort_order INTEGER DEFAULT 0,
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'moderator')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create policies for features table
CREATE POLICY "Anyone can view features" ON public.features FOR SELECT USING (true);
CREATE POLICY "Owners can manage features" ON public.features FOR ALL USING (public.has_role(auth.uid(), 'owner'));

-- Create policies for user_roles table
CREATE POLICY "Anyone can view user roles" ON public.user_roles FOR SELECT USING (true);
CREATE POLICY "Owners can manage user roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'owner'));

-- Create has_role function if it doesn't exist
CREATE OR REPLACE FUNCTION public.has_role(user_id UUID, role_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = has_role.user_id 
    AND user_roles.role = role_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT SELECT ON public.features TO anon, authenticated;
GRANT ALL ON public.features TO authenticated;
GRANT SELECT ON public.user_roles TO anon, authenticated;
GRANT ALL ON public.user_roles TO authenticated;

-- Add default owner role for your email
INSERT INTO public.user_roles (user_id, role) 
SELECT id, 'owner' 
FROM auth.users 
WHERE email = 'mahfuzulislam873@gmail.com'
ON CONFLICT (user_id) DO NOTHING;

-- Add some default features
INSERT INTO public.features (title, description, status, sort_order) VALUES
  ('AI-Powered Chat', 'Advanced conversational AI with context awareness', 'live', 1),
  ('Dataset Management', 'Upload and manage your datasets with ease', 'live', 2),
  ('Multi-Language Support', 'Support for English and Bengali languages', 'live', 3),
  ('Owner Dashboard', 'Comprehensive admin panel for site management', 'live', 4)
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_features_status ON public.features(status);
CREATE INDEX IF NOT EXISTS idx_features_sort_order ON public.features(sort_order);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- Success message
SELECT 'Tables created successfully!' as status;