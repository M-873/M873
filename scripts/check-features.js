import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with correct credentials from .env
const supabaseUrl = 'https://mgkarabtbhluvkrfyrmu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1na2FyYWJ0YmhsdXZrcmZ5cm11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1NzkxNTQsImV4cCI6MjA4MDE1NTE1NH0.Kn14ixl4_2dyzH6BM3sAsdQ61lfPmtZPRoJD6Tz8cyc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkFeatures() {
  try {
    // Check all features
    const { data: allFeatures, error: allError } = await supabase
      .from('features')
      .select('*')
      .order('sort_order', { ascending: true });

    if (allError) {
      console.error('Error fetching features:', allError);
      return;
    }

    console.log('Total features found:', allFeatures?.length || 0);
    console.log('All features:', JSON.stringify(allFeatures, null, 2));

    // Check specifically for HEM feature
    const { data: hemFeature, error: hemError } = await supabase
      .from('features')
      .select('*')
      .eq('title', 'Hostel Expense Management')
      .single();

    if (hemError) {
      console.log('HEM feature not found:', hemError.message);
    } else {
      console.log('HEM feature found:', hemFeature);
    }

  } catch (error) {
    console.error('Exception:', error);
  }
}

checkFeatures();