-- ==========================================
-- PHASE 8: MOTOR DE LOGROS (ACHIEVEMENTS ENGINE)
-- ==========================================

-- 1. Función Principal de Evaluación de Logros
CREATE OR REPLACE FUNCTION public.evaluar_logros_alumno(p_alumno_id UUID, p_evento TEXT)
RETURNS VOID AS $$
DECLARE
    v_logro RECORD;
    v_cumple BOOLEAN;
    v_count INT;
BEGIN
    -- Recorrer todos los logros que el alumno aún NO tiene
    FOR v_logro IN 
        SELECT l.* 
        FROM public.logros l
        LEFT JOIN public.logros_alumno la ON la.logro_id = l.id AND la.alumno_id = p_alumno_id
        WHERE la.id IS NULL
    LOOP
        v_cumple := FALSE;

        -- Evaluar según el tipo de condición en el JSON
        CASE v_logro.condicion_json->>'tipo'
            
            WHEN 'unidades_completadas' THEN
                IF p_evento = 'progreso_update' THEN
                    SELECT COUNT(*) INTO v_count FROM public.progreso_alumno 
                    WHERE alumno_id = p_alumno_id AND tipo_entidad = 'unidad' AND estado = 'completado';
                    IF v_count >= (v_logro.condicion_json->>'cantidad')::INT THEN
                        v_cumple := TRUE;
                    END IF;
                END IF;

            WHEN 'modulos_completados' THEN
                IF p_evento = 'progreso_update' THEN
                    SELECT COUNT(*) INTO v_count FROM public.progreso_alumno 
                    WHERE alumno_id = p_alumno_id AND tipo_entidad = 'modulo' AND estado = 'completado';
                    IF v_count >= (v_logro.condicion_json->>'cantidad')::INT THEN
                        v_cumple := TRUE;
                    END IF;
                END IF;

            WHEN 'cursos_aprobados' THEN
                IF p_evento = 'progreso_update' THEN
                    SELECT COUNT(*) INTO v_count FROM public.progreso_alumno 
                    WHERE alumno_id = p_alumno_id AND tipo_entidad = 'curso' AND estado = 'completado';
                    IF v_count >= (v_logro.condicion_json->>'cantidad')::INT THEN
                        v_cumple := TRUE;
                    END IF;
                END IF;

            WHEN 'puntuacion_maxima' THEN
                IF p_evento = 'evaluacion_submit' THEN
                    SELECT COUNT(*) INTO v_count FROM public.intentos_evaluacion 
                    WHERE alumno_id = p_alumno_id AND puntuacion = 100 AND estado = 'completado';
                    IF v_count >= (v_logro.condicion_json->>'cantidad')::INT THEN
                        v_cumple := TRUE;
                    END IF;
                END IF;

            WHEN 'horas_navegacion' THEN
                IF p_evento = 'horas_update' THEN
                    SELECT SUM(duracion_h) INTO v_count FROM public.horas_navegacion 
                    WHERE alumno_id = p_alumno_id AND verificado = TRUE;
                    IF v_count >= (v_logro.condicion_json->>'cantidad')::INT THEN
                        v_cumple := TRUE;
                    END IF;
                END IF;

            -- Se pueden añadir más tipos de evaluación aquí
            ELSE
                v_cumple := FALSE;
        END CASE;

        -- Si cumple la condición, conceder el logro
        IF v_cumple THEN
            INSERT INTO public.logros_alumno (alumno_id, logro_id, fecha_obtenido)
            VALUES (p_alumno_id, v_logro.id, NOW())
            ON CONFLICT (alumno_id, logro_id) DO NOTHING;
            
            RAISE NOTICE 'Logro desbloqueado para alumno %: %', p_alumno_id, v_logro.nombre_es;
        END IF;

    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. Triggers para automatizar la evaluación

-- A. Al actualizar progreso
CREATE OR REPLACE FUNCTION public.trigger_evaluar_logros_progreso()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.estado = 'completado' AND (OLD.estado IS DISTINCT FROM 'completado' OR OLD.estado IS NULL) THEN
        PERFORM public.evaluar_logros_alumno(NEW.alumno_id, 'progreso_update');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_evaluar_logros_progreso ON public.progreso_alumno;
CREATE TRIGGER tr_evaluar_logros_progreso
AFTER UPDATE OR INSERT ON public.progreso_alumno
FOR EACH ROW EXECUTE FUNCTION public.trigger_evaluar_logros_progreso();


-- B. Al enviar una evaluación (asumiendo que hay una tabla intentos_evaluacion con columna puntuacion)
CREATE OR REPLACE FUNCTION public.trigger_evaluar_logros_evaluacion()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.estado = 'completado' AND (OLD.estado IS DISTINCT FROM 'completado' OR OLD.estado IS NULL) THEN
        PERFORM public.evaluar_logros_alumno(NEW.alumno_id, 'evaluacion_submit');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_evaluar_logros_evaluacion ON public.intentos_evaluacion;
CREATE TRIGGER tr_evaluar_logros_evaluacion
AFTER UPDATE OR INSERT ON public.intentos_evaluacion
FOR EACH ROW EXECUTE FUNCTION public.trigger_evaluar_logros_evaluacion();


-- C. Al registrar horas (opcional, si se quiere feedback inmediato tras verificación)
CREATE OR REPLACE FUNCTION public.trigger_evaluar_logros_horas()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.verificado = TRUE AND (OLD.verificado = FALSE OR OLD.verificado IS NULL) THEN
        PERFORM public.evaluar_logros_alumno(NEW.alumno_id, 'horas_update');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_evaluar_logros_horas ON public.horas_navegacion;
CREATE TRIGGER tr_evaluar_logros_horas
AFTER UPDATE ON public.horas_navegacion
FOR EACH ROW EXECUTE FUNCTION public.trigger_evaluar_logros_horas();
