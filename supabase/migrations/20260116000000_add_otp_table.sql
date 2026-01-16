-- Create OTP table for secure one-time password storage
CREATE TABLE user_otps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  otp TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure email is indexed for fast lookups
  INDEX idx_user_otps_email (email),
  -- Ensure we can quickly find valid OTPs
  INDEX idx_user_otps_valid (email, used, expires_at)
);

-- Enable RLS
ALTER TABLE user_otps ENABLE ROW LEVEL SECURITY;

-- Create policies for OTP table
-- Only allow inserts (creation of new OTPs)
CREATE POLICY "Allow OTP creation" ON user_otps
  FOR INSERT WITH CHECK (true);

-- Only allow updates to mark as used, not to modify OTP values
CREATE POLICY "Allow OTP usage marking" ON user_otps
  FOR UPDATE USING (true)
  WITH CHECK (used = true AND otp = OLD.otp AND email = OLD.email);

-- Allow reading only for verification purposes
CREATE POLICY "Allow OTP verification" ON user_otps
  FOR SELECT USING (
    email = auth.jwt() ->> 'email' 
    AND expires_at > NOW() 
    AND used = FALSE
  );

-- Function to clean up expired OTPs
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void AS $$
BEGIN
  DELETE FROM user_otps 
  WHERE expires_at < NOW() OR used = TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create a cron job to clean up expired OTPs (runs every hour)
-- This requires the pg_cron extension to be enabled in your Supabase project
SELECT cron.schedule('cleanup-otps', '0 * * * *', 'SELECT cleanup_expired_otps();');