// Run this script to execute the SQL via Supabase REST API
// Make sure you have your SUPABASE_SERVICE_ROLE_KEY set in environment variables

const SUPABASE_URL = 'https://mgkarabtbhluvkrfyrmu.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // You'll need this key

async function runSQL(sql) {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY
      },
      body: JSON.stringify({ query: sql })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('SQL executed successfully:', result);
    return result;
  } catch (error) {
    console.error('Error executing SQL:', error);
    throw error;
  }
}

// Read the SQL script
const fs = require('fs');
const sql = fs.readFileSync('./fix-missing-tables.sql', 'utf8');

console.log('Running SQL script...');
runSQL(sql)
  .then(() => console.log('✅ Tables created successfully!'))
  .catch(err => console.error('❌ Failed to create tables:', err));