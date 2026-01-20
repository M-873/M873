-- Comprehensive fix for all missing tables and RLS policies
-- This script creates all necessary tables for the M873 application

-- Create features table
CREATE TABLE IF NOT EXISTS public.features (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT profiles_user_id_key UNIQUE (user_id)
);

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT user_roles_user_id_key UNIQUE (user_id)
);

-- Enable RLS on all tables
ALTER TABLE public.features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Anyone can view features" ON public.features;
DROP POLICY IF EXISTS "Owners can manage features" ON public.features;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Owners can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;
DROP POLICY IF EXISTS "Owners can manage roles" ON public.user_roles;

-- Create RLS policies for features table
CREATE POLICY "Anyone can view features" ON public.features FOR SELECT USING (true);
CREATE POLICY "Owners can manage features" ON public.features FOR ALL USING (public.has_role(auth.uid(), 'owner'));

-- Create RLS policies for profiles table
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Owners can view all profiles" ON public.profiles FOR ALL USING (public.has_role(auth.uid(), 'owner'));

-- Create RLS policies for user_roles table
CREATE POLICY "Users can view own role" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Owners can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'owner'));

-- Create has_role function if it doesn't exist
CREATE OR REPLACE FUNCTION public.has_role(user_id UUID, required_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    IF user_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Check if user is owner via email (for backward compatibility)
    IF required_role = 'owner' THEN
        DECLARE
            user_email TEXT;
        BEGIN
            SELECT email INTO user_email FROM auth.users WHERE id = user_id;
            IF user_email = 'mahfuzulislam873@gmail.com' THEN
                RETURN TRUE;
            END IF;
        END;
    END IF;
    
    -- Check user_roles table
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_roles.user_id = has_role.user_id 
        AND user_roles.role = required_role
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default features if table is empty
INSERT INTO public.features (title, description, icon, sort_order) VALUES
('AI-Powered Analytics', 'Advanced machine learning algorithms for data analysis', 'Brain', 1),
('Real-time Collaboration', 'Work together with your team in real-time', 'Users', 2),
('Secure Cloud Storage', 'Enterprise-grade security for your data', 'Shield', 3),
('Mobile Optimization', 'Perfect experience on all devices', 'Smartphone', 4),
('24/7 Support', 'Round-the-clock customer support', 'Headphones', 5)
ON CONFLICT DO NOTHING;

-- Create owner role for your email
INSERT INTO public.user_roles (user_id, role) 
SELECT id, 'owner' FROM auth.users WHERE email = 'mahfuzulislam873@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'owner';

-- Verify everything is set up correctly
SELECT 
    'features' as table_name,
    COUNT(*) as row_count
FROM public.features
UNION ALL
SELECT 
    'profiles' as table_name,
    COUNT(*) as row_count
FROM public.profiles
UNION ALL
SELECT 
    'user_roles' as table_name,
    COUNT(*) as row_count
FROM public.user_roles;

-- Show RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('features', 'profiles', 'user_roles');