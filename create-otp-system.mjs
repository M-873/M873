const SUPABASE_URL = 'https://mgkarabtbhluvkrfyrmu.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'sb_secret_MqFRm6SaKZlVJ_waYkyFsQ_IsNhfcTc';

async function createOTPSystem() {
  try {
    console.log('Creating OTP system...');

    const sql = `-- Create OTP storage table
CREATE TABLE IF NOT EXISTS public.owner_otps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  otp TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  used BOOLEAN DEFAULT FALSE
);

-- Create function to generate OTP
CREATE OR REPLACE FUNCTION public.generate_owner_otp(p_email TEXT)
RETURNS TABLE(otp TEXT, expires_at TIMESTAMP WITH TIME ZONE) AS $$
DECLARE
  v_otp TEXT;
  v_expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Generate a 6-digit OTP
  v_otp := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
  v_expires_at := NOW() + INTERVAL '10 minutes';
  
  -- Store the OTP
  INSERT INTO public.owner_otps (email, otp, expires_at, created_at)
  VALUES (p_email, v_otp, v_expires_at, NOW())
  ON CONFLICT (email) 
  DO UPDATE SET 
    otp = EXCLUDED.otp,
    expires_at = EXCLUDED.expires_at,
    created_at = EXCLUDED.created_at,
    used = FALSE;
  
  RETURN QUERY SELECT v_otp, v_expires_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to verify OTP
CREATE OR REPLACE FUNCTION public.verify_owner_otp(p_email TEXT, p_otp TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_valid BOOLEAN DEFAULT FALSE;
  v_otp_record RECORD;
BEGIN
  -- Get the OTP record
  SELECT * INTO v_otp_record
  FROM public.owner_otps
  WHERE email = p_email
  AND used = FALSE
  AND expires_at > NOW();
  
  -- Check if OTP matches
  IF v_otp_record.otp = p_otp THEN
    v_valid := TRUE;
    -- Mark as used
    UPDATE public.owner_otps 
    SET used = TRUE 
    WHERE id = v_otp_record.id;
  END IF;
  
  RETURN v_valid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;`;

    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ sql })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`SQL execution failed: ${response.status} ${errorText}`);
    }

    console.log('✅ OTP system created successfully!');

  } catch (error) {
    console.error('❌ Error creating OTP system:', error);
  }
}

createOTPSystem();