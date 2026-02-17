-- ==========================================
-- PHASE 8: MOTOR DE LOGROS COMPLETO (30 ACHIEVEMENTS)
-- ==========================================

-- 1. Ampliar tabla de perfiles para seguimiento de constancia
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS current_streak INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_days_active INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS quizzes_won_streak INT DEFAULT 0;

-- 2. Seed del catálogo completo de 30 logros
-- Limpiamos los anteriores para asegurar consistencia
TRUNCATE public.logros_alumno CASCADE;
TRUNCATE public.logros CASCADE;

INSERT INTO public.logros (slug, nombre_es, nombre_eu, descripcion_es, descripcion_eu, icono, categoria, condicion_json, puntos, rareza) VALUES
-- PROGRESO ACADÉMICO
('primer-dia', 'Primer Día', 'Lehen Eguna', 'Completa tu primera unidad didáctica', 'Osatu zure lehen unitate didaktikoa', '🎓', 'progreso', '{"tipo": "unidades_completadas", "cantidad": 1}', 10, 'comun'),
('estudiante-aplicado', 'Estudiante Aplicado', 'Ikasle Langilea', 'Completa 5 unidades didácticas', 'Osatu 5 unitate didaktiko', '📚', 'progreso', '{"tipo": "unidades_completadas", "cantidad": 5}', 25, 'comun'),
('modulo-superado', 'Módulo Superado', 'Modulua Gaindituta', 'Completa un módulo entero (unidades + examen)', 'Osatu modulu oso bat (unitateak + azterketa)', '📜', 'progreso', '{"tipo": "modulos_completados", "cantidad": 1}', 50, 'comun'),
('graduado', 'Graduado', 'Graduatua', 'Aprueba tu primer curso completo', 'Gainditu zure lehen ikastaro osoa', '🎓', 'progreso', '{"tipo": "cursos_aprobados", "cantidad": 1}', 100, 'raro'),
('doble-graduado', 'Doble Graduado', 'Gradu bikoitza', 'Aprueba 2 cursos completos', 'Gainditu 2 ikastaro oso', '🥈', 'progreso', '{"tipo": "cursos_aprobados", "cantidad": 2}', 150, 'raro'),
('nivel-conquistado', 'Nivel Conquistado', 'Maila Konkistatua', 'Completa un nivel formativo entero', 'Osatu prestakuntza-maila oso bat', '🏆', 'progreso', '{"tipo": "niveles_completados", "cantidad": 1}', 200, 'epico'),
('polivalente', 'Polivalente', 'Polibalentea', 'Completa Seguridad + Meteorología', 'Osatu Segurtasuna + Meteorologia', '🎭', 'progreso', '{"tipo": "niveles_especificos", "niveles": ["Seguridad", "Meteorología"]}', 250, 'epico'),
('capitan-completo', 'Capitán Completo', 'Kapitain Osoa', 'Completa los 7 niveles formativos', 'Osatu 7 prestakuntza-mailak', '🟡', 'progreso', '{"tipo": "niveles_completados", "cantidad": 7}', 500, 'legendario'),

-- RENDIMIENTO
('primera-matricula', 'Primera Matrícula', 'Lehen Matrikula', 'Obtén un 100% en cualquier quiz', 'Lortu %100 edozein quizetan', '💯', 'rendimiento', '{"tipo": "puntuacion_maxima", "cantidad": 1}', 15, 'comun'),
('perfeccionista', 'Perfeccionista', 'Perfekzionista', 'Obtén un 100% en 3 exámenes de módulo', 'Lortu %100 3 modulu-azterketatan', '✨', 'rendimiento', '{"tipo": "examenes_perfectos", "cantidad": 3}', 150, 'epico'),
('mente-brillante', 'Mente Brillante', 'Adimen Distiratsua', 'Obtén >= 90% en un examen final', 'Lortu >= %90 amaierako azterketa batean', '🧠', 'rendimiento', '{"tipo": "nota_final_alta", "umbral": 90}', 175, 'epico'),
('sin-fallos', 'Sin Fallos', 'Akatsik Gabe', 'Módulo entero sin suspender ni una vez', 'Modulu osoa behin ere huts egin gabe', '🛡️', 'rendimiento', '{"tipo": "modulo_perfecto", "cantidad": 1}', 300, 'legendario'),
('a-la-primera', 'A la Primera', 'Lehenengoan', 'Aprueba un examen de módulo en el primer intento', 'Gainditu modulu-azterketa bat lehenengo saiakeran', '🎯', 'rendimiento', '{"tipo": "aprobado_primera", "cantidad": 1}', 75, 'raro'),
('rachazo', 'Rachazo', 'Bolada Onean', 'Aprueba 5 quizzes consecutivos con >= 80%', 'Gainditu 5 quiz jarraian >= %80arekin', '🔥', 'rendimiento', '{"tipo": "racha_quizzes", "cantidad": 5}', 80, 'raro'),

-- CONSTANCIA
('dia-1', 'Día 1', '1. Eguna', 'Accede a la academia por primera vez', 'Sartu akademian lehen aldiz', '👋', 'constancia', '{"tipo": "primer_login"}', 5, 'comun'),
('semana-activa', 'Semana Activa', 'Aste Aktiboa', 'Accede 7 días consecutivos', 'Sartu 7 egun jarraian', '📅', 'constancia', '{"tipo": "dias_consecutivos", "cantidad": 7}', 50, 'raro'),
('mes-activo', 'Mes Activo', 'Hilabete Aktiboa', 'Accede 30 días en total', 'Sartu 30 egun guztira', '🗓️', 'constancia', '{"tipo": "dias_totales", "cantidad": 30}', 100, 'epico'),
('trimestre-marino', 'Trimestre Marino', 'Itsas Hiruhilekoa', 'Accede 90 días en total', 'Sartu 90 egun guztira', '🔱', 'constancia', '{"tipo": "dias_totales", "cantidad": 90}', 200, 'legendario'),
('estudio-diario', 'Estudio Diario', 'Eguneroko Ikasketa', 'Completa 1 unidad 5 días seguidos', 'Osatu unitate 1 5 egun jarraian', '✍️', 'constancia', '{"tipo": "unidades_seguidas", "cantidad": 5}', 60, 'raro'),
('madrugador', 'Madrugador del Mar', 'Itsasoko Goiztiarra', 'Accede antes de las 8:00 AM (5 veces)', 'Sartu 8:00ak baino lehen (5 aldiz)', '🌅', 'constancia', '{"tipo": "login_temprano", "hora_max": 8, "veces": 5}', 40, 'raro'),

-- HABILIDADES
('nudos-acero', 'Nudos de Acero', 'Altzairuzko Nudoak', 'Obtén la habilidad Manos de Marinero', 'Lortu Marinelaren Eskuak gaitasuna', '🪢', 'habilidades', '{"tipo": "habilidad_especifica", "slug": "manos-marinero"}', 75, 'raro'),
('senor-viento', 'Señor del Viento', 'Haizearen Jauna', 'Obtén Domador + Trimador', 'Lortu Domatzailea + Trimatzailea', '🌬️', 'habilidades', '{"tipo": "habilidades_combo", "slugs": ["domador-viento", "trimador"]}', 125, 'epico'),
('guardian-mar', 'Guardián del Mar', 'Itsasoko Zaindaria', 'Obtén Rescate + Seguridad', 'Lortu Erreskate + Segurtasun', '🛟', 'habilidades', '{"tipo": "habilidades_combo", "slugs": ["patron-rescate", "oficial-seguridad"]}', 150, 'epico'),
('maestro-maniobras', 'Maestro de Maniobras', 'Maniobra Maisua', 'Virada + Trasluchada >= 85%', 'Biraketa + Trasluchada >= %85', '🔄', 'habilidades', '{"tipo": "maniobras_perfectas", "umbral": 85}', 100, 'raro'),
('habilidades-completas', 'Habilidades Completas', 'Gaitasun Guztiak', 'Obtén las 12 habilidades', 'Lortu 12 gaitasunak', '🏅', 'habilidades', '{"tipo": "habilidades_totales", "cantidad": 12}', 500, 'legendario'),

-- EXPERIENCIA
('10-horas', '10 Horas Navegadas', '10 Ordu Nabigatuta', 'Acumula 10 horas de navegación', 'Metatu 10 nabigazio-ordu', '⏱️', 'experiencia', '{"tipo": "horas_navegacion", "cantidad": 10}', 50, 'comun'),
('50-horas', '50 Horas Navegadas', '50 Ordu Nabigatuta', 'Acumula 50 horas de navegación', 'Metatu 50 nabigazio-ordu', '⏲️', 'experiencia', '{"tipo": "horas_navegacion", "cantidad": 50}', 200, 'raro'),
('100-horas', '100 Horas Navegadas', '100 Ordu Nabigatuta', 'Acumula 100 horas de navegación', 'Metatu 100 nabigazio-ordu', '🕐', 'experiencia', '{"tipo": "horas_navegacion", "cantidad": 100}', 350, 'epico'),
('primer-regatista', 'Primer Regatista', 'Lehen Erregatista', 'Registra tu primera regata (1h)', 'Erregistratu zure lehen erregata (ordu 1)', '🏁', 'experiencia', '{"tipo": "horas_tipo", "tipo_nav": "regata", "cantidad": 1}', 75, 'raro'),
('travesia-completa', 'Travesía Completada', 'Zeharkaldia Osatuta', 'Registra tu primera travesía (1h)', 'Erregistratu zure lehen zeharkaldia (ordu 1)', '🗺️', 'experiencia', '{"tipo": "horas_tipo", "tipo_nav": "travesia", "cantidad": 1}', 125, 'epico')
ON CONFLICT (slug) DO UPDATE SET
    nombre_es = EXCLUDED.nombre_es,
    nombre_eu = EXCLUDED.nombre_eu,
    descripcion_es = EXCLUDED.descripcion_es,
    descripcion_eu = EXCLUDED.descripcion_eu,
    icono = EXCLUDED.icono,
    categoria = EXCLUDED.categoria,
    condicion_json = EXCLUDED.condicion_json,
    puntos = EXCLUDED.puntos,
    rareza = EXCLUDED.rareza;


-- 3. Actualización de la Función Principal de Evaluación (Evaluación Robusta)
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
                v_cumple := TRUE; -- Si llega aquí y no lo tiene, es que ha logueado

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
                -- Chequear si tiene completados todos los niveles en el array 'niveles'
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
                -- Chequear si el primer intento de cualquier examen de módulo fue aprobado
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


-- 4. Función para registrar actividad diaria y actualizar rachas
CREATE OR REPLACE FUNCTION public.registrar_actividad_alumno(p_alumno_id UUID)
RETURNS VOID AS $$
DECLARE
    v_today DATE := CURRENT_DATE;
    v_last_login DATE;
BEGIN
    SELECT (last_login_at AT TIME ZONE 'UTC')::DATE INTO v_last_login 
    FROM public.profiles WHERE id = p_alumno_id;

    IF v_last_login IS NULL THEN
        -- Primer login
        UPDATE public.profiles SET 
            last_login_at = NOW(),
            current_streak = 1,
            total_days_active = 1
        WHERE id = p_alumno_id;
        
        PERFORM public.evaluar_logros_alumno(p_alumno_id, 'login');
    ELSIF v_last_login < v_today THEN
        -- Es un nuevo día
        IF v_last_login = v_today - INTERVAL '1 day' THEN
            -- Mantiene racha
            UPDATE public.profiles SET 
                last_login_at = NOW(),
                current_streak = current_streak + 1,
                total_days_active = total_days_active + 1
            WHERE id = p_alumno_id;
        ELSE
            -- Racha rota
            UPDATE public.profiles SET 
                last_login_at = NOW(),
                current_streak = 1,
                total_days_active = total_days_active + 1
            WHERE id = p_alumno_id;
        END IF;
        
        PERFORM public.evaluar_logros_alumno(p_alumno_id, 'login');
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 5. Funciones auxiliares para rachas de quizzes
CREATE OR REPLACE FUNCTION public.incrementar_racha_quizzes(p_alumno_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.profiles 
    SET quizzes_won_streak = quizzes_won_streak + 1 
    WHERE id = p_alumno_id;
    
    PERFORM public.evaluar_logros_alumno(p_alumno_id, 'evaluacion_submit');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.resetear_racha_quizzes(p_alumno_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.profiles 
    SET quizzes_won_streak = 0 
    WHERE id = p_alumno_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
