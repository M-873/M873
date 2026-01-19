-- Quick RLS Security Fix for Public Tables
-- This script enables Row Level Security on all public tables

-- Enable RLS on features table (if exists)
ALTER TABLE IF EXISTS public.features ENABLE ROW LEVEL SECURITY;

-- Enable RLS on user_roles table (if exists)  
ALTER TABLE IF EXISTS public.user_roles ENABLE ROW LEVEL SECURITY;

-- Add fallback policies for features table
CREATE POLICY IF NOT EXISTS "Anyone can view features" ON public.features FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Owners can manage features" ON public.features FOR ALL USING (public.has_role(auth.uid(), 'owner'));

-- Add fallback policies for user_roles table
CREATE POLICY IF NOT EXISTS "Anyone can view user roles" ON public.user_roles FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Owners can manage user roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'owner'));

-- Verify tables and RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('features', 'user_roles');

-- Success message
SELECT '✅ RLS enabled successfully on public tables!' as status;