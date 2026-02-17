-- ==========================================
-- FASE 7: MOTOR DE HABILIDADES
-- ==========================================
-- Este script implementa la lógica automática de concesión de habilidades
-- basada en el progreso del alumno según el diseño funcional.

-- =====================================================
-- FUNCIÓN: evaluar_habilidades
-- =====================================================
-- Evalúa todas las condiciones de las 12 habilidades para un alumno
-- y las concede automáticamente si se cumplen.
-- Se ejecuta tras completar cualquier entidad (unidad/módulo/curso/nivel).

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
    v_habilidad_id UUID;
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
            
            -- 1. Marinero de Agua Dulce: Completar Módulo 1 de Iniciación
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
                    AND c.slug = 'iniciacion-vela-ligera'
                    AND n.nivel_numero = 1
                ) INTO v_cumple_condicion;

            -- 2. Domador del Viento: Completar Módulo 2 de Iniciación
            WHEN 'domador-viento' THEN
                SELECT EXISTS(
                    SELECT 1
                    FROM public.progreso_alumno pa
                    JOIN public.modulos m ON m.id = pa.entidad_id
                    JOIN public.cursos c ON c.id = m.curso_id
                    JOIN public.niveles_formacion n ON n.id = c.nivel_id
                    WHERE pa.alumno_id = p_alumno_id
                    AND pa.tipo_entidad = 'modulo'
                    AND pa.estado = 'completado'
                    AND m.orden = 2
                    AND c.slug = 'iniciacion-vela-ligera'
                    AND n.nivel_numero = 1
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

            -- 4. Trimador: Completar módulo de Trimado en Perfeccionamiento con nota ≥ 80%
            WHEN 'trimador' THEN
                SELECT EXISTS(
                    SELECT 1
                    FROM public.progreso_alumno pa
                    JOIN public.modulos m ON m.id = pa.entidad_id
                    JOIN public.cursos c ON c.id = m.curso_id
                    JOIN public.niveles_formacion n ON n.id = c.nivel_id
                    LEFT JOIN public.intentos_evaluacion ie ON ie.alumno_id = pa.alumno_id
                    LEFT JOIN public.evaluaciones e ON e.id = ie.evaluacion_id AND e.entidad_id = m.id
                    WHERE pa.alumno_id = p_alumno_id
                    AND pa.tipo_entidad = 'modulo'
                    AND pa.estado = 'completado'
                    AND LOWER(m.nombre_es) LIKE '%trimado%'
                    AND n.nivel_numero = 2
                    AND ie.puntuacion_porcentaje >= 80
                ) INTO v_cumple_condicion;

            -- 5. Táctico: Completar módulo de Reglas y Táctica en Perfeccionamiento
            WHEN 'tactico' THEN
                SELECT EXISTS(
                    SELECT 1
                    FROM public.progreso_alumno pa
                    JOIN public.modulos m ON m.id = pa.entidad_id
                    JOIN public.cursos c ON c.id = m.curso_id
                    JOIN public.niveles_formacion n ON n.id = c.nivel_id
                    WHERE pa.alumno_id = p_alumno_id
                    AND pa.tipo_entidad = 'modulo'
                    AND pa.estado = 'completado'
                    AND (LOWER(m.nombre_es) LIKE '%táctica%' OR LOWER(m.nombre_es) LIKE '%regla%')
                    AND n.nivel_numero = 2
                ) INTO v_cumple_condicion;

            -- 6. Patrón de Rescate: Completar unidades de Seguridad + ≥ 85% en examen módulo
            WHEN 'patron-rescate' THEN
                SELECT EXISTS(
                    SELECT 1
                    FROM public.progreso_alumno pa
                    JOIN public.modulos m ON m.id = pa.entidad_id
                    JOIN public.cursos c ON c.id = m.curso_id
                    JOIN public.niveles_formacion n ON n.id = c.nivel_id
                    LEFT JOIN public.intentos_evaluacion ie ON ie.alumno_id = pa.alumno_id
                    LEFT JOIN public.evaluaciones e ON e.id = ie.evaluacion_id AND e.entidad_id = m.id
                    WHERE pa.alumno_id = p_alumno_id
                    AND pa.tipo_entidad = 'modulo'
                    AND pa.estado = 'completado'
                    AND LOWER(m.nombre_es) LIKE '%seguridad%'
                    AND n.nivel_numero = 2
                    AND ie.puntuacion_porcentaje >= 85
                ) INTO v_cumple_condicion;

            -- 7. Regatista: Completar curso Vela Ligera + 1 hora tipo "regata"
            WHEN 'regatista' THEN
                SELECT EXISTS(
                    SELECT 1
                    FROM public.progreso_alumno pa
                    JOIN public.cursos c ON c.id = pa.entidad_id
                    JOIN public.niveles_formacion n ON n.id = c.nivel_id
                    WHERE pa.alumno_id = p_alumno_id
                    AND pa.tipo_entidad = 'curso'
                    AND pa.estado = 'completado'
                    AND n.nivel_numero = 3
                ) AND EXISTS(
                    SELECT 1
                    FROM public.horas_navegacion hn
                    WHERE hn.alumno_id = p_alumno_id
                    AND hn.tipo = 'regata'
                    AND hn.duracion_h >= 1
                ) INTO v_cumple_condicion;

            -- 8. Patrón de Bahía: Completar nivel Crucero
            WHEN 'patron-bahia' THEN
                SELECT EXISTS(
                    SELECT 1
                    FROM public.progreso_alumno pa
                    JOIN public.niveles_formacion n ON n.id = pa.entidad_id
                    WHERE pa.alumno_id = p_alumno_id
                    AND pa.tipo_entidad = 'nivel'
                    AND pa.estado = 'completado'
                    AND n.nivel_numero = 4
                ) INTO v_cumple_condicion;

            -- 9. Lobo de Mar: Completar Maniobras Avanzadas + 80h navegación
            WHEN 'lobo-mar' THEN
                SELECT EXISTS(
                    SELECT 1
                    FROM public.progreso_alumno pa
                    JOIN public.niveles_formacion n ON n.id = pa.entidad_id
                    WHERE pa.alumno_id = p_alumno_id
                    AND pa.tipo_entidad = 'nivel'
                    AND pa.estado = 'completado'
                    AND n.nivel_numero = 5
                ) AND (
                    SELECT COALESCE(SUM(hn.duracion_h), 0)
                    FROM public.horas_navegacion hn
                    WHERE hn.alumno_id = p_alumno_id
                ) >= 80 INTO v_cumple_condicion;

            -- 10. Oficial de Seguridad: Completar nivel Seguridad con nota ≥ 80%
            WHEN 'oficial-seguridad' THEN
                SELECT EXISTS(
                    SELECT 1
                    FROM public.progreso_alumno pa
                    JOIN public.niveles_formacion n ON n.id = pa.entidad_id
                    WHERE pa.alumno_id = p_alumno_id
                    AND pa.tipo_entidad = 'nivel'
                    AND pa.estado = 'completado'
                    AND n.nivel_numero = 6
                    AND pa.nota_final >= 80
                ) INTO v_cumple_condicion;

            -- 11. Meteorólogo de Abordo: Completar nivel Meteorología con nota ≥ 80%
            WHEN 'meteorologo-abordo' THEN
                SELECT EXISTS(
                    SELECT 1
                    FROM public.progreso_alumno pa
                    JOIN public.niveles_formacion n ON n.id = pa.entidad_id
                    WHERE pa.alumno_id = p_alumno_id
                    AND pa.tipo_entidad = 'nivel'
                    AND pa.estado = 'completado'
                    AND n.nivel_numero = 7
                    AND pa.nota_final >= 80
                ) INTO v_cumple_condicion;

            -- 12. Capitán: Completar TODOS los niveles + 100h navegación
            WHEN 'capitan' THEN
                SELECT (
                    SELECT COUNT(DISTINCT n.id)
                    FROM public.progreso_alumno pa
                    JOIN public.niveles_formacion n ON n.id = pa.entidad_id
                    WHERE pa.alumno_id = p_alumno_id
                    AND pa.tipo_entidad = 'nivel'
                    AND pa.estado = 'completado'
                ) = 7 AND (
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

-- Comentario de la función
COMMENT ON FUNCTION public.evaluar_habilidades IS 
'Evalúa las 12 habilidades y las concede automáticamente si el alumno cumple las condiciones. 
Retorna las habilidades recién obtenidas.';


-- =====================================================
-- FUNCIÓN: calcular_rango_navegante
-- =====================================================
-- Calcula el rango del alumno basado en el número de habilidades obtenidas

CREATE OR REPLACE FUNCTION public.calcular_rango_navegante(p_alumno_id UUID)
RETURNS TABLE (
    rango TEXT,
    icono TEXT,
    habilidades_obtenidas INT,
    habilidades_totales INT
) AS $$
DECLARE
    v_count_habilidades INT;
    v_rango TEXT;
    v_icono TEXT;
BEGIN
    -- Contar habilidades obtenidas
    SELECT COUNT(*) INTO v_count_habilidades
    FROM public.habilidades_alumno
    WHERE alumno_id = p_alumno_id;

    -- Determinar rango según número de habilidades
    CASE 
        WHEN v_count_habilidades = 0 THEN
            v_rango := 'Grumete';
            v_icono := '🟤';
        WHEN v_count_habilidades BETWEEN 1 AND 3 THEN
            v_rango := 'Marinero';
            v_icono := '🟢';
        WHEN v_count_habilidades BETWEEN 4 AND 6 THEN
            v_rango := 'Timonel';
            v_icono := '🔵';
        WHEN v_count_habilidades BETWEEN 7 AND 9 THEN
            v_rango := 'Patrón';
            v_icono := '🟣';
        WHEN v_count_habilidades BETWEEN 10 AND 12 THEN
            v_rango := 'Capitán';
            v_icono := '🟡';
        ELSE
            v_rango := 'Desconocido';
            v_icono := '⚪';
    END CASE;

    RETURN QUERY SELECT 
        v_rango,
        v_icono,
        v_count_habilidades,
        12; -- Total de habilidades siempre 12
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.calcular_rango_navegante IS 
'Retorna el rango actual del alumno (Grumete → Capitán) basado en habilidades obtenidas.';


-- =====================================================
-- FUNCIÓN: obtener_habilidades_alumno
-- =====================================================
-- Devuelve todas las habilidades con su estado (obtenida o no) para un alumno

CREATE OR REPLACE FUNCTION public.obtener_habilidades_alumno(p_alumno_id UUID)
RETURNS TABLE (
    habilidad_id UUID,
    slug TEXT,
    nombre_es TEXT,
    nombre_eu TEXT,
    descripcion_es TEXT,
    icono TEXT,
    categoria TEXT,
    nivel_requerido INT,
    orden_visual INT,
    obtenida BOOLEAN,
    fecha_obtenido TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        h.id,
        h.slug,
        h.nombre_es,
        h.nombre_eu,
        h.descripcion_es,
        h.icono,
        h.categoria,
        h.nivel_requerido,
        h.orden_visual,
        CASE WHEN ha.id IS NOT NULL THEN TRUE ELSE FALSE END AS obtenida,
        ha.fecha_obtenido
    FROM public.habilidades h
    LEFT JOIN public.habilidades_alumno ha 
        ON ha.habilidad_id = h.id 
        AND ha.alumno_id = p_alumno_id
    ORDER BY h.orden_visual;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.obtener_habilidades_alumno IS 
'Devuelve el catálogo completo de habilidades con el estado de obtención para un alumno específico.';


-- =====================================================
-- TRIGGER: Auto-evaluar habilidades tras completar progreso
-- =====================================================
-- Este trigger se ejecuta automáticamente cuando se actualiza progreso_alumno

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

-- Crear el trigger
DROP TRIGGER IF EXISTS auto_evaluar_habilidades_trigger ON public.progreso_alumno;
CREATE TRIGGER auto_evaluar_habilidades_trigger
    AFTER UPDATE ON public.progreso_alumno
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_evaluar_habilidades();

COMMENT ON TRIGGER auto_evaluar_habilidades_trigger ON public.progreso_alumno IS
'Evalúa automáticamente las habilidades cada vez que se completa una entidad académica.';


-- =====================================================
-- AGREGAR CAMPOS FALTANTES EN progreso_alumno
-- =====================================================
-- Añadir nota_final si no existe (necesario para cálculo de habilidades)

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'progreso_alumno' 
        AND column_name = 'nota_final'
    ) THEN
        ALTER TABLE public.progreso_alumno 
        ADD COLUMN nota_final DECIMAL(5, 2);
        
        COMMENT ON COLUMN public.progreso_alumno.nota_final IS 
        'Nota final de la entidad (si aplica: curso, nivel).';
    END IF;
END $$;
