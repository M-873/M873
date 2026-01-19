# 🚨 URGENT: Fix Missing Features Table (PGRST205 Error)

## Problem
Your deployed site is showing: `PGRST205 - Could not find the table 'public.features' in the schema cache`

This means the `features` table is missing from your production Supabase database.

## ✅ IMMEDIATE SOLUTION

### Step 1: Go to Supabase Dashboard
**Open:** https://app.supabase.com/projects
**Select:** Your project `mgkarabtbhluvkrfyrmu`
**Click:** "SQL Editor" in the left sidebar

### Step 2: Copy and Execute SQL
Copy the ENTIRE content from [create-tables-manually.sql](file:///c:/Users/USER/OneDrive/Desktop/M873/create-tables-manually.sql) and paste it into the SQL Editor, then click "Run".

### Step 3: Verify Success
After running, you should see a success message. Then:
1. Go to https://m-873.github.io/M873/
2. Sign in with your owner email
3. Navigate to owner dashboard
4. Test adding/editing features

## 📋 SQL Script Content (for reference)

```sql
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

-- Enable RLS and create policies
ALTER TABLE public.features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view features" ON public.features FOR SELECT USING (true);
CREATE POLICY "Owners can manage features" ON public.features FOR ALL USING (public.has_role(auth.uid(), 'owner'));

CREATE POLICY "Anyone can view user roles" ON public.user_roles FOR SELECT USING (true);
CREATE POLICY "Owners can manage user roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'owner'));

-- Create has_role function
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

-- Grant permissions
GRANT SELECT ON public.features TO anon, authenticated;
GRANT ALL ON public.features TO authenticated;
GRANT SELECT ON public.user_roles TO anon, authenticated;
GRANT ALL ON public.user_roles TO authenticated;

-- Add your owner role
INSERT INTO public.user_roles (user_id, role) 
SELECT id, 'owner' 
FROM auth.users 
WHERE email = 'mahfuzulislam873@gmail.com'
ON CONFLICT (user_id) DO NOTHING;

-- Add default features
INSERT INTO public.features (title, description, status, sort_order) VALUES
  ('AI-Powered Chat', 'Advanced conversational AI with context awareness', 'live', 1),
  ('Dataset Management', 'Upload and manage your datasets with ease', 'live', 2),
  ('Multi-Language Support', 'Support for English and Bengali languages', 'live', 3),
  ('Owner Dashboard', 'Comprehensive admin panel for site management', 'live', 4)
ON CONFLICT DO NOTHING;
```

## 🎯 Files Created for You

1. **[create-tables-manually.sql](file:///c:/Users/USER/OneDrive/Desktop/M873/create-tissing-tables.sql)** - Complete SQL script
2. **[FIX_TABLES_GUIDE.md](file:///c:/Users/USER/OneDrive/Desktop/M873/FIX_TABLES_GUIDE.md)** - Detailed step-by-step guide
3. **[execute-sql-via-powershell.ps1](file:///c:/Users/USER/OneDrive/Desktop/M873/execute-sql-via-powershell.ps1)** - PowerShell automation script
4. **[open-supabase-dashboard.bat](file:///c:/Users/USER/OneDrive/Desktop/M873/open-supabase-dashboard.bat)** - Opens dashboard with instructions

## ⚡ Quick Action Required

**RUN THE SQL NOW** using the Supabase dashboard method. This is the fastest way to fix your deployed site.

After you complete this, the PGRST205 error should disappear and your owner dashboard will work properly.