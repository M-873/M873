// Simple email API endpoint for development
// In production, this should be replaced with a proper backend service

export const sendEmailAPI = async (email: string, otp: string) => {
  try {
    // Simulate email sending
    console.log(`📧 Sending OTP email to: ${email}`);
    console.log(`🔐 OTP Code: ${otp}`);
    
    // In a real implementation, you would:
    // 1. Call your backend API
    // 2. Use a service like SendGrid, AWS SES, or Nodemailer
    // 3. Or use Supabase Edge Functions
    
    // For now, we'll simulate the delay and return success
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Log the email details (in development only)
    console.log(`✅ Email sent successfully to ${email} with OTP: ${otp}`);
    
    return { 
      success: true, 
      message: 'OTP email sent successfully',
      // In development, you can check the console for the OTP
      // In production, this would be removed
      debug: `OTP: ${otp}` 
    };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { 
      success: false, 
      error: 'Failed to send email' 
    };
  }
};

// Production email service configuration
export const emailConfig = {
  // This would be configured in your environment variables
  service: 'supabase', // or 'sendgrid', 'aws-ses', etc.
  fromEmail: 'noreply@yourdomain.com',
  subject: 'Owner Login Verification Code',
  
  // Email template
  template: (otp: string) => ({
    subject: 'Your Owner Login Verification Code',
    html: `
      <html>
        <body style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center;">
            <h2 style="color: #333; margin-bottom: 20px;">Owner Login Verification</h2>
            <p style="color: #666; font-size: 16px; margin-bottom: 30px;">
              Your One-Time Password (OTP) for owner login is:
            </p>
            <div style="background-color: white; padding: 20px; border-radius: 8px; border: 2px solid #e9ecef; margin-bottom: 30px;">
              <div style="font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 4px;">
                ${otp}
              </div>
            </div>
            <p style="color: #999; font-size: 14px; margin-bottom: 20px;">
              This code will expire in 10 minutes. If you didn't request this code, please ignore this email.
            </p>
            <hr style="border: none; height: 1px; background-color: #e9ecef; margin: 30px 0;">
            <p style="color: #999; font-size: 12px;">
              This is an automated message. Please do not reply to this email.
            </p>
          </div>
        </body>
      </html>
    `,
    text: `
Owner Login Verification

Your One-Time Password (OTP) for owner login is: ${otp}

This code will expire in 10 minutes.

If you didn't request this code, please ignore this email.

This is an automated message. Please do not reply to this email.
    `
  })
};