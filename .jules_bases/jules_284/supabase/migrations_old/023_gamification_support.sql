-- Migration to add gamification support to units
ALTER TABLE public.unidades_didacticas 
ADD COLUMN IF NOT EXISTS tipo_contenido TEXT DEFAULT 'teoria',
ADD COLUMN IF NOT EXISTS configuracion_interaccion JSONB DEFAULT '{}';

-- Comments for documentation
COMMENT ON COLUMN public.unidades_didacticas.tipo_contenido IS 'Define the type of interaction: teoria, interactivo, video, simulacion';
COMMENT ON COLUMN public.unidades_didacticas.configuracion_interaccion IS 'JSON configuration for the interactive element (e.g., game difficulty, simulation parameters)';
