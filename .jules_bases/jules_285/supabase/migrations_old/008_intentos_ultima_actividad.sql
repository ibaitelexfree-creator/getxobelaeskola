-- 008_intentos_ultima_actividad.sql
-- Añadir columna para tracking de actividad y detección de intentos abandonados

ALTER TABLE public.intentos_evaluacion
ADD COLUMN IF NOT EXISTS ultima_actividad TIMESTAMPTZ DEFAULT NOW();

-- Backfill: para intentos existentes, usar created_at como ultima_actividad
UPDATE public.intentos_evaluacion
SET ultima_actividad = COALESCE(fecha_completado, created_at)
WHERE ultima_actividad IS NULL;

COMMENT ON COLUMN public.intentos_evaluacion.ultima_actividad 
IS 'Timestamp del último autoguardado. Permite detectar intentos abandonados (TTL 24h) y calcular tiempo real empleado.';

-- Función RPC para merge atómico de respuestas (evita race conditions)
CREATE OR REPLACE FUNCTION public.merge_respuestas_autosave(
    p_intento_id UUID,
    p_alumno_id UUID,
    p_respuestas JSONB,
    p_timestamp TIMESTAMPTZ
)
RETURNS VOID AS $$
BEGIN
    UPDATE public.intentos_evaluacion
    SET 
        respuestas_json = COALESCE(respuestas_json, '{}'::jsonb) || p_respuestas,
        ultima_actividad = p_timestamp
    WHERE id = p_intento_id 
      AND alumno_id = p_alumno_id 
      AND estado = 'en_progreso';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
