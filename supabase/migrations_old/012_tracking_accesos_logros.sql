-- ==========================================
-- FASE 8: TRACKING DE ACCESOS Y MOTOR DE LOGROS EXTENDIDO
-- ==========================================

BEGIN;

-- 1. Tabla de Accesos Diarios
CREATE TABLE IF NOT EXISTS public.accesos_alumno (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alumno_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    hora_primer_acceso TIME NOT NULL DEFAULT CURRENT_TIME,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(alumno_id, fecha)
);

-- Habilitar RLS
ALTER TABLE public.accesos_alumno ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Accesos: lectura propia" ON public.accesos_alumno FOR SELECT USING (auth.uid() = alumno_id);

-- 2. Función expanded para evaluar logros
CREATE OR REPLACE FUNCTION public.evaluar_logros_alumno(p_alumno_id UUID, p_evento TEXT)
RETURNS VOID AS $$
DECLARE
    v_logro RECORD;
    v_cumple BOOLEAN;
    v_count INT;
    v_count_float FLOAT;
    v_streak INT;
    v_cond JSONB;
BEGIN
    -- Recorrer todos los logros que el alumno aún NO tiene
    FOR v_logro IN 
        SELECT l.* 
        FROM public.logros l
        LEFT JOIN public.logros_alumno la ON la.logro_id = l.id AND la.alumno_id = p_alumno_id
        WHERE la.id IS NULL
    LOOP
        v_cumple := FALSE;
        v_cond := v_logro.condicion_json;

        CASE v_cond->>'tipo'
            -- PROGRESS CATEGORY
            WHEN 'unidades_completadas' THEN
                IF p_evento = 'progreso_update' THEN
                    SELECT COUNT(*) INTO v_count FROM public.progreso_alumno 
                    WHERE alumno_id = p_alumno_id AND tipo_entidad = 'unidad' AND estado = 'completado';
                    v_cumple := v_count >= (v_cond->>'cantidad')::INT;
                END IF;

            WHEN 'modulos_completados' THEN
                IF p_evento = 'progreso_update' THEN
                    SELECT COUNT(*) INTO v_count FROM public.progreso_alumno 
                    WHERE alumno_id = p_alumno_id AND tipo_entidad = 'modulo' AND estado = 'completado';
                    v_cumple := v_count >= (v_cond->>'cantidad')::INT;
                END IF;

            WHEN 'cursos_aprobados' THEN
                IF p_evento = 'progreso_update' THEN
                    SELECT COUNT(*) INTO v_count FROM public.progreso_alumno 
                    WHERE alumno_id = p_alumno_id AND tipo_entidad = 'curso' AND estado = 'completado';
                    v_cumple := v_count >= (v_cond->>'cantidad')::INT;
                END IF;

            WHEN 'niveles_completados' THEN
                IF p_evento = 'progreso_update' THEN
                    SELECT COUNT(*) INTO v_count FROM public.progreso_alumno 
                    WHERE alumno_id = p_alumno_id AND tipo_entidad = 'nivel' AND estado = 'completado';
                    v_cumple := v_count >= (v_cond->>'cantidad')::INT;
                END IF;

            WHEN 'niveles_especificos' THEN
                IF p_evento = 'progreso_update' THEN
                    SELECT COUNT(*) INTO v_count 
                    FROM public.progreso_alumno p
                    JOIN public.niveles_formacion n ON p.entidad_id = n.id
                    WHERE p.alumno_id = p_alumno_id 
                      AND p.tipo_entidad = 'nivel' 
                      AND p.estado = 'completado'
                      AND n.slug = ANY(ARRAY(SELECT jsonb_array_elements_text(v_cond->'slugs')));
                    
                    v_cumple := v_count >= jsonb_array_length(v_cond->'slugs');
                END IF;

            -- PERFORMANCE CATEGORY
            WHEN 'puntuacion_maxima' THEN
                IF p_evento = 'evaluacion_submit' THEN
                    SELECT COUNT(*) INTO v_count FROM public.intentos_evaluacion 
                    WHERE alumno_id = p_alumno_id AND puntuacion = 100 AND estado = 'completado';
                    v_cumple := v_count >= (v_cond->>'cantidad')::INT;
                END IF;

            WHEN 'examenes_perfectos' THEN
                IF p_evento = 'evaluacion_submit' THEN
                    SELECT COUNT(*) INTO v_count 
                    FROM public.intentos_evaluacion i
                    JOIN public.evaluaciones e ON i.evaluacion_id = e.id
                    WHERE i.alumno_id = p_alumno_id 
                      AND e.tipo = 'examen_modulo'
                      AND i.puntuacion = 100 
                      AND i.estado = 'completado';
                    v_cumple := v_count >= (v_cond->>'cantidad')::INT;
                END IF;

            WHEN 'nota_examen_final' THEN
                IF p_evento = 'evaluacion_submit' THEN
                    SELECT EXISTS (
                        SELECT 1 FROM public.intentos_evaluacion i
                        JOIN public.evaluaciones e ON i.evaluacion_id = e.id
                        WHERE i.alumno_id = p_alumno_id 
                          AND e.tipo = 'examen_final'
                          AND i.puntuacion >= (v_cond->>'minima')::DECIMAL
                          AND i.estado = 'completado'
                    ) INTO v_cumple;
                END IF;

            WHEN 'examen_primera_vez' THEN
                IF p_evento = 'evaluacion_submit' THEN
                    -- Verificar si el último intento (el actual) es el primero de esa evaluación
                    -- Y si está aprobado.
                    -- Para simplificar: buscar evaluaciones donde el primer intento fue aprobado.
                    SELECT COUNT(*) INTO v_count
                    FROM (
                        SELECT id, 
                               ROW_NUMBER() OVER(PARTITION BY evaluacion_id ORDER BY created_at ASC) as n,
                               aprobado
                        FROM public.intentos_evaluacion
                        WHERE alumno_id = p_alumno_id
                    ) sub
                    WHERE sub.n = 1 AND sub.aprobado = TRUE;
                    
                    v_cumple := v_count >= (v_cond->>'cantidad')::INT;
                END IF;

            -- CONSTANCIA CATEGORY
            WHEN 'login_total' THEN
                IF p_evento = 'login' THEN
                    SELECT COUNT(*) INTO v_count FROM public.accesos_alumno WHERE alumno_id = p_alumno_id;
                    v_cumple := v_count >= (v_cond->>'cantidad')::INT;
                END IF;

            WHEN 'login_consecutivo' THEN
                IF p_evento = 'login' THEN
                    -- Cálculo de racha (simplificado plpgsql)
                    WITH RECURSIVE streaks AS (
                        SELECT fecha, 1 as streak
                        FROM public.accesos_alumno
                        WHERE alumno_id = p_alumno_id AND fecha = CURRENT_DATE
                        UNION ALL
                        SELECT a.fecha, s.streak + 1
                        FROM public.accesos_alumno a
                        JOIN streaks s ON a.fecha = s.fecha - INTERVAL '1 day'
                        WHERE a.alumno_id = p_alumno_id
                    )
                    SELECT MAX(streak) INTO v_streak FROM streaks;
                    
                    v_cumple := COALESCE(v_streak, 0) >= (v_cond->>'cantidad')::INT;
                END IF;

            WHEN 'login_temprano' THEN
                IF p_evento = 'login' THEN
                    SELECT COUNT(*) INTO v_count 
                    FROM public.accesos_alumno 
                    WHERE alumno_id = p_alumno_id 
                      AND EXTRACT(HOUR FROM hora_primer_acceso) < (v_cond->>'hora_max')::INT;
                    v_cumple := v_count >= (v_cond->>'cantidad')::INT;
                END IF;

            -- SKILLS CATEGORY
            WHEN 'habilidad_especifica' THEN
                IF p_evento = 'skill_update' THEN
                    SELECT EXISTS (
                        SELECT 1 FROM public.student_skills ss
                        JOIN public.skills s ON ss.skill_id = s.id
                        WHERE ss.student_id = p_alumno_id AND s.slug = v_cond->>'slug'
                    ) INTO v_cumple;
                END IF;

            WHEN 'habilidades_conjunto' THEN
                IF p_evento = 'skill_update' THEN
                    SELECT COUNT(*) INTO v_count 
                    FROM public.student_skills ss
                    JOIN public.skills s ON ss.skill_id = s.id
                    WHERE ss.student_id = p_alumno_id 
                      AND s.slug = ANY(ARRAY(SELECT jsonb_array_elements_text(v_cond->'slugs')));
                    v_cumple := v_count >= jsonb_array_length(v_cond->'slugs');
                END IF;

            WHEN 'habilidades_cantidad' THEN
                IF p_evento = 'skill_update' THEN
                    SELECT COUNT(*) INTO v_count FROM public.student_skills WHERE student_id = p_alumno_id;
                    v_cumple := v_count >= (v_cond->>'cantidad')::INT;
                END IF;

            -- PRACTICA CATEGORY
            WHEN 'horas_navegacion' THEN
                IF p_evento = 'horas_update' THEN
                    SELECT COALESCE(SUM(duracion_h), 0) INTO v_count_float FROM public.horas_navegacion 
                    WHERE alumno_id = p_alumno_id AND verificado = TRUE;
                    v_cumple := v_count_float >= (v_cond->>'cantidad')::FLOAT;
                END IF;

            WHEN 'horas_tipo' THEN
                IF p_evento = 'horas_update' THEN
                    SELECT COALESCE(SUM(duracion_h), 0) INTO v_count_float FROM public.horas_navegacion 
                    WHERE alumno_id = p_alumno_id AND verificado = TRUE AND tipo = v_cond->>'tipo_hora';
                    v_cumple := v_count_float >= (v_cond->>'cantidad')::FLOAT;
                END IF;

            WHEN 'modulo_perfecto' THEN
                IF p_evento = 'progreso_update' THEN
                    -- Se dispara cuando un módulo se completa (entidad_id es el modulo_id)
                    SELECT NOT EXISTS (
                        SELECT 1
                        FROM (
                            SELECT 
                                ROW_NUMBER() OVER(PARTITION BY evaluacion_id ORDER BY created_at ASC) as n,
                                aprobado
                            FROM public.intentos_evaluacion i
                            JOIN public.evaluaciones e ON i.evaluacion_id = e.id
                            WHERE i.alumno_id = p_alumno_id
                              AND (
                                (e.entidad_tipo = 'unidad' AND e.entidad_id IN (SELECT id FROM public.unidades_didacticas WHERE modulo_id = p_entidad_id))
                                OR (e.entidad_tipo = 'modulo' AND e.entidad_id = p_entidad_id)
                              )
                        ) sub
                        WHERE sub.n = 1 AND sub.aprobado = FALSE
                    ) INTO v_cumple;
                END IF;

            WHEN 'quizzes_consecutivos_aprobados' THEN
                IF p_evento = 'evaluacion_submit' THEN
                    SELECT NOT EXISTS (
                        SELECT 1 FROM (
                            SELECT n, aprobado, puntuacion
                            FROM (
                                SELECT 
                                    ROW_NUMBER() OVER(ORDER BY created_at DESC) as n,
                                    aprobado,
                                    puntuacion
                                FROM public.intentos_evaluacion i
                                JOIN public.evaluaciones e ON i.evaluacion_id = e.id
                                WHERE i.alumno_id = p_alumno_id AND e.tipo = 'quiz_unidad'
                                LIMIT (v_cond->>'cantidad')::INT
                            ) last_attempts
                            WHERE aprobado = FALSE OR puntuacion < (v_cond->>'minima')::INT
                        ) failed
                    ) AND (
                        SELECT COUNT(*) >= (v_cond->>'cantidad')::INT 
                        FROM public.intentos_evaluacion i
                        JOIN public.evaluaciones e ON i.evaluacion_id = e.id
                        WHERE i.alumno_id = p_alumno_id AND e.tipo = 'quiz_unidad'
                    ) INTO v_cumple;
                END IF;

            WHEN 'unidad_diaria_consecutiva' THEN
                IF p_evento = 'progreso_update' THEN
                    WITH daily_units AS (
                        SELECT DISTINCT DATE(fecha_completado) as day
                        FROM public.progreso_alumno
                        WHERE alumno_id = p_alumno_id AND tipo_entidad = 'unidad' AND estado = 'completado'
                    ),
                    streaks AS (
                        SELECT day, day - (ROW_NUMBER() OVER (ORDER BY day))::INT * INTERVAL '1 day' as grp
                        FROM daily_units
                    )
                    SELECT MAX(cnt) INTO v_count 
                    FROM (SELECT COUNT(*) as cnt FROM streaks GROUP BY grp) s;
                    
                    v_cumple := COALESCE(v_count, 0) >= (v_cond->>'cantidad')::INT;
                END IF;

            WHEN 'unidades_especificas_puntuacion' THEN
                IF p_evento = 'evaluacion_submit' THEN
                    -- Todas las unidades en la lista deben estar aprobadas con puntuación mínima
                    SELECT COUNT(*) INTO v_count
                    FROM public.intentos_evaluacion i
                    JOIN public.evaluaciones e ON i.evaluacion_id = e.id
                    JOIN public.unidades_didacticas u ON e.entidad_id = u.id
                    WHERE i.alumno_id = p_alumno_id 
                      AND e.entidad_tipo = 'unidad'
                      AND u.slug = ANY(ARRAY(SELECT jsonb_array_elements_text(v_cond->'slugs')))
                      AND i.puntuacion >= (v_cond->>'minima')::DECIMAL
                      AND i.aprobado = TRUE;
                    
                    v_cumple := v_count >= jsonb_array_length(v_cond->'slugs');
                END IF;

            ELSE
                v_cumple := FALSE;
        END CASE;

        -- Conceder logro si cumple
        IF v_cumple THEN
            INSERT INTO public.logros_alumno (alumno_id, logro_id, fecha_obtenido)
            VALUES (p_alumno_id, v_logro.id, NOW())
            ON CONFLICT (alumno_id, logro_id) DO NOTHING;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Trigger para Registro de Acceso Diario
CREATE OR REPLACE FUNCTION public.registrar_acceso_alumno()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.accesos_alumno (alumno_id, fecha, hora_primer_acceso)
    VALUES (NEW.id, CURRENT_DATE, CURRENT_TIME)
    ON CONFLICT (alumno_id, fecha) DO NOTHING;
    
    -- Disparar evaluación de logros de constancia
    PERFORM public.evaluar_logros_alumno(NEW.id, 'login');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Asumimos que el trigger se dispara al actualizar profiles o profiles_metadata
-- Pero para el MVP, dispararemos por RPC o Middleware
-- Si queremos trigger, lo ponemos en auth.users pero requiere permisos.
-- Lo pondremos en public.profiles cuando se actualiza last_sign_in_at (si existe) o similar.

-- 4. RPC para disparar desde Middleware / Callback
CREATE OR REPLACE FUNCTION public.track_daily_access()
RETURNS VOID AS $$
BEGIN
    IF auth.uid() IS NOT NULL THEN
        INSERT INTO public.accesos_alumno (alumno_id, fecha, hora_primer_acceso)
        VALUES (auth.uid(), CURRENT_DATE, CURRENT_TIME)
        ON CONFLICT (alumno_id, fecha) DO NOTHING;
        
        PERFORM public.evaluar_logros_alumno(auth.uid(), 'login');
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Trigger adicional para Habilidades (Phase 7 compatibility)
CREATE OR REPLACE FUNCTION public.trigger_evaluar_logros_skills()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM public.evaluar_logros_alumno(NEW.student_id, 'skill_update');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_evaluar_logros_skills ON public.student_skills;
CREATE TRIGGER tr_evaluar_logros_skills
AFTER INSERT ON public.student_skills
FOR EACH ROW EXECUTE FUNCTION public.trigger_evaluar_logros_skills();

COMMIT;
