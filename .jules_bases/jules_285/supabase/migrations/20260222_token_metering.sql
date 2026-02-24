-- Migration: Token Metering
-- Description: Creates a table to track token usage by tenant/user.

CREATE TABLE IF NOT EXISTS public.token_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL,
    tokens INTEGER NOT NULL,
    model TEXT,
    path TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_token_usage_tenant ON public.token_usage(tenant_id);

ALTER TABLE public.token_usage ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert records (e.g. from client-side or server-side with user context)
-- Allow users to view their own usage
CREATE POLICY "Enable read for users based on tenant_id" ON public.token_usage
    FOR SELECT
    TO authenticated
    USING (auth.uid()::text = tenant_id);

-- Grant access to service_role (implicit in Supabase but good to be explicit if needed, though policies apply to roles)
-- Service role bypasses RLS by default so no policy needed for it.
