// Fallback OTP service using direct RPC calls
import { supabase } from '@/integrations/supabase/client';

// Generate and send OTP via email (fallback version)
export const generateOTP = async (email: string) => {
  try {
    console.log(`Generating OTP for ${email} using RPC...`);
    
    // Call the RPC function to generate OTP
    const { data: otpData, error: otpError } = await supabase
      .rpc('generate_owner_otp', { p_email: email });

    if (otpError) {
      throw new Error(`Failed to generate OTP: ${otpError.message}`);
    }

    if (!otpData || !otpData[0]) {
      throw new Error('No OTP data returned from database');
    }

    const otp = otpData[0].otp;
    console.log(`OTP generated successfully: ${otp}`);
    
    // For now, we'll simulate email sending
    // In a real implementation, you would integrate with your email service
    console.log(`📧 Simulating email send to ${email} with OTP: ${otp}`);
    
    // Store the OTP in a way that can be retrieved for testing
    // This is just for development/testing purposes
    if (typeof window !== 'undefined') {
              (window as { lastGeneratedOTP?: string }).lastGeneratedOTP = otp;
            }
    
    return { 
      success: true, 
      message: 'OTP generated successfully! (Check console for OTP)',
      debug: `OTP generated: ${otp}`
    };
    
  } catch (error) {
    console.error('Failed to generate OTP:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to generate OTP' 
    };
  }
};

// Verify OTP against database
export const verifyOTP = async (email: string, otp: string) => {
  try {
    console.log(`Verifying OTP for ${email}...`);
    
    // Call database function to verify OTP
    const { data, error } = await supabase
      .rpc('verify_owner_otp', {
        p_email: email,
        p_otp: otp
      });

    if (error) {
      throw new Error(error.message);
    }

    console.log('OTP verification result:', data);
    return { success: data, message: data ? 'OTP verified successfully' : 'Invalid or expired OTP' };
    
  } catch (error) {
    console.error('Failed to verify OTP:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to verify OTP' 
    };
  }
};

// Generate random 6-digit OTP (for fallback)
export const generateRandomOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};