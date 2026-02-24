ALTER TABLE IF EXISTS public.bitacora_personal
ADD COLUMN IF NOT EXISTS marina_salida TEXT,
ADD COLUMN IF NOT EXISTS tripulacion TEXT,
ADD COLUMN IF NOT EXISTS condiciones_viento JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS maniobras TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS observaciones TEXT;
