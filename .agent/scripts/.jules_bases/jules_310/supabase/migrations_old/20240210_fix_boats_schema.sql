
-- Fix potential missing 'notas' column in embarcaciones
-- Run this if you get "Could not find the 'notas' column" error

DO $$ 
BEGIN 
  -- Check if 'notas' exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='embarcaciones' AND column_name='notas') THEN 
    -- If not, create it
    ALTER TABLE public.embarcaciones ADD COLUMN notas TEXT;
  END IF;

  -- Verify other columns just in case
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='embarcaciones' AND column_name='imagen_url') THEN 
    ALTER TABLE public.embarcaciones ADD COLUMN imagen_url TEXT;
  END IF;
END $$;

-- Force Schema Cache Reload (for PostgREST)
NOTIFY pgrst, 'reload config';
