-- Migration: Create legal_consents table
CREATE TABLE IF NOT EXISTS legal_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    dni TEXT NOT NULL,
    ip_address TEXT NOT NULL,
    legal_text TEXT NOT NULL,
    consent_type TEXT NOT NULL, -- 'course' | 'rental'
    reference_id UUID,          -- ID of the course or rental
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE legal_consents ENABLE ROW LEVEL SECURITY;

-- Policy to allow anyone to insert (since they might not be logged in yet during the check, 
-- or we can restrict to authenticated if we ensure they are logged in)
-- Actually, the user flow usually requires login before checkout, so 'authenticated' is safer.
-- But RentalClient.tsx shows a redirect to login if not authenticated, so they will be authenticated.

CREATE POLICY "Allow inserts for authenticated users" 
ON legal_consents FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Allow service role to read all" 
ON legal_consents FOR SELECT 
TO service_role 
USING (true);
