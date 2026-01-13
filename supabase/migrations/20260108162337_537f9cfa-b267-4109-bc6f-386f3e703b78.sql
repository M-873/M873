-- Add link column to features table for external URLs
ALTER TABLE public.features ADD COLUMN IF NOT EXISTS link text;