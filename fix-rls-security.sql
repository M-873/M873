-- Enable RLS on all public tables for security
-- This script will enable Row Level Security on all tables that don't have it

-- Check which tables need RLS enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND rowsecurity = false
ORDER BY tablename;

-- Enable RLS on features table (if not already enabled)
ALTER TABLE IF EXISTS public.features ENABLE ROW LEVEL SECURITY;

-- Enable RLS on user_roles table (if not already enabled)  
ALTER TABLE IF EXISTS public.user_roles ENABLE ROW LEVEL SECURITY;

-- Enable RLS on any other public tables that might exist
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
          AND rowsecurity = false
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', r.tablename);
        RAISE NOTICE 'Enabled RLS on table: %', r.tablename;
    END LOOP;
END $$;

-- Create basic RLS policies for tables that don't have them
-- Features table policies (if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'features' 
        AND policyname = 'Anyone can view features'
    ) THEN
        CREATE POLICY "Anyone can view features" ON public.features FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'features' 
        AND policyname = 'Owners can manage features'
    ) THEN
        CREATE POLICY "Owners can manage features" ON public.features FOR ALL USING (public.has_role(auth.uid(), 'owner'));
    END IF;
END $$;

-- User roles table policies (if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'user_roles' 
        AND policyname = 'Anyone can view user roles'
    ) THEN
        CREATE POLICY "Anyone can view user roles" ON public.user_roles FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'user_roles' 
        AND policyname = 'Owners can manage user roles'
    ) THEN
        CREATE POLICY "Owners can manage user roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'owner'));
    END IF;
END $$;

-- Grant appropriate permissions
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;

-- Success confirmation
SELECT '✅ RLS enabled on all public tables! Security policies applied.' as status;