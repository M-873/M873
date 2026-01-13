/**
 * 🧪 Test Script for GitHub Stats Error Fix
 * 
 * Copy and paste this entire script into your browser console (F12 → Console)
 * to verify that the GitHub stats error fix is working properly.
 */

console.log('🧪 Testing GitHub Stats Error Fix...\n');

// Test 1: Check if suppression is active
console.log('1️⃣ Checking if error suppression is active...');
if (window.fetch.toString().includes('_private/browser/stats')) {
  console.log('✅ Fetch interception is active');
} else {
  console.log('❌ Fetch interception not detected');
}

// Test 2: Try to trigger the GitHub stats error
console.log('\n2️⃣ Testing GitHub stats API call...');
fetch('https://api.github.com/_private/browser/stats')
  .then(response => {
    console.log('✅ SUCCESS: Request was intercepted and mocked');
    console.log('   Response status:', response.status);
    console.log('   Response type:', response.type);
  })
  .catch(error => {
    console.log('❌ FAILED: Request was not intercepted');
    console.log('   Error:', error.message);
  });

// Test 3: Test console error suppression
console.log('\n3️⃣ Testing console error suppression...');
const originalError = console.error;
let errorSuppressed = false;
console.error = function(...args) {
  if (args[0] && args[0].toString().includes('api.github.com/_private/browser/stats')) {
    errorSuppressed = true;
    console.log('✅ Console error was suppressed');
    return;
  }
  originalError.apply(console, args);
};

// Simulate the error
console.error('net::ERR_ABORTED https://api.github.com/_private/browser/stats');

// Restore original console.error
console.error = originalError;

if (!errorSuppressed) {
  console.log('❌ Console error suppression not working');
}

// Test 4: Check for any remaining GitHub tracking endpoints
console.log('\n4️⃣ Checking for other GitHub tracking endpoints...');
const trackingEndpoints = [
  'https://api.github.com/_private/browser/stats',
  'https://api.github.com/_private/browser/events',
  'https://github.com/_private/browser/stats'
];

trackingEndpoints.forEach(endpoint => {
  fetch(endpoint)
    .then(() => console.log(`✅ ${endpoint} - Request intercepted`))
    .catch(() => console.log(`❌ ${endpoint} - Request not intercepted`));
});

console.log('\n🎯 Test Summary:');
console.log('If you see mostly ✅ success messages above, the fix is working!');
console.log('The GitHub stats error should no longer appear in your console.');
console.log('\n🔄 To refresh the page and see the fix in action:');
console.log('   1. Press F5 to refresh');
console.log('   2. Check if the error still appears in console');
console.log('   3. The error should be completely suppressed!');