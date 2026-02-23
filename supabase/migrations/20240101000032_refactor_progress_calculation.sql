-- Migration: Refactor student progress calculation to use esquema_cursos view
-- Description: Creates a flattened view of the course hierarchy and updates the progress calculation function to use it.

-- 1. Create View: Esquema de Cursos (Flattened Hierarchy)
CREATE OR REPLACE VIEW public.esquema_cursos AS
SELECT
    n.id AS nivel_id,
    c.id AS curso_id,
    m.id AS modulo_id,
    u.id AS unidad_id
FROM public.niveles_formacion n
JOIN public.cursos c ON n.id = c.nivel_formacion_id
JOIN public.modulos m ON c.id = m.curso_id
JOIN public.unidades_didacticas u ON m.id = u.modulo_id;

-- 2. Function: Recalculate Progress (Refactored to use View)
CREATE OR REPLACE FUNCTION public.recalcular_progreso_alumno(
    p_alumno_id UUID,
    p_tipo_entidad TEXT,
    p_entidad_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_completado BOOLEAN := FALSE;
    v_porcentaje INT := 0;
    v_siguiente_id UUID;
    v_parent_tipo TEXT;
    v_parent_id UUID;
    v_resultado JSONB;
BEGIN
    -- LÓGICA POR TIPO DE ENTIDAD

    IF p_tipo_entidad = 'unidad' THEN
        -- Unit Logic: Remains mostly the same as it depends on local state (quiz + sections seen)
        DECLARE
            v_quiz_aprobado BOOLEAN;
            v_num_secciones INT;
        BEGIN
            SELECT EXISTS (
                SELECT 1 FROM public.intentos_evaluacion i
                JOIN public.evaluaciones e ON i.evaluacion_id = e.id
                WHERE i.alumno_id = p_alumno_id
                AND e.entidad_tipo = 'unidad'
                AND e.entidad_id = p_entidad_id
                AND i.aprobado = TRUE
            ) INTO v_quiz_aprobado;

            SELECT jsonb_array_length(secciones_vistas) INTO v_num_secciones
            FROM public.progreso_alumno
            WHERE alumno_id = p_alumno_id AND tipo_entidad = 'unidad' AND entidad_id = p_entidad_id;

            -- Weight: 20% per section (up to 3) + 40% for quiz
            IF v_quiz_aprobado AND COALESCE(v_num_secciones, 0) >= 3 THEN
                v_completado := TRUE;
                v_porcentaje := 100;
            ELSE
                -- Fix: Ensure NULL v_num_secciones is treated as 0 in LEAST
                v_porcentaje := (LEAST(COALESCE(v_num_secciones, 0), 3) * 20) + (CASE WHEN v_quiz_aprobado THEN 40 ELSE 0 END);
            END IF;
        END;

    ELSIF p_tipo_entidad = 'modulo' THEN
        DECLARE
            v_total_unidades INT;
            v_unidades_completadas INT;
            v_examen_aprobado BOOLEAN;
        BEGIN
            -- Refactor: Use esquema_cursos for total count
            SELECT COUNT(unidad_id) INTO v_total_unidades
            FROM public.esquema_cursos
            WHERE modulo_id = p_entidad_id;

            -- Refactor: Use esquema_cursos for completed count
            SELECT COUNT(DISTINCT p.entidad_id) INTO v_unidades_completadas
            FROM public.progreso_alumno p
            JOIN public.esquema_cursos e ON p.entidad_id = e.unidad_id
            WHERE p.alumno_id = p_alumno_id
            AND p.tipo_entidad = 'unidad'
            AND e.modulo_id = p_entidad_id
            AND p.estado = 'completado';

            SELECT EXISTS (
                SELECT 1 FROM public.intentos_evaluacion i
                JOIN public.evaluaciones e ON i.evaluacion_id = e.id
                WHERE i.alumno_id = p_alumno_id
                AND e.entidad_tipo = 'modulo'
                AND e.entidad_id = p_entidad_id
                AND i.aprobado = TRUE
            ) INTO v_examen_aprobado;

            IF v_unidades_completadas = v_total_unidades AND v_examen_aprobado THEN
                v_completado := TRUE;
                v_porcentaje := 100;
            ELSE
                -- Weight: 70% units + 30% exam
                -- Fix: Handle division by zero/null if module has no units
                v_porcentaje := COALESCE(((v_unidades_completadas::FLOAT / NULLIF(v_total_unidades, 0)::FLOAT) * 70)::INT, 0)
                                + (CASE WHEN v_examen_aprobado THEN 30 ELSE 0 END);
            END IF;
        END;

    ELSIF p_tipo_entidad = 'curso' THEN
        DECLARE
            v_total_modulos INT;
            v_modulos_completados INT;
            v_examen_final_aprobado BOOLEAN;
            v_horas_requeridas INT;
            v_horas_actuales FLOAT;
        BEGIN
            -- Refactor: Use esquema_cursos for total count (DISTINCT modulo_id)
            SELECT COUNT(DISTINCT modulo_id) INTO v_total_modulos
            FROM public.esquema_cursos
            WHERE curso_id = p_entidad_id;

            -- Refactor: Use esquema_cursos for completed count
            SELECT COUNT(DISTINCT p.entidad_id) INTO v_modulos_completados
            FROM public.progreso_alumno p
            JOIN public.esquema_cursos e ON p.entidad_id = e.modulo_id
            WHERE p.alumno_id = p_alumno_id
            AND p.tipo_entidad = 'modulo'
            AND e.curso_id = p_entidad_id
            AND p.estado = 'completado';

            SELECT EXISTS (
                SELECT 1 FROM public.intentos_evaluacion i
                JOIN public.evaluaciones e ON i.evaluacion_id = e.id
                WHERE i.alumno_id = p_alumno_id
                AND e.entidad_tipo = 'curso'
                AND e.entidad_id = p_entidad_id
                AND i.aprobado = TRUE
            ) INTO v_examen_final_aprobado;

            SELECT horas_practicas INTO v_horas_requeridas FROM public.cursos WHERE id = p_entidad_id;

            SELECT COALESCE(SUM(duracion_h), 0) INTO v_horas_actuales
            FROM public.horas_navegacion
            WHERE alumno_id = p_alumno_id AND verificado = TRUE;

            IF v_modulos_completados = v_total_modulos
               AND v_examen_final_aprobado
               AND v_horas_actuales >= v_horas_requeridas THEN
                v_completado := TRUE;
                v_porcentaje := 100;
            ELSE
                -- Weight: 60% modules + 30% exam + 10% hours
                -- Fix: Handle division by zero/null
                v_porcentaje := COALESCE(((v_modulos_completados::FLOAT / NULLIF(v_total_modulos, 0)::FLOAT) * 60)::INT, 0)
                                + (CASE WHEN v_examen_final_aprobado THEN 30 ELSE 0 END)
                                + COALESCE((LEAST(v_horas_actuales / NULLIF(v_horas_requeridas, 0)::FLOAT, 1) * 10)::INT, 0);
            END IF;
        END;

    ELSIF p_tipo_entidad = 'nivel' THEN
        DECLARE
            v_total_cursos INT;
            v_cursos_completados INT;
        BEGIN
            -- Refactor: Use esquema_cursos for total count (DISTINCT curso_id)
            SELECT COUNT(DISTINCT curso_id) INTO v_total_cursos
            FROM public.esquema_cursos
            WHERE nivel_id = p_entidad_id;

            -- Refactor: Use esquema_cursos for completed count
            SELECT COUNT(DISTINCT p.entidad_id) INTO v_cursos_completados
            FROM public.progreso_alumno p
            JOIN public.esquema_cursos e ON p.entidad_id = e.curso_id
            WHERE p.alumno_id = p_alumno_id
            AND p.tipo_entidad = 'curso'
            AND e.nivel_id = p_entidad_id
            AND p.estado = 'completado';

            IF v_cursos_completados = v_total_cursos THEN
                v_completado := TRUE;
                v_porcentaje := 100;
            ELSE
                -- Fix: Handle division by zero/null
                v_porcentaje := COALESCE(((v_cursos_completados::FLOAT / NULLIF(v_total_cursos, 0)::FLOAT) * 100)::INT, 0);
            END IF;
        END;
    END IF;

    -- ACTUALIZAR REGISTRO ACTUAL
    UPDATE public.progreso_alumno
    SET
        estado = CASE WHEN v_completado THEN 'completado' ELSE 'en_progreso' END,
        porcentaje = v_porcentaje,
        fecha_completado = CASE WHEN v_completado AND fecha_completado IS NULL THEN NOW() ELSE fecha_completado END,
        updated_at = NOW()
    WHERE alumno_id = p_alumno_id AND tipo_entidad = p_tipo_entidad AND entidad_id = p_entidad_id;

    -- SI SE COMPLETÓ -> DESBLOQUEAR SIGUIENTE
    IF v_completado THEN
        v_siguiente_id := public.obtener_siguiente_entidad(p_tipo_entidad, p_entidad_id);

        IF v_siguiente_id IS NOT NULL THEN
            INSERT INTO public.progreso_alumno (alumno_id, tipo_entidad, entidad_id, estado)
            VALUES (p_alumno_id, p_tipo_entidad, v_siguiente_id, 'en_progreso')
            ON CONFLICT (alumno_id, tipo_entidad, entidad_id)
            DO UPDATE SET estado = 'en_progreso' WHERE public.progreso_alumno.estado = 'bloqueado';
        END IF;

        -- PROPAGAR HACIA ARRIBA (Using esquema_cursos for simplified parent lookup)
        -- Note: We use DISTINCT and LIMIT 1 because multiple rows share the same parent ID.
        IF p_tipo_entidad = 'unidad' THEN
            SELECT DISTINCT modulo_id INTO v_parent_id FROM public.esquema_cursos WHERE unidad_id = p_entidad_id LIMIT 1;
            IF v_parent_id IS NOT NULL THEN
                PERFORM public.recalcular_progreso_alumno(p_alumno_id, 'modulo', v_parent_id);
            END IF;
        ELSIF p_tipo_entidad = 'modulo' THEN
            SELECT DISTINCT curso_id INTO v_parent_id FROM public.esquema_cursos WHERE modulo_id = p_entidad_id LIMIT 1;
            IF v_parent_id IS NOT NULL THEN
                PERFORM public.recalcular_progreso_alumno(p_alumno_id, 'curso', v_parent_id);
            END IF;
        ELSIF p_tipo_entidad = 'curso' THEN
            SELECT DISTINCT nivel_id INTO v_parent_id FROM public.esquema_cursos WHERE curso_id = p_entidad_id LIMIT 1;
            IF v_parent_id IS NOT NULL THEN
                PERFORM public.recalcular_progreso_alumno(p_alumno_id, 'nivel', v_parent_id);
            END IF;
        END IF;
    END IF;

    RETURN jsonb_build_object(
        'entidad_id', p_entidad_id,
        'tipo_entidad', p_tipo_entidad,
        'estado', CASE WHEN v_completado THEN 'completado' ELSE 'en_progreso' END,
        'porcentaje', v_porcentaje
    );
END;
$$ LANGUAGE plpgsql;
