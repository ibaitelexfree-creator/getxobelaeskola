
-- Create Financial History Table (Updated with staff_id to match user's API change)
CREATE TABLE IF NOT EXISTS public.financial_edits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reserva_id UUID NOT NULL REFERENCES public.reservas_alquiler(id) ON DELETE CASCADE,
    field_name TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    staff_id UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.financial_edits ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins full access on financial_edits" ON public.financial_edits
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.rol = 'admin'
        )
    );

CREATE POLICY "Instructors view financial_edits" ON public.financial_edits
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND (profiles.rol = 'instructor' OR profiles.rol = 'admin')
        )
    );
