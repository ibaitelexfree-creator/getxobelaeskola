-- ==========================================
-- FASE 11.5: SISTEMA DE BLOQUEO RECURSIVO (EFECTIVO)
-- ==========================================

-- 1. Nueva función RPC para obtener el estado de desbloqueo heredado
CREATE OR REPLACE FUNCTION public.obtener_estado_desbloqueo_recursivo(p_alumno_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_resultado JSONB;
BEGIN
    -- Utilizamos una tabla temporal lógica para calcular los estados heredados
    WITH 
    niveles_estado AS (
        SELECT 
            n.id, 
            COALESCE(p.estado, 'bloqueado') as estado
        FROM public.niveles_formacion n
        LEFT JOIN public.progreso_alumno p ON n.id = p.entidad_id AND p.alumno_id = p_alumno_id AND p.tipo_entidad = 'nivel'
    ),
    cursos_estado AS (
        SELECT 
            c.id, 
            c.nivel_formacion_id as parent_id,
            -- Si el nivel padre está bloqueado, el curso está bloqueado
            CASE 
                WHEN ne.estado = 'bloqueado' THEN 'bloqueado'
                ELSE COALESCE(p.estado, 'bloqueado')
            END as estado
        FROM public.cursos c
        JOIN niveles_estado ne ON c.nivel_formacion_id = ne.id
        LEFT JOIN public.progreso_alumno p ON c.id = p.entidad_id AND p.alumno_id = p_alumno_id AND p.tipo_entidad = 'course'
    ),
    modulos_estado AS (
        SELECT 
            m.id, 
            m.curso_id as parent_id,
            -- Si el curso padre está bloqueado, el módulo está bloqueado
            CASE 
                WHEN ce.estado = 'bloqueado' THEN 'bloqueado'
                ELSE COALESCE(p.estado, 'bloqueado')
            END as estado
        FROM public.modulos m
        JOIN cursos_estado ce ON m.curso_id = ce.id
        LEFT JOIN public.progreso_alumno p ON m.id = p.entidad_id AND p.alumno_id = p_alumno_id AND p.tipo_entidad = 'modulo'
    ),
    unidades_estado AS (
        SELECT 
            u.id, 
            u.modulo_id as parent_id,
            -- Si el módulo padre está bloqueado, la unidad está bloqueada
            CASE 
                WHEN me.estado = 'bloqueado' THEN 'bloqueado'
                ELSE COALESCE(p.estado, 'bloqueado')
            END as estado
        FROM public.unidades_didacticas u
        JOIN modulos_estado me ON u.modulo_id = me.id
        LEFT JOIN public.progreso_alumno p ON u.id = p.entidad_id AND p.alumno_id = p_alumno_id AND p.tipo_entidad = 'unidad'
    )
    SELECT jsonb_build_object(
        'niveles', (SELECT jsonb_object_agg(id, estado) FROM niveles_estado),
        'cursos', (SELECT jsonb_object_agg(id, estado) FROM cursos_estado),
        'modulos', (SELECT jsonb_object_agg(id, estado) FROM modulos_estado),
        'unidades', (SELECT jsonb_object_agg(id, estado) FROM unidades_estado)
    ) INTO v_resultado;

    RETURN v_resultado;
END;
$$ LANGUAGE plpgsql;

-- 2. Modificar la API para que use esta nueva función
-- (Esto se hará en el archivo de la ruta Next.js)
