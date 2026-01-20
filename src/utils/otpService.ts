// Real OTP service using Supabase Edge Functions
import { supabase } from '@/integrations/supabase/client';

// Generate and send OTP via email
export const generateOTP = async (email: string) => {
  try {
    console.log(`Generating real OTP for ${email}...`);
    
    // Call the Edge Function to generate and send OTP
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-owner-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ email }),
    });

    const result = await response.json();
    
    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Failed to send OTP email');
    }
    
    console.log('OTP email sent successfully:', result);
    return { success: true, message: 'OTP sent to your email!' };
    
  } catch (error) {
    console.error('Failed to send OTP email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send OTP email' 
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