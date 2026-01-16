import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://mgkarabtbhluvkrfyrmu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1na2FyYWJ0YmhsdXZrcmZ5cm11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1NzkxNTQsImV4cCI6MjA4MDE1NTE1NH0.Kn14ixl4_2dyzH6BM3sAsdQ61lfPmtZPRoJD6Tz8cyc'
);

async function testSupabase() {
  try {
    console.log('Testing Supabase connection...');
    
    // Test connection
    const { data: features, error: featuresError } = await supabase.from('features').select('id').limit(1);
    console.log('Features test:', { data: features, error: featuresError });
    
    // Test auth
    console.log('Testing auth...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'mahfuzulislam873@gmail.com',
      password: 'mahfugul873'
    });
    
    console.log('Auth test result:', { data: authData, error: authError });
    
    if (authData.user) {
      console.log('User signed in:', authData.user.email);
      
      // Test role check
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', authData.user.id)
        .eq('role', 'owner')
        .maybeSingle();
      
      console.log('Role check:', { data: roleData, error: roleError });
      
      if (roleData) {
        console.log('✅ User has owner role!');
      } else {
        console.log('❌ No owner role found');
        
        // Try to create owner role
        console.log('Creating owner role...');
        const { error: createError } = await supabase
          .from('user_roles')
          .insert({ user_id: authData.user.id, role: 'owner' });
        
        if (createError) {
          console.error('Error creating owner role:', createError);
        } else {
          console.log('✅ Owner role created!');
        }
      }
    }
    
  } catch (error) {
    console.error('Exception:', error);
  }
}

testSupabase();