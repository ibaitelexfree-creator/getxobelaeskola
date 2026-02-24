-- ==========================================
-- FASE 3 y 4: LÓGICA DE PROGRESO AUTOMÁTICO
-- ==========================================

-- 1. Ampliar tabla de progreso para rastreo detallado de unidades
ALTER TABLE public.progreso_alumno 
ADD COLUMN IF NOT EXISTS secciones_vistas JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS tiempo_estudio_seg INT DEFAULT 0;

-- 2. Función para obtener el siguiente ID de la secuencia (para desbloqueos)
CREATE OR REPLACE FUNCTION public.obtener_siguiente_entidad(
    p_tipo_entidad TEXT,
    p_entidad_actual_id UUID
)
RETURNS UUID AS $$
DECLARE
    v_siguiente_id UUID;
BEGIN
    IF p_tipo_entidad = 'unidad' THEN
        SELECT u2.id INTO v_siguiente_id
        FROM public.unidades_didacticas u1
        JOIN public.unidades_didacticas u2 ON u1.modulo_id = u2.modulo_id
        WHERE u1.id = p_entidad_actual_id AND u2.orden = u1.orden + 1;
    ELSIF p_tipo_entidad = 'modulo' THEN
        SELECT m2.id INTO v_siguiente_id
        FROM public.modulos m1
        JOIN public.modulos m2 ON m1.curso_id = m2.curso_id
        WHERE m1.id = p_entidad_actual_id AND m2.orden = m1.orden + 1;
    ELSIF p_tipo_entidad = 'curso' THEN
        SELECT c2.id INTO v_siguiente_id
        FROM public.cursos c1
        JOIN public.cursos c2 ON c1.nivel_formacion_id = c2.nivel_formacion_id
        WHERE c1.id = p_entidad_actual_id AND c2.orden_en_nivel = c1.orden_en_nivel + 1;
    END IF;
    
    RETURN v_siguiente_id;
END;
$$ LANGUAGE plpgsql;

-- 3. Función Maestra: Recalcular Progreso Académico
-- Esta función se llama cada vez que algo cambia (quiz aprobado, sección leída, etc.)
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
        -- 1. Verificar quiz aprobado (>= 60%)
        -- 2. Verificar secciones vistas (3: teoria, practica, errores)
        -- 3. Verificar tiempo mínimo (se asume validado en el backend o por tiempo_estudio_seg)
        
        DECLARE
            v_quiz_aprobado BOOLEAN;
            v_num_secciones INT;
        BEGIN
            -- Ver si hay algún intento aprobado
            SELECT EXISTS (
                SELECT 1 FROM public.intentos_evaluacion i
                JOIN public.evaluaciones e ON i.evaluacion_id = e.id
                WHERE i.alumno_id = p_alumno_id 
                AND e.entidad_tipo = 'unidad' 
                AND e.entidad_id = p_entidad_id
                AND i.aprobado = TRUE
            ) INTO v_quiz_aprobado;
            
            -- Ver cuántas secciones se han visto
            SELECT jsonb_array_length(secciones_vistas) INTO v_num_secciones
            FROM public.progreso_alumno
            WHERE alumno_id = p_alumno_id AND tipo_entidad = 'unidad' AND entidad_id = p_entidad_id;
            
            -- Según diseño: completado si quiz aprobado Y las 3 secciones vistas
            -- Nota: el tiempo mínimo se valida antes de permitir completar, o aquí si se desea
            IF v_quiz_aprobado AND COALESCE(v_num_secciones, 0) >= 3 THEN
                v_completado := TRUE;
                v_porcentaje := 100;
            ELSE
                -- Porcentaje parcial: 25% por cada sección (75% total) + el quiz es el gatillo final?
                -- Ajustamos: cada sección 20%, quiz 40%.
                v_porcentaje := (LEAST(v_num_secciones, 3) * 20) + (CASE WHEN v_quiz_aprobado THEN 40 ELSE 0 END);
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
                -- 70% por unidades, 30% por examen
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
                -- Proporcional
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
            
            -- Por ahora no validamos habilidades aquí, pero se podría
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
        'porcentaje', v_porcentaje
    );
END;
$$ LANGUAGE plpgsql;
