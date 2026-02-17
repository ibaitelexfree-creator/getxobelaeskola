
-- Update evaluate achievements function to support specific level badges
CREATE OR REPLACE FUNCTION public.evaluar_logros_alumno(p_alumno_id UUID, p_evento TEXT)
RETURNS VOID AS $$
DECLARE
    v_logro RECORD;
    v_cumple BOOLEAN;
    v_count INT;
    v_stats RECORD;
BEGIN
    -- Obtener estadísticas actuales del alumno
    SELECT * INTO v_stats FROM public.profiles WHERE id = p_alumno_id;

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
                SELECT COUNT(*) INTO v_count FROM public.progreso_alumno 
                WHERE alumno_id = p_alumno_id AND tipo_entidad = 'unidad' AND estado = 'completado';
                IF v_count >= (v_logro.condicion_json->>'cantidad')::INT THEN
                    v_cumple := TRUE;
                END IF;

            WHEN 'modulos_completados' THEN
                SELECT COUNT(*) INTO v_count FROM public.progreso_alumno 
                WHERE alumno_id = p_alumno_id AND tipo_entidad = 'modulo' AND estado = 'completado';
                IF v_count >= (v_logro.condicion_json->>'cantidad')::INT THEN
                    v_cumple := TRUE;
                END IF;

            WHEN 'cursos_aprobados' THEN
                SELECT COUNT(*) INTO v_count FROM public.progreso_alumno 
                WHERE alumno_id = p_alumno_id AND tipo_entidad = 'curso' AND estado = 'completado';
                IF v_count >= (v_logro.condicion_json->>'cantidad')::INT THEN
                    v_cumple := TRUE;
                END IF;

            WHEN 'niveles_completados' THEN
                SELECT COUNT(*) INTO v_count FROM public.progreso_alumno 
                WHERE alumno_id = p_alumno_id AND tipo_entidad = 'nivel' AND estado = 'completado';
                IF v_count >= (v_logro.condicion_json->>'cantidad')::INT THEN
                    v_cumple := TRUE;
                END IF;

            WHEN 'nivel_especifico_slug' THEN
                SELECT COUNT(*) INTO v_count FROM public.progreso_alumno pa
                JOIN public.niveles_formacion n ON pa.entidad_id = n.id
                WHERE pa.alumno_id = p_alumno_id 
                AND pa.tipo_entidad = 'nivel' 
                AND pa.estado = 'completado'
                AND n.slug = (v_logro.condicion_json->>'slug');
                IF v_count > 0 THEN
                    v_cumple := TRUE;
                END IF;

            WHEN 'puntuacion_maxima' THEN
                SELECT COUNT(*) INTO v_count FROM public.intentos_evaluacion 
                WHERE alumno_id = p_alumno_id AND puntuacion = 100 AND estado = 'completado';
                IF v_count >= (v_logro.condicion_json->>'cantidad')::INT THEN
                    v_cumple := TRUE;
                END IF;

            WHEN 'examenes_perfectos' THEN
                SELECT COUNT(*) INTO v_count FROM (
                    SELECT DISTINCT evaluacion_id FROM public.intentos_evaluacion 
                    WHERE alumno_id = p_alumno_id AND puntuacion = 100 AND estado = 'completado'
                ) sub;
                IF v_count >= (v_logro.condicion_json->>'cantidad')::INT THEN
                    v_cumple := TRUE;
                END IF;

            WHEN 'horas_navegacion' THEN
                SELECT COALESCE(SUM(duracion_h), 0) INTO v_count FROM public.horas_navegacion 
                WHERE alumno_id = p_alumno_id AND verificado = TRUE;
                IF v_count >= (v_logro.condicion_json->>'cantidad')::INT THEN
                    v_cumple := TRUE;
                END IF;

            WHEN 'horas_tipo' THEN
                SELECT COALESCE(SUM(duracion_h), 0) INTO v_count FROM public.horas_navegacion 
                WHERE alumno_id = p_alumno_id AND verificado = TRUE AND tipo = (v_logro.condicion_json->>'tipo_nav');
                IF v_count >= (v_logro.condicion_json->>'cantidad')::INT THEN
                    v_cumple := TRUE;
                END IF;

            WHEN 'primer_login' THEN
                v_cumple := TRUE; 

            WHEN 'dias_consecutivos' THEN
                IF v_stats.current_streak >= (v_logro.condicion_json->>'cantidad')::INT THEN
                    v_cumple := TRUE;
                END IF;

            WHEN 'dias_totales' THEN
                IF v_stats.total_days_active >= (v_logro.condicion_json->>'cantidad')::INT THEN
                    v_cumple := TRUE;
                END IF;

            WHEN 'racha_quizzes' THEN
                IF v_stats.quizzes_won_streak >= (v_logro.condicion_json->>'cantidad')::INT THEN
                    v_cumple := TRUE;
                END IF;

            WHEN 'habilidad_especifica' THEN
                SELECT COUNT(*) INTO v_count FROM public.student_skills s
                JOIN public.skills sk ON s.skill_id = sk.id
                WHERE s.student_id = p_alumno_id AND sk.slug = (v_logro.condicion_json->>'slug');
                IF v_count > 0 THEN
                    v_cumple := TRUE;
                END IF;

            WHEN 'habilidades_totales' THEN
                SELECT COUNT(*) INTO v_count FROM public.student_skills 
                WHERE student_id = p_alumno_id;
                IF v_count >= (v_logro.condicion_json->>'cantidad')::INT THEN
                    v_cumple := TRUE;
                END IF;

            WHEN 'niveles_especificos' THEN
                SELECT COUNT(*) INTO v_count FROM public.progreso_alumno pa
                JOIN public.niveles_formacion n ON pa.entidad_id = n.id
                WHERE pa.alumno_id = p_alumno_id 
                AND pa.tipo_entidad = 'nivel' 
                AND pa.estado = 'completado'
                AND n.nombre_es = ANY(ARRAY(SELECT jsonb_array_elements_text(v_logro.condicion_json->'niveles')));
                
                IF v_count >= jsonb_array_length(v_logro.condicion_json->'niveles') THEN
                    v_cumple := TRUE;
                END IF;

            WHEN 'nota_final_alta' THEN
                SELECT COUNT(*) INTO v_count FROM public.intentos_evaluacion 
                WHERE alumno_id = p_alumno_id AND puntuacion >= (v_logro.condicion_json->>'umbral')::INT AND estado = 'completado';
                IF v_count > 0 THEN
                    v_cumple := TRUE;
                END IF;

            WHEN 'aprobado_primera' THEN
                SELECT COUNT(*) INTO v_count FROM (
                    SELECT id, row_number() OVER (PARTITION BY evaluacion_id ORDER BY created_at ASC) as n, aprobado
                    FROM public.intentos_evaluacion
                    WHERE alumno_id = p_alumno_id
                ) t WHERE n = 1 AND aprobado = TRUE;
                IF v_count > 0 THEN
                    v_cumple := TRUE;
                END IF;

            WHEN 'habilidades_combo' THEN
                SELECT COUNT(*) INTO v_count FROM public.student_skills s
                JOIN public.skills sk ON s.skill_id = sk.id
                WHERE s.student_id = p_alumno_id 
                AND sk.slug = ANY(ARRAY(SELECT jsonb_array_elements_text(v_logro.condicion_json->'slugs')));
                
                IF v_count >= jsonb_array_length(v_logro.condicion_json->'slugs') THEN
                    v_cumple := TRUE;
                END IF;

            ELSE
                v_cumple := FALSE;
        END CASE;

        -- Si cumple la condición, conceder el logro
        IF v_cumple THEN
            INSERT INTO public.logros_alumno (alumno_id, logro_id, fecha_obtenido)
            VALUES (p_alumno_id, v_logro.id, NOW())
            ON CONFLICT (alumno_id, logro_id) DO NOTHING;
        END IF;

    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
