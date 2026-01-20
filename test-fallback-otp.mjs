// Test fallback OTP service
const SUPABASE_URL = "https://zxbydjiptihzsxucvynp.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4YnlkanlwdGlhenN4dWN2eW5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU2NTg3MzUsImV4cCI6MjA1MTIzNDczNX0.mxd7r8y4wzkq1w5pdr8qpgp4xq5k5pdr8qpgp4xq5k5";
const EMAIL = "mahfuzulislam873@gmail.com";

async function testFallbackOTP() {
  console.log("🚀 Testing fallback OTP service...");
  console.log("📧 Testing email:", EMAIL);
  
  try {
    // Test generate_owner_otp RPC function directly
    console.log("\n📧 Testing generate_owner_otp RPC...");
    const generateResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/generate_owner_otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
      },
      body: JSON.stringify({ p_email: EMAIL }),
    });

    const generateResult = await generateResponse.json();
    console.log("📦 Generate result:", generateResult);

    if (!generateResponse.ok) {
      console.error("❌ Generate HTTP Error:", generateResponse.status, generateResponse.statusText);
    } else if (generateResult && generateResult[0]) {
      console.log("✅ OTP generated successfully!");
      const otp = generateResult[0].otp;
      console.log("🔑 Generated OTP:", otp);
      
      // Test verify_owner_otp RPC function
      console.log("\n🔍 Testing verify_owner_otp RPC...");
      const verifyResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/verify_owner_otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
        },
        body: JSON.stringify({ p_email: EMAIL, p_otp: otp }),
      });

      const verifyResult = await verifyResponse.json();
      console.log("📦 Verify result:", verifyResult);

      if (verifyResponse.ok) {
        console.log("✅ OTP verification successful!");
      } else {
        console.error("❌ Verify HTTP Error:", verifyResponse.status, verifyResponse.statusText);
      }
    } else {
      console.error("❌ OTP generation failed - no result data");
    }

  } catch (error) {
    console.error("❌ Fallback test failed:", error.message);
    console.error("📋 Full error:", error);
  }
}

// Run the test
testFallbackOTP();