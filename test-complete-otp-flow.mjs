import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '.env');

console.log('🚀 Testing complete OTP flow...');

// Read .env file
let env = {};
try {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, '');
      env[key] = value;
    }
  });
  console.log('✅ Loaded .env file');
} catch (error) {
  console.error('❌ Failed to read .env file:', error.message);
  process.exit(1);
}

const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SUPABASE_KEY = env.VITE_SUPABASE_PUBLISHABLE_KEY;
const EMAIL = 'mahfuzulislam873@gmail.com';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY in .env');
  process.exit(1);
}

console.log(`📡 Configured Supabase URL: ${SUPABASE_URL}`);
console.log(`📧 Testing email: ${EMAIL}`);

async function testOTPFlow() {
  console.log('\n📧 Step 1: Generating OTP...');
  
  try {
    // Test OTP generation
    const generateResponse = await fetch(`${SUPABASE_URL}/functions/v1/send-owner-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      },
      body: JSON.stringify({ email: EMAIL }),
    });

    const generateResult = await generateResponse.json();
    console.log('📦 Generation result:', generateResult);
    
    if (!generateResponse.ok || !generateResult.success) {
      console.error('❌ OTP generation failed:', generateResult.error);
      return;
    }
    
    console.log('✅ OTP generated successfully!');
    
    // Extract OTP from debug message (for testing)
    const otpMatch = generateResult.debug?.match(/OTP generated: (\d{6})/);
    const testOTP = otpMatch ? otpMatch[1] : null;
    
    if (!testOTP) {
      console.error('❌ Could not extract OTP from response');
      return;
    }
    
    console.log(`🔢 Extracted OTP: ${testOTP}`);
    
    console.log('\n🔍 Step 2: Verifying OTP...');
    
    // Test OTP verification using direct RPC call
    const verifyResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/verify_owner_otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'apikey': SUPABASE_KEY,
      },
      body: JSON.stringify({ 
        p_email: EMAIL,
        p_otp: testOTP 
      }),
    });

    const verifyResult = await verifyResponse.json();
    console.log('📦 Verification result:', verifyResult);
    
    if (!verifyResponse.ok) {
      console.error('❌ OTP verification failed:', verifyResult);
      return;
    }
    
    console.log('✅ OTP verification successful!');
    
    console.log('\n🎉 Complete OTP flow test passed!');
    console.log('✅ OTP generation works');
    console.log('✅ OTP verification works');
    console.log('✅ Edge Function is properly deployed and accessible');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testOTPFlow();