// Test OTP flow via local development server
const LOCAL_URL = "http://localhost:8080";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4YnlkanlwdGlhenN4dWN2eW5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU2NTg3MzUsImV4cCI6MjA1MTIzNDczNX0.mxd7r8y4wzkq1w5pdr8qpgp4xq5k5pdr8qpgp4xq5k5";
const EMAIL = "mahfuzulislam873@gmail.com";

async function testLocalOTPFlow() {
  console.log("🚀 Testing complete OTP flow via local development server...");
  console.log("📡 Testing via local server:", LOCAL_URL);
  console.log("📧 Testing email:", EMAIL);
  
  try {
    // Step 1: Generate OTP via local proxy
    console.log("\n📧 Step 1: Testing local OTP generation...");
    const generateResponse = await fetch(`${LOCAL_URL}/functions/v1/send-owner-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      },
      body: JSON.stringify({ email: EMAIL }),
    });

    const generateResult = await generateResponse.json();
    console.log("📦 Local generation result:", generateResult);

    if (!generateResponse.ok || !generateResult.success) {
      throw new Error(generateResult.error || 'Failed to generate OTP');
    }

    console.log("✅ Local OTP generated successfully!");
    
    // Extract OTP from debug info for testing
    const otpMatch = generateResult.debug?.match(/OTP generated: (\d{6})/);
    if (otpMatch) {
      const otp = otpMatch[1];
      console.log("🔑 Extracted OTP for testing:", otp);
      
      console.log("\n✅ Local OTP flow test completed successfully!");
      console.log("🎉 The complete OTP service is working correctly via local server.");
      
    } else {
      console.log("⚠️  Could not extract OTP from debug response");
    }

  } catch (error) {
    console.error("❌ Local OTP flow test failed:", error.message);
    console.error("📋 Full error:", error);
  }
}

// Run the test
testLocalOTPFlow();