-- Add 'imagen_url' column to 'tipos_bono' table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tipos_bono' AND column_name = 'imagen_url') THEN
        ALTER TABLE public.tipos_bono ADD COLUMN imagen_url TEXT;
    END IF;
END $$;

-- Update existing bono types with specific images
UPDATE public.tipos_bono
SET imagen_url = 'https://getxobelaeskola.cloud/images/courses/CursodeVelaLigera.webp'
WHERE nombre ILIKE '%Vela Ligera%';

UPDATE public.tipos_bono
SET imagen_url = 'https://getxobelaeskola.cloud/images/courses/PerfeccionamientoVela.webp'
WHERE nombre ILIKE '%Windsurf%';

UPDATE public.tipos_bono
SET imagen_url = 'https://getxobelaeskola.cloud/images/courses/IniciacionJ80.webp'
WHERE nombre ILIKE '%J80%';
