// Test OTP flow via deployed Edge Function
const SUPABASE_URL = "https://zxbydjiptihzsxucvynp.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4YnlkanlwdGlhenN4dWN2eW5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU2NTg3MzUsImV4cCI6MjA1MTIzNDczNX0.mxd7r8y4wzkq1w5pdr8qpgp4xq5k5pdr8qpgp4xq5k5";
const EMAIL = "mahfuzulislam873@gmail.com";

async function testDeployedOTP() {
  console.log("🚀 Testing deployed Edge Function...");
  console.log("📡 Testing via deployed URL:", SUPABASE_URL);
  console.log("📧 Testing email:", EMAIL);
  
  try {
    // Test deployed Edge Function
    console.log("\n📧 Testing deployed OTP generation...");
    const response = await fetch(`${SUPABASE_URL}/functions/v1/send-owner-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      },
      body: JSON.stringify({ email: EMAIL }),
    });

    const result = await response.json();
    console.log("📦 Deployed result:", result);

    if (!response.ok) {
      console.error("❌ HTTP Error:", response.status, response.statusText);
    }

    if (result.success) {
      console.log("✅ Deployed OTP generated successfully!");
      
      // Extract OTP from debug info for testing
      const otpMatch = result.debug?.match(/OTP generated: (\d{6})/);
      if (otpMatch) {
        const otp = otpMatch[1];
        console.log("🔑 Extracted OTP:", otp);
      }
    } else {
      console.error("❌ OTP generation failed:", result.error);
    }

  } catch (error) {
    console.error("❌ Deployed OTP test failed:", error.message);
    console.error("📋 Full error:", error);
  }
}

// Run the test
testDeployedOTP();