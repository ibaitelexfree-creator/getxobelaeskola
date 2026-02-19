-- ==========================================
-- FIX: Update evaluar_habilidades to use correct course slugs & logic
-- ==========================================

-- 1. Fix the function
CREATE OR REPLACE FUNCTION public.evaluar_habilidades(p_alumno_id UUID)
RETURNS TABLE (
    habilidad_slug TEXT,
    habilidad_nombre TEXT,
    recien_obtenida BOOLEAN
) AS $$
DECLARE
    v_habilidad RECORD;
    v_ya_tiene BOOLEAN;
    v_cumple_condicion BOOLEAN;
BEGIN
    -- Iterar sobre cada habilidad del catálogo
    FOR v_habilidad IN 
        SELECT id, slug, nombre_es
        FROM public.habilidades
        ORDER BY orden_visual
    LOOP
        -- Verificar si el alumno ya tiene esta habilidad
        SELECT EXISTS(
            SELECT 1 
            FROM public.habilidades_alumno 
            WHERE alumno_id = p_alumno_id 
            AND habilidad_id = v_habilidad.id
        ) INTO v_ya_tiene;

        -- Si ya la tiene, pasar a la siguiente
        IF v_ya_tiene THEN
            CONTINUE;
        END IF;

        -- Evaluar condición específica según el slug de la habilidad
        v_cumple_condicion := FALSE;

        CASE v_habilidad.slug
            
            -- 1. Marinero de Agua Dulce: Completar Módulo 1 (Orden 1)
            WHEN 'marinero-agua-dulce' THEN
                SELECT EXISTS(
                    SELECT 1
                    FROM public.progreso_alumno pa
                    JOIN public.modulos m ON m.id = pa.entidad_id
                    JOIN public.cursos c ON c.id = m.curso_id
                    JOIN public.niveles_formacion n ON n.id = c.nivel_id
                    WHERE pa.alumno_id = p_alumno_id
                    AND pa.tipo_entidad = 'modulo'
                    AND pa.estado = 'completado'
                    AND m.orden = 1
                    AND (c.slug LIKE 'iniciacion%' OR c.slug = 'vela-ligera')
                    -- AND n.orden = 1 -- Use orden instead of nivel_numero if needed, or remove if check is redundant
                ) INTO v_cumple_condicion;

            -- 2. Domador del Viento: Completar Módulo 2
            WHEN 'domador-viento' THEN
                SELECT EXISTS(
                    SELECT 1
                    FROM public.progreso_alumno pa
                    JOIN public.modulos m ON m.id = pa.entidad_id
                    JOIN public.cursos c ON c.id = m.curso_id
                    WHERE pa.alumno_id = p_alumno_id
                    AND pa.tipo_entidad = 'modulo'
                    AND pa.estado = 'completado'
                    AND m.orden = 2
                    AND (c.slug LIKE 'iniciacion%' OR c.slug = 'vela-ligera')
                ) INTO v_cumple_condicion;

            -- 3. Manos de Marinero: Completar unidad de Nudos + ≥ 90% en quiz
            WHEN 'manos-marinero' THEN
                SELECT EXISTS(
                    SELECT 1
                    FROM public.progreso_alumno pa
                    JOIN public.unidades_didacticas u ON u.id = pa.entidad_id
                    JOIN public.intentos_evaluacion ie ON ie.alumno_id = pa.alumno_id
                    JOIN public.evaluaciones e ON e.id = ie.evaluacion_id
                    WHERE pa.alumno_id = p_alumno_id
                    AND pa.tipo_entidad = 'unidad'
                    AND pa.estado = 'completado'
                    AND LOWER(u.nombre_es) LIKE '%nudo%'
                    AND e.entidad_id = u.id
                    AND e.tipo = 'quiz_unidad'
                    AND ie.puntuacion_porcentaje >= 90
                ) INTO v_cumple_condicion;

            -- 4. Trimador
            WHEN 'trimador' THEN
                SELECT EXISTS(
                    SELECT 1
                    FROM public.progreso_alumno pa
                    JOIN public.modulos m ON m.id = pa.entidad_id
                    LEFT JOIN public.intentos_evaluacion ie ON ie.alumno_id = pa.alumno_id
                    WHERE pa.alumno_id = p_alumno_id
                    AND pa.tipo_entidad = 'modulo'
                    AND pa.estado = 'completado'
                    AND LOWER(m.nombre_es) LIKE '%trimado%'
                    AND ie.puntuacion_porcentaje >= 80
                ) INTO v_cumple_condicion;

            -- 5. Táctico
            WHEN 'tactico' THEN
                SELECT EXISTS(
                    SELECT 1
                    FROM public.progreso_alumno pa
                    JOIN public.modulos m ON m.id = pa.entidad_id
                    WHERE pa.alumno_id = p_alumno_id
                    AND pa.tipo_entidad = 'modulo'
                    AND pa.estado = 'completado'
                    AND (LOWER(m.nombre_es) LIKE '%táctica%' OR LOWER(m.nombre_es) LIKE '%regla%')
                ) INTO v_cumple_condicion;

            -- 6. Patrón de Rescate
            WHEN 'patron-rescate' THEN
                SELECT EXISTS(
                    SELECT 1
                    FROM public.progreso_alumno pa
                    JOIN public.modulos m ON m.id = pa.entidad_id
                    LEFT JOIN public.intentos_evaluacion ie ON ie.alumno_id = pa.alumno_id
                    WHERE pa.alumno_id = p_alumno_id
                    AND pa.tipo_entidad = 'modulo'
                    AND pa.estado = 'completado'
                    AND LOWER(m.nombre_es) LIKE '%seguridad%'
                    AND ie.puntuacion_porcentaje >= 85
                ) INTO v_cumple_condicion;

            -- 7. Regatista
            WHEN 'regatista' THEN
                SELECT EXISTS(
                    SELECT 1
                    FROM public.progreso_alumno pa
                    JOIN public.cursos c ON c.id = pa.entidad_id
                    WHERE pa.alumno_id = p_alumno_id
                    AND pa.tipo_entidad = 'curso'
                    AND pa.estado = 'completado'
                    -- Check level dynamically or by slug if needed
                ) AND EXISTS(
                    SELECT 1
                    FROM public.horas_navegacion hn
                    WHERE hn.alumno_id = p_alumno_id
                    AND hn.tipo = 'regata'
                    AND hn.duracion_h >= 1
                ) INTO v_cumple_condicion;

            -- 8. Patrón de Bahía (Nivel 4)
             WHEN 'patron-bahia' THEN
                SELECT EXISTS(
                    SELECT 1
                    FROM public.progreso_alumno pa
                    JOIN public.niveles_formacion n ON n.id = pa.entidad_id
                    WHERE pa.alumno_id = p_alumno_id
                    AND pa.tipo_entidad = 'nivel'
                    AND pa.estado = 'completado'
                    AND n.orden >= 4 -- Using orden instead of nivel_numero
                ) INTO v_cumple_condicion;

            -- 9. Lobo de Mar
            WHEN 'lobo-mar' THEN
                SELECT EXISTS(
                    SELECT 1
                    FROM public.progreso_alumno pa
                    JOIN public.niveles_formacion n ON n.id = pa.entidad_id
                    WHERE pa.alumno_id = p_alumno_id
                    AND pa.tipo_entidad = 'nivel'
                    AND pa.estado = 'completado'
                    AND n.orden >= 5
                ) AND (
                    SELECT COALESCE(SUM(hn.duracion_h), 0)
                    FROM public.horas_navegacion hn
                    WHERE hn.alumno_id = p_alumno_id
                ) >= 80 INTO v_cumple_condicion;

            -- 10. Oficial de Seguridad
            WHEN 'oficial-seguridad' THEN
                SELECT EXISTS(
                    SELECT 1
                    FROM public.progreso_alumno pa
                    JOIN public.niveles_formacion n ON n.id = pa.entidad_id
                    WHERE pa.alumno_id = p_alumno_id
                    AND pa.tipo_entidad = 'nivel'
                    AND pa.estado = 'completado'
                    AND n.orden >= 6
                    AND pa.nota_final >= 80
                ) INTO v_cumple_condicion;

            -- 11. Meteorólogo de Abordo
            WHEN 'meteorologo-abordo' THEN
                SELECT EXISTS(
                    SELECT 1
                    FROM public.progreso_alumno pa
                    JOIN public.niveles_formacion n ON n.id = pa.entidad_id
                    WHERE pa.alumno_id = p_alumno_id
                    AND pa.tipo_entidad = 'nivel'
                    AND pa.estado = 'completado'
                    AND n.orden >= 7
                    AND pa.nota_final >= 80
                ) INTO v_cumple_condicion;

            -- 12. Capitán
            WHEN 'capitan' THEN
                SELECT (
                    SELECT COUNT(DISTINCT n.id)
                    FROM public.progreso_alumno pa
                    JOIN public.niveles_formacion n ON n.id = pa.entidad_id
                    WHERE pa.alumno_id = p_alumno_id
                    AND pa.tipo_entidad = 'nivel'
                    AND pa.estado = 'completado'
                ) >= 7 AND ( -- Assume 7 levels total
                    SELECT COALESCE(SUM(hn.duracion_h), 0)
                    FROM public.horas_navegacion hn
                    WHERE hn.alumno_id = p_alumno_id
                ) >= 100 INTO v_cumple_condicion;

        END CASE;

        -- Si cumple la condición y no la tiene, concederla
        IF v_cumple_condicion THEN
            INSERT INTO public.habilidades_alumno (alumno_id, habilidad_id)
            VALUES (p_alumno_id, v_habilidad.id)
            ON CONFLICT (alumno_id, habilidad_id) DO NOTHING;

            -- Devolver la habilidad recién obtenida
            RETURN QUERY SELECT 
                v_habilidad.slug,
                v_habilidad.nombre_es,
                TRUE;
        END IF;

    END LOOP;

    RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. Ensure Trigger Function exists
CREATE OR REPLACE FUNCTION public.trigger_evaluar_habilidades()
RETURNS TRIGGER AS $$
BEGIN
    -- Solo evaluar si el estado cambió a 'completado'
    IF NEW.estado = 'completado' AND (OLD.estado IS NULL OR OLD.estado != 'completado') THEN
        -- Ejecutar evaluación de habilidades (sin guardar resultado aquí)
        PERFORM public.evaluar_habilidades(NEW.alumno_id);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Create Trigger
DROP TRIGGER IF EXISTS auto_evaluar_habilidades_trigger ON public.progreso_alumno;
CREATE TRIGGER auto_evaluar_habilidades_trigger
    AFTER UPDATE ON public.progreso_alumno
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_evaluar_habilidades();

-- Also for insert
DROP TRIGGER IF EXISTS auto_evaluar_habilidades_insert_trigger ON public.progreso_alumno;
CREATE TRIGGER auto_evaluar_habilidades_insert_trigger
    AFTER INSERT ON public.progreso_alumno
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_evaluar_habilidades();

