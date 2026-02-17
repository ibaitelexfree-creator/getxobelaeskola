
-- Create session_edits table for history tracking
CREATE TABLE IF NOT EXISTS public.session_edits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES public.sesiones(id) ON DELETE CASCADE,
    staff_id UUID REFERENCES auth.users(id), -- Or public.profiles if referencing profiles directly
    field_name TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.session_edits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and Instructors can view session history"
    ON public.session_edits
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND (profiles.rol = 'admin' OR profiles.rol = 'instructor')
        )
    );

CREATE POLICY "System can insert history"
    ON public.session_edits
    FOR INSERT
    WITH CHECK (true); -- Usually inserted by service role or admin, but strictly check via auth.uid() if needed.
