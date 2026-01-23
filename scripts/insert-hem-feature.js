import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with correct credentials from .env
const supabaseUrl = 'https://mgkarabtbhluvkrfyrmu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1na2FyYWJ0YmhsdXZrcmZ5cm11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1NzkxNTQsImV4cCI6MjA4MDE1NTE1NH0.Kn14ixl4_2dyzH6BM3sAsdQ61lfPmtZPRoJD6Tz8cyc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function insertHEMFeature() {
  try {
    // First check if HEM already exists
    const { data: existingHEM, error: checkError } = await supabase
      .from('features')
      .select('*')
      .eq('title', 'Hostel Expense Management')
      .single();

    if (existingHEM) {
      console.log('HEM feature already exists:', existingHEM);
      return existingHEM;
    }

    // Insert HEM feature if it doesn't exist
    const { data, error } = await supabase
      .from('features')
      .insert([
        {
          title: 'Hostel Expense Management',
          description: 'The Hostel Expense Management application is currently under development. It is expected that within one month, approximately 80% of the core features will be fully usable. In the next phase, AI integration will be implemented. With access to CCTV systems and mobile devices, the system will be able to automate nearly 60% of operational tasks, requiring only minimal monitoring. Our ultimate goal is to simplify daily operations and make life easier through intelligent automation.',
          status: 'upcoming',
          sort_order: 5,
          link: 'https://frontend-inky-one-43.vercel.app/'
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error inserting HEM feature:', error);
      return null;
    }

    console.log('HEM feature inserted successfully:', data);
    return data;

  } catch (error) {
    console.error('Exception:', error);
    return null;
  }
}

insertHEMFeature();