-- ==========================================
-- FASE 5.1: SOPORTE PARA MEJOR PUNTUACIÓN Y REPLANTEO DE COOLDOWNS
-- ==========================================

-- 1. Añadir campo de mejor puntuación a progreso_alumno
ALTER TABLE public.progreso_alumno 
ADD COLUMN IF NOT EXISTS mejor_puntuacion DECIMAL(5, 2) DEFAULT 0.00;

-- 2. Actualizar la función maestra para incluir la mejor puntuación
CREATE OR REPLACE FUNCTION public.recalcular_progreso_alumno(
    p_alumno_id UUID,
    p_tipo_entidad TEXT,
    p_entidad_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_completado BOOLEAN := FALSE;
    v_porcentaje INT := 0;
    v_mejor_puntuacion DECIMAL(5, 2) := 0.00;
    v_siguiente_id UUID;
    v_parent_tipo TEXT;
    v_parent_id UUID;
    v_resultado JSONB;
BEGIN
    -- LÓGICA POR TIPO DE ENTIDAD
    
    IF p_tipo_entidad = 'unidad' THEN
        DECLARE
            v_quiz_aprobado BOOLEAN;
            v_num_secciones INT;
        BEGIN
            -- Obtener la MEJOR puntuación de cualquier intento completado
            SELECT COALESCE(MAX(puntuacion), 0.00) INTO v_mejor_puntuacion
            FROM public.intentos_evaluacion i
            JOIN public.evaluaciones e ON i.evaluacion_id = e.id
            WHERE i.alumno_id = p_alumno_id 
            AND e.entidad_tipo = 'unidad' 
            AND e.entidad_id = p_entidad_id
            AND i.estado = 'completado';

            -- Ver si está aprobado (basado en la mejor nota)
            SELECT v_mejor_puntuacion >= nota_aprobado INTO v_quiz_aprobado
            FROM public.evaluaciones
            WHERE entidad_tipo = 'unidad' AND entidad_id = p_entidad_id
            LIMIT 1;
            
            -- Ver cuántas secciones se han visto
            SELECT jsonb_array_length(secciones_vistas) INTO v_num_secciones
            FROM public.progreso_alumno
            WHERE alumno_id = p_alumno_id AND tipo_entidad = 'unidad' AND entidad_id = p_entidad_id;
            
            IF v_quiz_aprobado AND COALESCE(v_num_secciones, 0) >= 3 THEN
                v_completado := TRUE;
                v_porcentaje := 100;
            ELSE
                -- Porcentaje proporcional
                v_porcentaje := (LEAST(COALESCE(v_num_secciones, 0), 3) * 20) + (CASE WHEN v_quiz_aprobado THEN 40 ELSE 0 END);
            END IF;
        END;

    ELSIF p_tipo_entidad = 'modulo' THEN
        DECLARE
            v_total_unidades INT;
            v_unidades_completadas INT;
            v_examen_aprobado BOOLEAN;
        BEGIN
            SELECT COUNT(*) INTO v_total_unidades FROM public.unidades_didacticas WHERE modulo_id = p_entidad_id;
            
            SELECT COUNT(*) INTO v_unidades_completadas 
            FROM public.progreso_alumno p
            JOIN public.unidades_didacticas u ON p.entidad_id = u.id
            WHERE p.alumno_id = p_alumno_id 
            AND p.tipo_entidad = 'unidad' 
            AND u.modulo_id = p_entidad_id
            AND p.estado = 'completado';
            
            -- Obtener mejor puntuación del examen de módulo
            SELECT COALESCE(MAX(puntuacion), 0.00) INTO v_mejor_puntuacion
            FROM public.intentos_evaluacion i
            JOIN public.evaluaciones e ON i.evaluacion_id = e.id
            WHERE i.alumno_id = p_alumno_id 
            AND e.entidad_tipo = 'modulo' 
            AND e.entidad_id = p_entidad_id
            AND i.estado = 'completado';

            SELECT v_mejor_puntuacion >= nota_aprobado INTO v_examen_aprobado
            FROM public.evaluaciones
            WHERE entidad_tipo = 'modulo' AND entidad_id = p_entidad_id
            LIMIT 1;
            
            IF v_unidades_completadas = v_total_unidades AND v_examen_aprobado THEN
                v_completado := TRUE;
                v_porcentaje := 100;
            ELSE
                v_porcentaje := ((v_unidades_completadas::FLOAT / NULLIF(v_total_unidades, 0)::FLOAT) * 70)::INT 
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
            SELECT COUNT(*) INTO v_total_modulos FROM public.modulos WHERE curso_id = p_entidad_id;
            
            SELECT COUNT(*) INTO v_modulos_completados 
            FROM public.progreso_alumno p
            JOIN public.modulos m ON p.entidad_id = m.id
            WHERE p.alumno_id = p_alumno_id 
            AND p.tipo_entidad = 'modulo' 
            AND m.curso_id = p_entidad_id
            AND p.estado = 'completado';
            
            -- Obtener mejor puntuación examen final
            SELECT COALESCE(MAX(puntuacion), 0.00) INTO v_mejor_puntuacion
            FROM public.intentos_evaluacion i
            JOIN public.evaluaciones e ON i.evaluacion_id = e.id
            WHERE i.alumno_id = p_alumno_id 
            AND e.entidad_tipo = 'curso' 
            AND e.entidad_id = p_entidad_id
            AND i.estado = 'completado';

            SELECT v_mejor_puntuacion >= nota_aprobado INTO v_examen_final_aprobado
            FROM public.evaluaciones
            WHERE entidad_tipo = 'curso' AND entidad_id = p_entidad_id
            LIMIT 1;
            
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
                v_porcentaje := ((v_modulos_completados::FLOAT / NULLIF(v_total_modulos, 0)::FLOAT) * 60)::INT 
                                + (CASE WHEN v_examen_final_aprobado THEN 30 ELSE 0 END)
                                + (LEAST(v_horas_actuales / NULLIF(v_horas_requeridas, 0)::FLOAT, 1) * 10)::INT;
            END IF;
        END;

    ELSIF p_tipo_entidad = 'nivel' THEN
        DECLARE
            v_total_cursos INT;
            v_cursos_completados INT;
        BEGIN
            SELECT COUNT(*) INTO v_total_cursos FROM public.cursos WHERE nivel_formacion_id = p_entidad_id;
            
            SELECT COUNT(*) INTO v_cursos_completados 
            FROM public.progreso_alumno p
            JOIN public.cursos c ON p.entidad_id = c.id
            WHERE p.alumno_id = p_alumno_id 
            AND p.tipo_entidad = 'curso' 
            AND c.nivel_formacion_id = p_entidad_id
            AND p.estado = 'completado';
            
            IF v_cursos_completados = v_total_cursos THEN
                v_completado := TRUE;
                v_porcentaje := 100;
            ELSE
                v_porcentaje := ((v_cursos_completados::FLOAT / NULLIF(v_total_cursos, 0)::FLOAT) * 100)::INT;
            END IF;
        END;
    END IF;

    -- ACTUALIZAR REGISTRO ACTUAL
    UPDATE public.progreso_alumno
    SET 
        estado = CASE WHEN v_completado THEN 'completado' ELSE 'en_progreso' END,
        porcentaje = v_porcentaje,
        mejor_puntuacion = v_mejor_puntuacion,
        fecha_completado = CASE WHEN v_completado AND fecha_completado IS NULL THEN NOW() ELSE fecha_completado END,
        updated_at = NOW()
    WHERE alumno_id = p_alumno_id AND tipo_entidad = p_tipo_entidad AND entidad_id = p_entidad_id;

    -- SI NO EXISTE REGISTRO, INSERTARLO
    IF NOT FOUND THEN
        INSERT INTO public.progreso_alumno (alumno_id, tipo_entidad, entidad_id, estado, porcentaje, mejor_puntuacion, fecha_completado)
        VALUES (
            p_alumno_id, 
            p_tipo_entidad, 
            p_entidad_id, 
            CASE WHEN v_completado THEN 'completado' ELSE 'en_progreso' END, 
            v_porcentaje, 
            v_mejor_puntuacion,
            CASE WHEN v_completado THEN NOW() ELSE NULL END
        );
    END IF;

    -- SI SE COMPLETÓ -> DESBLOQUEAR SIGUIENTE (Lógica existente mantenida)
    IF v_completado THEN
        v_siguiente_id := public.obtener_siguiente_entidad(p_tipo_entidad, p_entidad_id);
        
        IF v_siguiente_id IS NOT NULL THEN
            INSERT INTO public.progreso_alumno (alumno_id, tipo_entidad, entidad_id, estado)
            VALUES (p_alumno_id, p_tipo_entidad, v_siguiente_id, 'en_progreso')
            ON CONFLICT (alumno_id, tipo_entidad, entidad_id) 
            DO UPDATE SET estado = 'en_progreso' WHERE public.progreso_alumno.estado = 'bloqueado' OR public.progreso_alumno.estado = 'no_iniciado';
        END IF;
        
        -- PROPAGAR HACIA ARRIBA
        IF p_tipo_entidad = 'unidad' THEN
            SELECT modulo_id INTO v_parent_id FROM public.unidades_didacticas WHERE id = p_entidad_id;
            PERFORM public.recalcular_progreso_alumno(p_alumno_id, 'modulo', v_parent_id);
        ELSIF p_tipo_entidad = 'modulo' THEN
            SELECT curso_id INTO v_parent_id FROM public.modulos WHERE id = p_entidad_id;
            PERFORM public.recalcular_progreso_alumno(p_alumno_id, 'curso', v_parent_id);
        ELSIF p_tipo_entidad = 'curso' THEN
            SELECT nivel_formacion_id INTO v_parent_id FROM public.cursos WHERE id = p_entidad_id;
            PERFORM public.recalcular_progreso_alumno(p_alumno_id, 'nivel', v_parent_id);
        END IF;
    END IF;

    RETURN jsonb_build_object(
        'entidad_id', p_entidad_id,
        'tipo_entidad', p_tipo_entidad,
        'estado', CASE WHEN v_completado THEN 'completado' ELSE 'en_progreso' END,
        'porcentaje', v_porcentaje,
        'mejor_puntuacion', v_mejor_puntuacion
    );
END;
$$ LANGUAGE plpgsql;
