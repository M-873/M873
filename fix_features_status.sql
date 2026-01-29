-- Fix missing status column in features table
-- Run this SQL in your Supabase dashboard SQL editor

-- Add status column if it doesn't exist
ALTER TABLE public.features 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'upcoming';

-- Update existing rows with null status
UPDATE public.features 
SET status = 'upcoming' 
WHERE status IS NULL;

-- Add comment to describe the column
COMMENT ON COLUMN public.features.status IS 'Feature status (upcoming, active, inactive)';

-- Verify the fix
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_name = 'features' AND table_schema = 'public'
ORDER BY ordinal_position;