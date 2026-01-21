// @ts-expect-error - Deno types will be available at runtime
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
// @ts-expect-error - Supabase client will be available at runtime
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Environment variables for local development
const SUPABASE_URL = 'https://zxbydjiptihzsxucvynp.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4YnlkanlwdGlhenN4dWN2eW5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU2NTg3MzUsImV4cCI6MjA1MTIzNDczNX0.mxd7r8y4wzkq1w5pdr8qpgp4xq5k5pdr8qpgp4xq5k5'

interface RequestPayload {
  email: string;
}

interface OTPData {
  otp: string;
  expires_at: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // For testing purposes, accept requests without JWT validation
    const authHeader = req.headers.get('Authorization')
    console.log('Authorization header:', authHeader)
    
    const { email } = await req.json() as RequestPayload
    
    if (!email) {
      throw new Error('Email is required')
    }

    // Initialize Supabase client with service role key for admin access
    // Use hardcoded values for local development, fall back to environment variables
    // @ts-expect-error - Deno.env is available at runtime
    const supabaseUrl = (Deno.env.get('SUPABASE_URL') as string) || SUPABASE_URL
    // @ts-expect-error - Deno.env is available at runtime
    const supabaseKey = (Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string) || (Deno.env.get('SUPABASE_ANON_KEY') as string) || SUPABASE_ANON_KEY
    
    if (!supabaseKey) {
      throw new Error('No Supabase key available')
    }
    
    const supabaseClient = createClient(supabaseUrl, supabaseKey)

    // Generate OTP using database function
    const { data: otpData, error: otpError } = await supabaseClient
      .rpc('generate_owner_otp', { p_email: email })

    if (otpError) {
      throw new Error(`Failed to generate OTP: ${otpError.message}`)
    }

    if (!otpData) {
      throw new Error('No OTP data returned from database')
    }

    // Handle both string and object returns
    let otp: string;
    let expires_at: string;
    
    if (typeof otpData === 'string') {
      // Function returns just the OTP string
      otp = otpData;
      expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes from now
    } else if (typeof otpData === 'object' && otpData[0]) {
      // Function returns array with object
      otp = otpData[0].otp;
      expires_at = otpData[0].expires_at;
    } else {
      throw new Error('Unexpected OTP data format from database')
    }

    // Create a custom email template
    const emailTemplate = {
      subject: '🔐 M873 Owner Login - Your Verification Code',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>🔐 M873 Owner Login - Your Verification Code</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin: 0; padding: 20px; min-height: 100vh;">
          <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 16px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); overflow: hidden;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">🔐 M873 Owner Login</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Your Verification Code</p>
            </div>
            
            <div style="padding: 40px 30px;">
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
                Hello Owner,
              </p>
              
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
                Your one-time password (OTP) for owner login is:
              </p>
              
              <div style="background: #f3f4f6; border: 2px solid #e5e7eb; border-radius: 12px; padding: 20px; text-align: center; margin: 25px 0;">
                <div style="font-size: 32px; font-weight: 700; color: #1f2937; letter-spacing: 4px; font-family: 'Courier New', monospace;">
                  ${otp}
                </div>
              </div>
              
              <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <p style="color: #856404; margin: 0; font-size: 14px;">
                  <strong>⚠️ Important:</strong> This code expires in 10 minutes and can only be used once.
                </p>
              </div>
              
              <p style="color: #6c757d; font-size: 14px; text-align: center; margin-top: 25px;">
                If you didn't request this code, please ignore this email. No changes will be made to your account.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding: 20px; color: #6c757d; font-size: 12px;">
              <hr style="border: none; height: 1px; background: #dee2e6; margin: 20px 0;">
              <p>This is an automated security message from M873.</p>
              <p>Please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
M873 Owner Access - Verification Code

Your one-time password for owner login is: ${otp}

This code expires in 10 minutes and can only be used once.

If you didn't request this code, please ignore this email.

This is an automated security message from M873.
      `
    }

    // Send the email using Supabase's SMTP settings (configured in Supabase dashboard)
    // The email will be sent using your Gmail SMTP configuration
    const { error: emailError } = await supabaseClient.auth.admin.inviteUserByEmail(email, {
      // @ts-expect-error - Deno.env is available at runtime
      redirectTo: `${(Deno.env.get('SITE_URL') as string) || 'http://localhost:8080'}/owner/login?otp=${otp}`,
      data: {
        otp: otp,
        type: 'owner_login_otp',
        expires_at: expires_at,
        // Custom email template data
        subject: emailTemplate.subject,
        html_content: emailTemplate.html,
        text_content: emailTemplate.text
      }
    })

    if (emailError) {
      throw new Error(`Failed to send email: ${emailError.message}`)
    }

    // Also log the OTP for debugging (remove in production)
    console.log(`📧 OTP Email Sent:`, {
      to: email,
      otp: otp,
      expires_at: expires_at,
      smtp_configured: true,
      sender: 'mahfuzulislam873@gmail.com (M873)'
    })

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'OTP email sent successfully',
        debug: `OTP generated: ${otp} (expires at ${expires_at})`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error sending OTP email:', error)
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})