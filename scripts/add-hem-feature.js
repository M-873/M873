import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zxbydjiptihzsxucvynp.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4YnlkanlwdGloenN4dWN2eW5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMyNzI4NzMsImV4cCI6MjA0ODg0ODg3M30.ttP1E8UQ-qQJ0P1E8UQ-qQJ0P1E8UQ-qQJ0P1E8UQ-qQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Add HEM feature
async function addHEMFeature() {
  try {
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
      .select();

    if (error) {
      console.error('Error adding HEM feature:', error);
      return null;
    }

    console.log('HEM feature added successfully:', data);
    return data;
  } catch (error) {
    console.error('Exception adding HEM feature:', error);
    return null;
  }
}

// Execute the function
addHEMFeature();