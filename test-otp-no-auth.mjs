// Test OTP flow without authentication (for debugging)
const SUPABASE_URL = "https://zxbydjiptihzsxucvynp.supabase.co";
const EMAIL = "mahfuzulislam873@gmail.com";

async function testOTPWithoutAuth() {
  console.log("🚀 Testing Edge Function without authentication...");
  console.log("📡 Testing via deployed URL:", SUPABASE_URL);
  console.log("📧 Testing email:", EMAIL);
  
  try {
    // Test deployed Edge Function without auth header
    console.log("\n📧 Testing OTP generation without auth...");
    const response = await fetch(`${SUPABASE_URL}/functions/v1/send-owner-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // No Authorization header
      },
      body: JSON.stringify({ email: EMAIL }),
    });

    const result = await response.json();
    console.log("📦 Result:", result);

    if (!response.ok) {
      console.error("❌ HTTP Error:", response.status, response.statusText);
    }

    if (result.success) {
      console.log("✅ OTP generated successfully!");
      
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
    console.error("❌ Test failed:", error.message);
    console.error("📋 Full error:", error);
  }
}

// Run the test
testOTPWithoutAuth();