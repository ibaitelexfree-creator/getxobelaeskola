-- Add French translation columns to experiencias table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'experiencias' AND column_name = 'nombre_fr') THEN
        ALTER TABLE public.experiencias ADD COLUMN nombre_fr TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'experiencias' AND column_name = 'descripcion_fr') THEN
        ALTER TABLE public.experiencias ADD COLUMN descripcion_fr TEXT;
    END IF;
END $$;

-- Optional: Initialize French content with Spanish one as fallback
UPDATE public.experiencias SET nombre_fr = nombre_es WHERE nombre_fr IS NULL;
UPDATE public.experiencias SET descripcion_fr = descripcion_es WHERE descripcion_fr IS NULL;
