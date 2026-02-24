-- Add cupon_usado to inscripciones to track marketing effectiveness
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inscripciones' AND column_name = 'cupon_usado') THEN
        ALTER TABLE public.inscripciones ADD COLUMN cupon_usado TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reservas_alquiler' AND column_name = 'cupon_usado') THEN
        ALTER TABLE public.reservas_alquiler ADD COLUMN cupon_usado TEXT;
    END IF;
END $$;
