-- SQL to insert the "Hostel Expense Management" feature
-- Run this in your Supabase SQL Editor

INSERT INTO public.features (title, description, link, status, sort_order)
VALUES (
  'Hostel Expense Management', 
  'The Hostel Expense Management app is still being developed. In about a month, around 80% of the main features will be ready. Later, AI will be added to automate about 60% of tasks using CCTV and mobile devices, so only minimal supervision is needed. The goal is to make daily operations easier with smart automation.',
  'https://frontend-inky-one-43.vercel.app/',
  'upcoming',
  1  -- You can adjust the sort_order as preferred
);
