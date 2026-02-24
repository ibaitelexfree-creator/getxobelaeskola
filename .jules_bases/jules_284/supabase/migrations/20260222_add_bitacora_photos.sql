-- Migration to add photos support to personal logbook
-- Author: Jules
-- Date: 2026-02-22

-- Add 'fotos' column to 'bitacora_personal' table
ALTER TABLE public.bitacora_personal
ADD COLUMN IF NOT EXISTS fotos TEXT[] DEFAULT '{}';

-- Optional: Ensure 'academy-assets' bucket exists (idempotent check)
INSERT INTO storage.buckets (id, name, public)
VALUES ('academy-assets', 'academy-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Policy for uploads to 'academy-assets' bucket (specific to logbook-photos folder)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can upload logbook photos'
    ) THEN
        CREATE POLICY "Authenticated users can upload logbook photos"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK (
            bucket_id = 'academy-assets' AND
            (storage.foldername(name))[1] = 'logbook-photos' AND
            auth.uid()::text = (storage.foldername(name))[2]
        );
    END IF;
END $$;

-- Policy for reading logbook photos (public or authenticated)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view logbook photos'
    ) THEN
        CREATE POLICY "Anyone can view logbook photos"
        ON storage.objects FOR SELECT
        TO public
        USING (bucket_id = 'academy-assets' AND (storage.foldername(name))[1] = 'logbook-photos');
    END IF;
END $$;
