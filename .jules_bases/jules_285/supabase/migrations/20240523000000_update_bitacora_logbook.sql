-- Add nautical logbook columns to bitacora_personal
ALTER TABLE public.bitacora_personal
ADD COLUMN IF NOT EXISTS puerto_salida TEXT,
ADD COLUMN IF NOT EXISTS tripulacion TEXT,
ADD COLUMN IF NOT EXISTS viento_nudos NUMERIC,
ADD COLUMN IF NOT EXISTS viento_direccion TEXT,
ADD COLUMN IF NOT EXISTS maniobras TEXT,
ADD COLUMN IF NOT EXISTS observaciones TEXT;

-- Update RLS if necessary (already covers UPDATE/INSERT for owner, so no change needed usually)
-- But ensuring the new columns are accessible is key. The existing policy covers "ALL" or "SELECT *" so it should be fine.
