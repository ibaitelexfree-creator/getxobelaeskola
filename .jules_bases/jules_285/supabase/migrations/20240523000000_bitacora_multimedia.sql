-- Migration: Add bitacora_multimedia table and logbook-photos storage

-- Create table for multimedia files
CREATE TABLE IF NOT EXISTS public.bitacora_multimedia (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bitacora_id UUID REFERENCES public.bitacora_personal(id) ON DELETE CASCADE NOT NULL,
    url TEXT NOT NULL,
    type TEXT DEFAULT 'image',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.bitacora_multimedia ENABLE ROW LEVEL SECURITY;

-- Policies for bitacora_multimedia
CREATE POLICY "Users can view their own multimedia"
    ON public.bitacora_multimedia FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.bitacora_personal
            WHERE id = bitacora_multimedia.bitacora_id
            AND alumno_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own multimedia"
    ON public.bitacora_multimedia FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.bitacora_personal
            WHERE id = bitacora_multimedia.bitacora_id
            AND alumno_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own multimedia"
    ON public.bitacora_multimedia FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.bitacora_personal
            WHERE id = bitacora_multimedia.bitacora_id
            AND alumno_id = auth.uid()
        )
    );

-- Storage bucket creation (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('logbook-photos', 'logbook-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
-- Note: We use DO blocks to avoid errors if policies already exist (though CREATE POLICY IF NOT EXISTS requires Postgres 16+ or specific syntax, Supabase usually supports standard CREATE POLICY)
-- We'll just try to create them. If they fail because they exist, it's fine for this environment usually, but to be safe we can wrap in DO block or just assume clean slate/migration system handles it.
-- However, since this is a migration file, usually it's run once.

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Public Access Logbook Photos'
    ) THEN
        CREATE POLICY "Public Access Logbook Photos"
            ON storage.objects FOR SELECT
            USING (bucket_id = 'logbook-photos');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Authenticated Upload Logbook Photos'
    ) THEN
        CREATE POLICY "Authenticated Upload Logbook Photos"
            ON storage.objects FOR INSERT
            WITH CHECK (
                bucket_id = 'logbook-photos'
                AND auth.role() = 'authenticated'
            );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Users Update Own Logbook Photos'
    ) THEN
        CREATE POLICY "Users Update Own Logbook Photos"
            ON storage.objects FOR UPDATE
            USING (bucket_id = 'logbook-photos' AND auth.uid() = owner);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Users Delete Own Logbook Photos'
    ) THEN
        CREATE POLICY "Users Delete Own Logbook Photos"
            ON storage.objects FOR DELETE
            USING (bucket_id = 'logbook-photos' AND auth.uid() = owner);
    END IF;
END $$;
