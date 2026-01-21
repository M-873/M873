-- Simple script to add link column to features table
-- This script can be run directly in Supabase SQL editor

-- Add link column to features table
ALTER TABLE public.features ADD COLUMN IF NOT EXISTS link TEXT;
ALTER TABLE public.features ALTER COLUMN link DROP NOT NULL;

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'features' 
AND table_schema = 'public'
AND column_name = 'link';