-- ==========================================
-- FASE 18: MEJORA DEL SISTEMA DE DESBLOQUEO (VISTA INTELIGENTE)
-- ==========================================

-- Redefinimos la función RPC para que sea "inteligente":
-- Si no hay registro en progreso_alumno, calcula si debería estar disponible
-- basándose en la jerarquía y el orden.

CREATE OR REPLACE FUNCTION public.obtener_estado_desbloqueo_recursivo(p_alumno_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_resultado JSONB;
BEGIN
    WITH 
    niveles_estado AS (
        SELECT 
            n.id, 
            CASE 
                -- 1. Si ya tiene un estado explícito en la tabla, prevalece
                WHEN p.estado IS NOT NULL THEN p.estado
                -- 2. El Nivel 1 siempre está disponible por defecto
                WHEN n.orden = 1 THEN 'no_iniciado'
                -- 3. Si tiene prerrequisitos explícitos, verificar si todos están completados
                WHEN n.prerequisitos IS NOT NULL AND array_length(n.prerequisitos, 1) > 0 THEN
                    CASE WHEN NOT EXISTS (
                        SELECT 1 FROM unnest(n.prerequisitos) prereq_id
                        LEFT JOIN public.progreso_alumno pr ON pr.entidad_id = prereq_id 
                            AND pr.alumno_id = p_alumno_id 
                            AND pr.tipo_entidad = 'nivel'
                        WHERE pr.estado IS NULL OR pr.estado != 'completado'
                    ) THEN 'no_iniciado' ELSE 'bloqueado' END
                -- 4. Si no tiene prerrequisitos pero es Nivel n > 1, depende del Nivel n-1
                ELSE (
                    SELECT CASE WHEN p_prev.estado = 'completado' THEN 'no_iniciado' ELSE 'bloqueado' END
                    FROM public.niveles_formacion n_prev
                    LEFT JOIN public.progreso_alumno p_prev ON n_prev.id = p_prev.entidad_id 
                        AND p_prev.alumno_id = p_alumno_id 
                        AND p_prev.tipo_entidad = 'nivel'
                    WHERE n_prev.orden = n.orden - 1
                    LIMIT 1
                )
            END as estado
        FROM public.niveles_formacion n
        LEFT JOIN public.progreso_alumno p ON n.id = p.entidad_id AND p.alumno_id = p_alumno_id AND p.tipo_entidad = 'nivel'
    ),
    cursos_estado AS (
        SELECT 
            c.id, 
            c.nivel_formacion_id as parent_id,
            CASE 
                -- 1. Si el nivel padre está bloqueado, el curso está bloqueado
                WHEN ne.estado = 'bloqueado' THEN 'bloqueado'
                -- 2. Si ya tiene estado explícito, usarlo
                WHEN p.estado IS NOT NULL THEN p.estado
                -- 3. Si el nivel está disponible y es el curso 1, está disponible
                WHEN ne.estado IN ('no_iniciado', 'en_progreso', 'completado') AND c.orden_en_nivel = 1 THEN 'no_iniciado'
                -- 4. Si es curso n > 1, depende del curso n-1 del mismo nivel
                ELSE (
                    SELECT CASE WHEN p_prev.estado = 'completado' THEN 'no_iniciado' ELSE 'bloqueado' END
                    FROM public.cursos c_prev
                    LEFT JOIN public.progreso_alumno p_prev ON c_prev.id = p_prev.entidad_id 
                        AND p_prev.alumno_id = p_alumno_id 
                        AND p_prev.tipo_entidad = 'curso'
                    WHERE c_prev.nivel_formacion_id = c.nivel_formacion_id 
                    AND c_prev.orden_en_nivel = c.orden_en_nivel - 1
                    LIMIT 1
                )
            END as estado
        FROM public.cursos c
        JOIN niveles_estado ne ON c.nivel_formacion_id = ne.id
        LEFT JOIN public.progreso_alumno p ON c.id = p.entidad_id AND p.alumno_id = p_alumno_id AND p.tipo_entidad = 'curso'
    ),
    modulos_estado AS (
        SELECT 
            m.id, 
            m.curso_id as parent_id,
            CASE 
                WHEN ce.estado = 'bloqueado' THEN 'bloqueado'
                WHEN p.estado IS NOT NULL THEN p.estado
                WHEN ce.estado IN ('no_iniciado', 'en_progreso', 'completado') AND m.orden = 1 THEN 'no_iniciado'
                ELSE (
                    SELECT CASE WHEN p_prev.estado = 'completado' THEN 'no_iniciado' ELSE 'bloqueado' END
                    FROM public.modulos m_prev
                    LEFT JOIN public.progreso_alumno p_prev ON m_prev.id = p_prev.entidad_id 
                        AND p_prev.alumno_id = p_alumno_id 
                        AND p_prev.tipo_entidad = 'modulo'
                    WHERE m_prev.curso_id = m.curso_id AND m_prev.orden = m.orden - 1
                    LIMIT 1
                )
            END as estado
        FROM public.modulos m
        JOIN cursos_estado ce ON m.curso_id = ce.id
        LEFT JOIN public.progreso_alumno p ON m.id = p.entidad_id AND p.alumno_id = p_alumno_id AND p.tipo_entidad = 'modulo'
    ),
    unidades_estado AS (
        SELECT 
            u.id, 
            u.modulo_id as parent_id,
            CASE 
                WHEN me.estado = 'bloqueado' THEN 'bloqueado'
                WHEN p.estado IS NOT NULL THEN p.estado
                WHEN me.estado IN ('no_iniciado', 'en_progreso', 'completado') AND u.orden = 1 THEN 'no_iniciado'
                ELSE (
                    SELECT CASE WHEN p_prev.estado = 'completado' THEN 'no_iniciado' ELSE 'bloqueado' END
                    FROM public.unidades_didacticas u_prev
                    LEFT JOIN public.progreso_alumno p_prev ON u_prev.id = p_prev.entidad_id 
                        AND p_prev.alumno_id = p_alumno_id 
                        AND p_prev.tipo_entidad = 'unidad'
                    WHERE u_prev.modulo_id = u.modulo_id AND u_prev.orden = u.orden - 1
                    LIMIT 1
                )
            END as estado
        FROM public.unidades_didacticas u
        JOIN modulos_estado me ON u.modulo_id = me.id
        LEFT JOIN public.progreso_alumno p ON u.id = p.entidad_id AND p.alumno_id = p_alumno_id AND p.tipo_entidad = 'unidad'
    )
    SELECT jsonb_build_object(
        'niveles', (SELECT COALESCE(jsonb_object_agg(id, estado), '{}'::jsonb) FROM niveles_estado),
        'cursos', (SELECT COALESCE(jsonb_object_agg(id, estado), '{}'::jsonb) FROM cursos_estado),
        'modulos', (SELECT COALESCE(jsonb_object_agg(id, estado), '{}'::jsonb) FROM modulos_estado),
        'unidades', (SELECT COALESCE(jsonb_object_agg(id, estado), '{}'::jsonb) FROM unidades_estado)
    ) INTO v_resultado;

    RETURN v_resultado;
END;
$$ LANGUAGE plpgsql;
