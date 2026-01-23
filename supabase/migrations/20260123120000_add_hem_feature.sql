-- Add Hostel Expense Management feature
INSERT INTO public.features (title, description, status, sort_order, link) 
VALUES (
  'Hostel Expense Management', 
  'HEM application under development. AI integration planned with CCTV/mobile automation for 60% operational tasks. Goal: simplify daily operations through intelligent automation.', 
  'upcoming', 
  5, 
  'https://frontend-inky-one-43.vercel.app/'
) 
ON CONFLICT DO NOTHING;