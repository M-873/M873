-- Comprehensive fix for features table issues
-- Run this script in your Supabase SQL editor

-- 1. Add link column to features table (if not exists)
ALTER TABLE public.features ADD COLUMN IF NOT EXISTS link TEXT;
ALTER TABLE public.features ALTER COLUMN link DROP NOT NULL;

-- 2. Fix RLS policies for features table
-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view features" ON public.features;
DROP POLICY IF EXISTS "Owners can manage features" ON public.features;

-- Create fresh policies
CREATE POLICY "Anyone can view features"
  ON public.features FOR SELECT
  USING (true);

CREATE POLICY "Owners can manage features"
  ON public.features FOR ALL
  USING (public.has_role(auth.uid(), 'owner'));

-- 3. Ensure the has_role function exists and works correctly
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

-- 4. Grant necessary permissions
GRANT ALL ON public.features TO authenticated;
GRANT SELECT ON public.features TO anon;

-- 5. Verify the fix
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'features' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 6. Check if user has owner role (you'll need to run this manually for your user)
-- SELECT auth.uid(), public.has_role(auth.uid(), 'owner');

-- 7. If you need to assign owner role to yourself, run:
-- INSERT INTO public.user_roles (user_id, role) 
-- VALUES (auth.uid(), 'owner')
-- ON CONFLICT (user_id, role) DO NOTHING;