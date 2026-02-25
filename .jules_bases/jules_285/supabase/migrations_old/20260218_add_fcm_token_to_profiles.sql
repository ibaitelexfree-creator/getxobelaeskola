-- Add fcm_token column to profiles table to store Firebase Cloud Messaging tokens
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS fcm_token TEXT;

-- Index for faster lookup if needed (though we usually query by user id)
CREATE INDEX IF NOT EXISTS idx_profiles_fcm_token ON profiles(fcm_token);
