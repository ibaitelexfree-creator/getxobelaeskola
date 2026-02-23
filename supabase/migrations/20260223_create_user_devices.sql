-- Migration: 20260223_create_user_devices.sql
-- Description: Create a table to store user device tokens for push notifications

CREATE TABLE IF NOT EXISTS public.user_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    fcm_token TEXT NOT NULL UNIQUE,
    platform TEXT, -- 'ios', 'android', 'web'
    last_seen_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.user_devices ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only manage their own device records
CREATE POLICY "Users can manage their own devices"
ON public.user_devices
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Index for faster lookup by user_id
CREATE INDEX IF NOT EXISTS idx_user_devices_user_id ON public.user_devices(user_id);

-- Also add fcm_token to profiles for backward compatibility or simple lookups
-- (Though the migration 20240101000057_add_fcm_token_to_profiles.sql already handles this)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='fcm_token') THEN
        ALTER TABLE public.profiles ADD COLUMN fcm_token TEXT;
    END IF;
END $$;
