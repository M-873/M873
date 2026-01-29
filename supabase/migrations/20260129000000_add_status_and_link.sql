-- Migration to add 'status' and 'link' columns to 'features' table

-- Add 'status' column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'features' AND column_name = 'status') THEN
        ALTER TABLE public.features ADD COLUMN status TEXT DEFAULT 'upcoming';
    END IF;
END $$;

-- Add 'link' column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'features' AND column_name = 'link') THEN
        ALTER TABLE public.features ADD COLUMN link TEXT;
    END IF;
END $$;
