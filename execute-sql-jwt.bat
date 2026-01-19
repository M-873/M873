@echo off
echo 🚀 Executing SQL script to create missing tables...
echo Using JWT token for authentication...

REM Create the JSON request body
echo {
  "query": "CREATE TABLE IF NOT EXISTS public.features (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), title TEXT NOT NULL, description TEXT, status TEXT DEFAULT 'upcoming', sort_order INTEGER DEFAULT 0, link TEXT, created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()); CREATE TABLE IF NOT EXISTS public.user_roles (user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE, role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'moderator')), created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()); ALTER TABLE public.features ENABLE ROW LEVEL SECURITY; ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY; CREATE POLICY \"Anyone can view features\" ON public.features FOR SELECT USING (true); CREATE POLICY \"Owners can manage features\" ON public.features FOR ALL USING (public.has_role(auth.uid(), 'owner')); CREATE POLICY \"Anyone can view user roles\" ON public.user_roles FOR SELECT USING (true); CREATE POLICY \"Owners can manage user roles\" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'owner')); CREATE OR REPLACE FUNCTION public.has_role(user_id UUID, role_name TEXT) RETURNS BOOLEAN AS $$ BEGIN RETURN EXISTS (SELECT 1 FROM public.user_roles WHERE user_roles.user_id = has_role.user_id AND user_roles.role = role_name); END; $$ LANGUAGE plpgsql SECURITY DEFINER; GRANT SELECT ON public.features TO anon, authenticated; GRANT ALL ON public.features TO authenticated; GRANT SELECT ON public.user_roles TO anon, authenticated; GRANT ALL ON public.user_roles TO authenticated; INSERT INTO public.user_roles (user_id, role) SELECT id, 'owner' FROM auth.users WHERE email = 'mahfuzulislam873@gmail.com' ON CONFLICT (user_id) DO NOTHING; INSERT INTO public.features (title, description, status, sort_order) VALUES ('AI-Powered Chat', 'Advanced conversational AI with context awareness', 'live', 1), ('Dataset Management', 'Upload and manage your datasets with ease', 'live', 2), ('Multi-Language Support', 'Support for English and Bengali languages', 'live', 3), ('Owner Dashboard', 'Comprehensive admin panel for site management', 'live', 4) ON CONFLICT DO NOTHING;"
} > sql_request.json

echo 📤 Sending request to Supabase...
curl -X POST "https://mgkarabtbhluvkrfyrmu.supabase.co/rest/v1/rpc/exec_sql" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4YnlkamlwdGloenN4dWN2eW5wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODI5MDkzMywiZXhwIjoyMDgzODY2OTMzfQ.LzV_K0W4X5WzHLFVXFthkoVBCrxkZ6gWIRAlMZcf0WQ" ^
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4YnlkamlwdGloenN4dWN2eW5wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODI5MDkzMywiZXhwIjoyMDgzODY2OTMzfQ.LzV_K0W4X5WzHLFVXFthkoVBCrxkZ6gWIRAlMZcf0WQ" ^
  -H "Content-Type: application/json" ^
  -d @sql_request.json

echo.
echo ✅ SQL execution completed!
echo.
echo 🎉 If successful, owner feature editing is now enabled!
echo.
echo 🎯 Next steps:
echo 1. Go to your deployed site: https://m-873.github.io/M873/
echo 2. Sign in with your owner email
echo 3. Navigate to the owner dashboard
echo 4. Test adding/editing features

del sql_request.json
echo.
pause