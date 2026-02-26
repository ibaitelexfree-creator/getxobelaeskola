-- ==========================================
-- FASE 12: DASHBOARD HELPERS
-- ==========================================

-- 1. Función para obtener la racha actual de accesos
CREATE OR REPLACE FUNCTION public.get_student_streak(p_alumno_id UUID)
RETURNS INT AS $$
DECLARE
    v_streak INT := 0;
    v_current_date DATE := CURRENT_DATE;
    v_last_access DATE;
BEGIN
    -- Comprobar si hubo acceso hoy o ayer (si no, la racha es 0)
    SELECT MAX(fecha) INTO v_last_access 
    FROM public.accesos_alumno 
    WHERE alumno_id = p_alumno_id;

    IF v_last_access IS NULL OR v_last_access < (v_current_date - INTERVAL '1 day') THEN
        RETURN 0;
    END IF;

    -- Cálculo recursivo de la racha hacia atrás
    WITH RECURSIVE streaks AS (
        SELECT fecha, 1 as streak_val
        FROM public.accesos_alumno
        WHERE alumno_id = p_alumno_id AND fecha = v_last_access
        UNION ALL
        SELECT a.fecha, s.streak_val + 1
        FROM public.accesos_alumno a
        JOIN streaks s ON a.fecha = s.fecha - INTERVAL '1 day'
        WHERE a.alumno_id = p_alumno_id
    )
    SELECT MAX(streak_val) INTO v_streak FROM streaks;

    RETURN COALESCE(v_streak, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Función para obtener el ranking (posición relativa)
CREATE OR REPLACE FUNCTION public.get_student_rank_position(p_alumno_id UUID)
RETURNS INT AS $$
DECLARE
    v_pos INT;
BEGIN
    WITH ranking AS (
        SELECT 
            alumno_id,
            ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC, MAX(fecha_obtenido) ASC) as pos
        FROM public.logros_alumno
        GROUP BY alumno_id
    )
    SELECT pos INTO v_pos FROM ranking WHERE alumno_id = p_alumno_id;
    
    RETURN COALESCE(v_pos, (SELECT COUNT(DISTINCT alumno_id) + 1 FROM public.logros_alumno));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
