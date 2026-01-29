-- 🚨 MASTER DATABASE FIX FOR M873 🚨
-- This script synchronizes the live database with the expected schema and refreshes the cache.

-- 1. FIX FEATURES TABLE
DO $$
BEGIN
    -- Ensure status column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'features' AND column_name = 'status') THEN
        ALTER TABLE public.features ADD COLUMN status TEXT DEFAULT 'upcoming';
    END IF;

    -- Ensure link column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'features' AND column_name = 'link') THEN
        ALTER TABLE public.features ADD COLUMN link TEXT;
    END IF;
    
    -- Ensure updated_at exists for syncing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'features' AND column_name = 'updated_at') THEN
        ALTER TABLE public.features ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 2. CREATE OWNER OTP SYSTEM
CREATE TABLE IF NOT EXISTS public.owner_otps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  otp TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  used BOOLEAN DEFAULT FALSE
);

-- 3. CREATE EMAIL LOGS
CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_body TEXT,
  text_body TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. ENABLE RLS
ALTER TABLE public.owner_otps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.features ENABLE ROW LEVEL SECURITY;

-- 5. REFRESH SCHEMA CACHE
-- This command notifies PostgREST to reload the schema definitions
NOTIFY pgrst, 'reload schema';

-- 6. ENSURE POLICIES ARE RE-APPLIED
-- (Optional: Add specific policies here if they were dropped)

-- 7. ADD TEST DATA IF EMPTY
INSERT INTO public.features (title, description, status)
SELECT 'AI Assistant', 'Bilingual chatbot for project support.', 'active'
WHERE NOT EXISTS (SELECT 1 FROM public.features WHERE title = 'AI Assistant');

-- 🎉 DONE! Please refresh your browser after running this.
