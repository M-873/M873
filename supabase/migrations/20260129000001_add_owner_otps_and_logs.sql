-- Migration to add owner_otps and email_logs tables

-- Create OTP storage table for owners
CREATE TABLE IF NOT EXISTS public.owner_otps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  otp TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  used BOOLEAN DEFAULT FALSE
);

-- Enable RLS on owner_otps
ALTER TABLE public.owner_otps ENABLE ROW LEVEL SECURITY;

-- Policies for owner_otps
CREATE POLICY "Anyone can generate OTP" ON public.owner_otps
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can verify their own OTP" ON public.owner_otps
  FOR SELECT USING (email = auth.jwt() ->> 'email');

CREATE POLICY "Users can update their own OTP" ON public.owner_otps
  FOR UPDATE USING (email = auth.jwt() ->> 'email');

-- Create email logs table
CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_body TEXT,
  text_body TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on email logs
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Policy for email logs: only owners can view
CREATE POLICY "Owners can view email logs" ON public.email_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'owner'
    )
  );

-- Function to generate OTP
CREATE OR REPLACE FUNCTION public.generate_owner_otp(p_email TEXT)
RETURNS TABLE(otp TEXT, expires_at TIMESTAMP WITH TIME ZONE) AS $$
DECLARE
  v_otp TEXT;
  v_expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
  v_otp := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
  v_expires_at := NOW() + INTERVAL '10 minutes';
  
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

-- Function to verify OTP
CREATE OR REPLACE FUNCTION public.verify_owner_otp(p_email TEXT, p_otp TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_valid BOOLEAN DEFAULT FALSE;
  v_otp_record RECORD;
BEGIN
  SELECT * INTO v_otp_record
  FROM public.owner_otps
  WHERE email = p_email
  AND used = FALSE
  AND expires_at > NOW();
  
  IF v_otp_record.otp = p_otp THEN
    v_valid := TRUE;
    UPDATE public.owner_otps 
    SET used = TRUE 
    WHERE id = v_otp_record.id;
  END IF;
  
  RETURN v_valid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
