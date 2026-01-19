# Fix Missing Tables in Production Supabase

## Problem
The deployed site is showing error: `PGRST205 - Could not find the table 'public.features' in the schema cache`

## Solution
You need to manually create the missing tables in your Supabase production database.

## Step-by-Step Instructions

### Method 1: Using Supabase Dashboard (Recommended)

1. **Go to your Supabase Dashboard:**
   - Visit: https://app.supabase.com/projects
   - Select your project: `mgkarabtbhluvkrfyrmu`

2. **Open SQL Editor:**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query" or "Create query"

3. **Copy and paste this SQL script:**
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
   ```

4. **Run the query:**
   - Click the "Run" button or press `Ctrl+Enter`
   - Wait for the success message

5. **Test the fix:**
   - Go to your deployed site: https://m-873.github.io/M873/
   - Sign in with your owner email
   - Navigate to the owner dashboard
   - Try adding/editing features

### Method 2: Using Supabase CLI (Alternative)

If you have the Supabase CLI installed:

1. **Install Supabase CLI (if not already installed):**
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase:**
   ```bash
   supabase login
   ```

3. **Link to your project:**
   ```bash
   supabase link --project-ref mgkarabtbhluvkrfyrmu
   ```

4. **Run the SQL script:**
   ```bash
   supabase db execute < create-tables-manually.sql
   ```

## Verification

After running the SQL script, you should be able to:
- ✅ View features on the homepage
- ✅ Access the owner dashboard
- ✅ Add new features
- ✅ Edit existing features
- ✅ Delete features
- ✅ Manage user roles

## Troubleshooting

If you still see errors after creating the tables:

1. **Check table existence:**
   ```sql
   SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
   ```

2. **Check RLS policies:**
   ```sql
   SELECT * FROM pg_policies WHERE schemaname = 'public';
   ```

3. **Check if has_role function exists:**
   ```sql
   SELECT proname FROM pg_proc WHERE proname = 'has_role';
   ```

## Need Help?

If you encounter any issues:
1. Check the browser console for specific error messages
2. Verify your Supabase project URL and anon key are correct
3. Ensure your owner email is correctly set in the user_roles table

The SQL script is also saved as `create-tables-manually.sql` in your project folder for reference.