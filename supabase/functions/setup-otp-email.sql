-- Function to send owner OTP email using Supabase's email service
CREATE OR REPLACE FUNCTION public.send_owner_otp_email(
  p_email TEXT,
  p_subject TEXT,
  p_html_body TEXT,
  p_text_body TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_result BOOLEAN DEFAULT FALSE;
BEGIN
  -- This function would typically integrate with an email service
  -- For now, we'll log the email details and return success
  -- In production, you'd integrate with SendGrid, AWS SES, etc.
  
  RAISE NOTICE 'Sending OTP email to: %', p_email;
  RAISE NOTICE 'Subject: %', p_subject;
  RAISE NOTICE 'HTML Body: %', p_html_body;
  RAISE NOTICE 'Text Body: %', p_text_body;
  
  -- Log to a table for tracking (optional)
  INSERT INTO public.email_logs (email, subject, html_body, text_body, created_at)
  VALUES (p_email, p_subject, p_html_body, p_text_body, NOW())
  ON CONFLICT DO NOTHING;
  
  v_result := TRUE;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create email logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_body TEXT,
  text_body TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policy for email logs
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Allow owners to view email logs
CREATE POLICY "Owners can view email logs" ON public.email_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'owner'
    )
  );

-- Create function to generate and store OTP
CREATE OR REPLACE FUNCTION public.generate_owner_otp(
  p_email TEXT
)
RETURNS TABLE(otp TEXT, expires_at TIMESTAMP WITH TIME ZONE) AS $$
DECLARE
  v_otp TEXT;
  v_expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Generate a 6-digit OTP
  v_otp := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
  v_expires_at := NOW() + INTERVAL '10 minutes';
  
  -- Store the OTP in a table
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

-- Create OTP table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.owner_otps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  otp TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  used BOOLEAN DEFAULT FALSE
);

-- Create function to verify OTP
CREATE OR REPLACE FUNCTION public.verify_owner_otp(
  p_email TEXT,
  p_otp TEXT
)
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
$$ LANGUAGE plpgsql SECURITY DEFINER;