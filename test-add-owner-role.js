// Test script to add a default owner role
// This will help us verify if the authentication issue is resolved

const SUPABASE_URL = 'https://mgkarabtbhluvkrfyrmu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1na2FyYWJ0YmhsdXZrcmZ5cm11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1NzkxNTQsImV4cCI6MjA4MDE1NTE1NH0.Kn14ixl4_2dyzH6BM3sAsdQ61lfPmtZPRoJD6Tz8cyc';

async function addDefaultOwnerRole() {
  try {
    // First, let's get the current user (if any)
    const authResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    if (!authResponse.ok) {
      console.log('No authenticated user found. This is expected for testing.');
      console.log('The issue is likely that the app is trying to access user_roles before authentication.');
      return;
    }

    const user = await authResponse.json();
    console.log('Current user:', user);

    // Try to add a default owner role for this user
    const { data, error } = await fetch(`${SUPABASE_URL}/rest/v1/user_roles`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        user_id: user.id,
        role: 'owner'
      })
    });

    if (error) {
      console.error('Error adding owner role:', error);
    } else {
      console.log('✅ Owner role added successfully:', data);
    }

  } catch (error) {
    console.error('Error in test script:', error);
  }
}

console.log('Testing authentication and owner role access...');
addDefaultOwnerRole();