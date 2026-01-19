# 🚀 QUICK FIX: Enable Owner Feature Editing

## Problem
The PGRST205 error is preventing you from editing features because the `features` table is missing from your production Supabase database.

## ✅ IMMEDIATE SOLUTION (2 minutes)

### Step 1: Open Supabase Dashboard
**Click this link:** https://app.supabase.com/projects  
**Select:** Your project `mgkarabtbhluvkrfyrmu`  
**Click:** "SQL Editor" in the left sidebar  

### Step 2: Copy & Execute SQL
Copy the ENTIRE SQL script below and paste it into the SQL Editor, then click "Run":

```sql
-- Create features table for owner editing
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

-- Create user_roles table for owner management
CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'moderator')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security policies
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

-- Make you the owner
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

-- Success confirmation
SELECT '✅ Tables created successfully! Owner feature editing is now enabled.' as status;
```

### Step 3: Test Feature Editing
After running the SQL:
1. **Go to:** https://m-873.github.io/M873/
2. **Sign in** with your email (mahfuzulislam873@gmail.com)
3. **Navigate to:** Owner Dashboard
4. **Try:** Adding, editing, and deleting features

## 🎯 What You'll Be Able to Do

✅ **View all features** on the homepage  
✅ **Add new features** with title, description, status, and link  
✅ **Edit existing features** - change any field  
✅ **Delete features** you no longer want  
✅ **Change feature status** (upcoming, live, deprecated)  
✅ **Reorder features** using sort_order  

## 🛠️ Owner Dashboard Features

The owner dashboard includes:
- **Feature Management Panel** - Add/edit/delete features
- **Real-time Updates** - Changes reflect immediately on homepage
- **Status Control** - Set features as upcoming, live, or deprecated
- **Drag & Drop Reordering** - Organize feature display order
- **Rich Text Editor** - Format feature descriptions
- **Link Management** - Add external links to features

## 🔒 Security

- **Only owners** can edit features (based on your email)
- **RLS policies** protect the database
- **Authenticated requests** required for all changes
- **Session-based authentication** keeps you secure

## 📞 Need Help?

If you encounter issues:
1. **Check browser console** for specific error messages
2. **Verify you're signed in** with the correct email
3. **Refresh the page** after making changes
4. **Check Supabase dashboard** to confirm tables exist

## 🔑 Get Your Service Role Key

If you need your actual Service Role Key:
1. Go to https://app.supabase.com/projects
2. Select your project
3. Click "Settings" → "API"
4. Copy the "service_role" key (keep it secret!)

**After you run the SQL script above, your owner feature editing will be fully functional!** 🎉