-- 20240303000000_submit_evaluacion_atomic.sql
-- Añadir función RPC para asegurar atomicidad al enviar y finalizar un intento de evaluación

CREATE OR REPLACE FUNCTION public.submit_evaluacion_atomic(
    p_intento_id UUID,
    p_alumno_id UUID,
    p_respuestas JSONB,
    p_tiempo_empleado_seg INTEGER,
    p_timestamp TIMESTAMPTZ
)
RETURNS JSONB AS $$
DECLARE
    v_respuestas_merged JSONB;
BEGIN
    -- Realiza el merge atómico y actualiza el estado a completado
    UPDATE public.intentos_evaluacion
    SET
        respuestas_json = COALESCE(respuestas_json, '{}'::jsonb) || p_respuestas,
        tiempo_empleado_seg = p_tiempo_empleado_seg,
        estado = 'completado',
        fecha_completado = p_timestamp,
        ultima_actividad = p_timestamp
    WHERE id = p_intento_id
      AND alumno_id = p_alumno_id
      AND estado = 'en_progreso'
    RETURNING respuestas_json INTO v_respuestas_merged;

    -- Si no se actualizó ninguna fila (ej. ya completado o no pertenece al usuario)
    IF v_respuestas_merged IS NULL THEN
        RAISE EXCEPTION 'Intento no encontrado o ya completado';
    END IF;

    RETURN v_respuestas_merged;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
