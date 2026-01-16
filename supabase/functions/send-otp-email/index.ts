import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, otp } = await req.json()
    
    if (!email || !otp) {
      throw new Error('Email and OTP are required')
    }

    // Initialize Supabase client with service role key for admin access
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Send email using Supabase's built-in email functionality
    const { error } = await supabaseClient.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${Deno.env.get('SITE_URL')}/owner/login?otp=${otp}`,
      data: {
        otp: otp,
        type: 'owner_login_otp'
      }
    })

    if (error) {
      throw error
    }

    return new Response(
      JSON.stringify({ success: true, message: 'OTP email sent successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error sending OTP email:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})