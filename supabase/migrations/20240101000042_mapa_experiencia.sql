
-- Add geographical experience tracking to hours_navegacion
ALTER TABLE public.horas_navegacion 
ADD COLUMN IF NOT EXISTS ubicacion JSONB, -- { lat: number, lng: number }
ADD COLUMN IF NOT EXISTS zona_nombre TEXT;

-- Update existing data with some default locations if possible (Optional, but good for demo)
-- Providing some variety in Getxo/Abra area
-- Abra Interior: 43.341, -3.013
-- Abra Exterior: 43.355, -3.025
-- Galea: 43.375, -3.038

UPDATE public.horas_navegacion 
SET 
  ubicacion = '{"lat": 43.341, "lng": -3.013}'::jsonb,
  zona_nombre = 'Abra Interior'
WHERE zona_nombre IS NULL AND id IN (SELECT id FROM public.horas_navegacion LIMIT 1);

UPDATE public.horas_navegacion 
SET 
  ubicacion = '{"lat": 43.355, "lng": -3.025}'::jsonb,
  zona_nombre = 'Abra Exterior'
WHERE zona_nombre IS NULL AND id IN (SELECT id FROM public.horas_navegacion OFFSET 1 LIMIT 1);
