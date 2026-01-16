import { sendEmailAPI } from './emailAPI';

// Secure email service for OTP
export const sendOTPEmail = async (email: string, otp: string) => {
  try {
    // Use the email API to send the OTP
    const result = await sendEmailAPI(email, otp);
    
    if (!result.success) {
      throw new Error(result.error);
    }
    
    return { success: true, message: 'OTP email sent successfully' };
  } catch (error) {
    console.error('Failed to send OTP email:', error);
    return { 
      success: false, 
      error: 'Failed to send OTP email' 
    };
  }
};

// Production-ready email service (requires configuration)
export const sendOTPEmailProduction = async (email: string, otp: string) => {
  try {
    // This would require:
    // 1. Supabase Edge Function deployment
    // 2. Email service configuration (SendGrid, AWS SES, etc.)
    // 3. Environment variables for API keys
    
    const response = await fetch('/api/send-otp-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, otp }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to send email');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Production email service error:', error);
    return { success: false, error: 'Failed to send OTP email' };
  }
};