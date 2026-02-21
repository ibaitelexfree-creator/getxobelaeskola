-- =====================================================
-- SEED: Catálogo de 30 Logros (Achievements)
-- =====================================================

DO $$
BEGIN
    -- 1. Categoría: PROGRESO ACADÉMICO (8 logros)
    INSERT INTO public.logros (slug, nombre_es, nombre_eu, descripcion_es, icono, categoria, condicion_json, puntos, rareza) VALUES
    ('primer-dia', 'Primer Día', 'Lehen Eguna', 'Completa tu primera unidad didáctica.', '🎓', 'progreso', '{"tipo": "unidades_completadas", "cantidad": 1}', 10, 'comun'),
    ('estudiante-aplicado', 'Estudiante Aplicado', 'Ikasle Langilea', 'Completa 5 unidades didácticas.', '📚', 'progreso', '{"tipo": "unidades_completadas", "cantidad": 5}', 25, 'comun'),
    ('modulo-superado', 'Módulo Superado', 'Moduloa Gaindituta', 'Completa 1 módulo (todas las unidades + examen).', '🏅', 'progreso', '{"tipo": "modulos_completados", "cantidad": 1}', 50, 'comun'),
    ('graduado', 'Graduado', 'Graduatua', 'Aprobar 1 curso completo.', '📜', 'progreso', '{"tipo": "cursos_aprobados", "cantidad": 1}', 100, 'raro'),
    ('doble-graduado', 'Doble Graduado', 'Graduatu Bikoitza', 'Aprobar 2 cursos completos.', '📜📜', 'progreso', '{"tipo": "cursos_aprobados", "cantidad": 2}', 150, 'raro'),
    ('nivel-conquistado', 'Nivel Conquistado', 'Maila Konkistatua', 'Completar 1 nivel formativo entero.', '🚩', 'progreso', '{"tipo": "niveles_completados", "cantidad": 1}', 200, 'epico'),
    ('polivalente', 'Polivalente', 'Polibalentea', 'Completar los niveles transversales (Seguridad + Meteorología).', '🛠️', 'progreso', '{"tipo": "niveles_transversales", "cantidad": 2}', 250, 'epico'),
    ('capitan-completo', 'Capitán Completo', 'Kapitain Osoa', 'Completar los 7 niveles formativos.', '👑', 'progreso', '{"tipo": "niveles_completados", "cantidad": 7}', 500, 'legendario')
    ON CONFLICT (slug) DO UPDATE SET 
        nombre_es = EXCLUDED.nombre_es,
        puntos = EXCLUDED.puntos,
        categoria = 'progreso';

    -- 2. Categoría: RENDIMIENTO (6 logros)
    INSERT INTO public.logros (slug, nombre_es, nombre_eu, descripcion_es, icono, categoria, condicion_json, puntos, rareza) VALUES
    ('primera-matricula', 'Primera Matrícula', 'Lehen Matrikula', 'Obtener 100% en cualquier quiz.', '✨', 'rendimiento', '{"tipo": "puntuacion_maxima", "cantidad": 1}', 15, 'comun'),
    ('perfeccionista', 'Perfeccionista', 'Perfekzionista', 'Obtener 100% en 3 exámenes de módulo distintos.', '💯', 'rendimiento', '{"tipo": "examenes_perfectos", "cantidad": 3}', 150, 'epico'),
    ('mente-brillante', 'Mente Brillante', 'Adimen Argia', 'Obtener ≥ 90% en el examen final de un curso.', '🧠', 'rendimiento', '{"tipo": "nota_examen_final", "min": 90}', 175, 'epico'),
    ('sin-fallos', 'Sin Fallos', 'Akatsik Gabe', 'Completar un módulo entero sin suspender nada en el primer intento.', '🛡️', 'rendimiento', '{"tipo": "perfect_run_module", "cantidad": 1}', 300, 'legendario'),
    ('a-la-primera', 'A la Primera', 'Lehenengoan', 'Aprobar un examen de módulo en el primer intento.', '🥇', 'rendimiento', '{"tipo": "aprobado_primer_intento", "cantidad": 1}', 75, 'raro'),
    ('rachazo', 'Rachazo', 'Bolada Ona', 'Aprobar 5 quizzes consecutivos con ≥ 80%.', '🔥', 'rendimiento', '{"tipo": "racha_quizzes", "cantidad": 5}', 80, 'raro')
    ON CONFLICT (slug) DO UPDATE SET 
        categoria = 'rendimiento',
        puntos = EXCLUDED.puntos;

    -- 3. Categoría: CONSTANCIA (6 logros)
    INSERT INTO public.logros (slug, nombre_es, nombre_eu, descripcion_es, icono, categoria, condicion_json, puntos, rareza) VALUES
    ('dia-1', 'Día 1', '1. Eguna', 'Acceder a la academia por primera vez.', '🚪', 'constancia', '{"tipo": "login", "cantidad": 1}', 5, 'comun'),
    ('semana-activa', 'Semana Activa', 'Aste Aktiboa', 'Acceder 7 días consecutivos.', '📅', 'constancia', '{"tipo": "dias_consecutivos", "cantidad": 7}', 50, 'raro'),
    ('mes-activo', 'Mes Activo', 'Hilabete Aktiboa', 'Acceder 30 días en total.', '🗓️', 'constancia', '{"tipo": "dias_totales", "cantidad": 30}', 100, 'epico'),
    ('trimestre-marino', 'Trimestre Marino', 'Itsas Hiruhilekoa', 'Acceder 90 días en total.', '⚓', 'constancia', '{"tipo": "dias_totales", "cantidad": 90}', 200, 'legendario'),
    ('estudio-diario', 'Estudio Diario', 'Eguneroko Ikasketa', 'Completar al menos 1 unidad 5 días seguidos.', '📓', 'constancia', '{"tipo": "unidades_consecutivas", "cantidad": 5}', 60, 'raro'),
    ('madrugador', 'Madrugador del Mar', 'Itsasoko Goiztiarra', 'Acceder a la academia antes de las 8:00 AM en 5 ocasiones.', '🌅', 'constancia', '{"tipo": "login_early", "cantidad": 5}', 40, 'raro')
    ON CONFLICT (slug) DO UPDATE SET 
        categoria = 'constancia',
        puntos = EXCLUDED.puntos;

    -- 4. Categoría: HABILIDADES (5 logros)
    INSERT INTO public.logros (slug, nombre_es, nombre_eu, descripcion_es, icono, categoria, condicion_json, puntos, rareza) VALUES
    ('nudos-de-acero', 'Nudos de Acero', 'Altzairuzko Korapiloak', 'Obtener habilidad "Manos de Marinero".', '🪢', 'habilidades', '{"tipo": "skill", "id": "manos-marinero"}', 75, 'raro'),
    ('senor-del-viento', 'Señor del Viento', 'Haizearen Jauna', 'Obtener habilidades "Domador del Viento" + "Trimador".', '🌬️', 'habilidades', '{"tipo": "skill_combo", "skills": ["domador-viento", "trimador"]}', 125, 'epico'),
    ('guardian-del-mar', 'Guardián del Mar', 'Itsasoko Zaindaria', 'Obtener habilidades "Patrón de Rescate" + "Oficial de Seguridad".', '🛡️', 'habilidades', '{"tipo": "skill_combo", "skills": ["patron-rescate", "oficial-seguridad"]}', 150, 'epico'),
    ('maestro-maniobras', 'Maestro de Maniobras', 'Manobra Maisua', 'Completar todas las unidades de Virada + Trasluchada con ≥ 85%.', '🔄', 'habilidades', '{"tipo": "high_score_maniobras", "min": 85}', 100, 'raro'),
    ('habilidades-completas', 'Habilidades Completas', 'Habilitate Osoak', 'Obtener las 12 habilidades.', '🏆', 'habilidades', '{"tipo": "all_skills", "cantidad": 12}', 500, 'legendario')
    ON CONFLICT (slug) DO UPDATE SET 
        categoria = 'habilidades',
        puntos = EXCLUDED.puntos;

    -- 5. Categoría: EXPERIENCIA (5 logros)
    INSERT INTO public.logros (slug, nombre_es, nombre_eu, descripcion_es, icono, categoria, condicion_json, puntos, rareza) VALUES
    ('10-horas', '10 Horas Navegadas', '10 Ordu Nabigatuta', 'Acumula 10 horas de navegación registradas.', '⏱️', 'experiencia', '{"tipo": "horas_navegacion", "cantidad": 10}', 50, 'comun'),
    ('50-horas', '50 Horas Navegadas', '50 Ordu Nabigatuta', 'Acumula 50 horas de navegación registradas.', '⏱️', 'experiencia', '{"tipo": "horas_navegacion", "cantidad": 50}', 200, 'raro'),
    ('100-horas', '100 Horas Navegadas', '100 Ordu Nabigatuta', 'Acumula 100 horas de navegación registradas.', '⏱️', 'experiencia', '{"tipo": "horas_navegacion", "cantidad": 100}', 350, 'epico'),
    ('primer-regatista', 'Primer Regatista', 'Lehen Erregatista', 'Registrar al menos 1 hora de tipo "regata".', '🏁', 'experiencia', '{"tipo": "tipo_navegacion", "tipo_val": "regata", "cantidad": 1}', 75, 'raro'),
    ('travesia-completada', 'Travesía Completada', 'Zeharkaldia Beteta', 'Registrar al menos 1 hora de tipo "travesia".', '🚢', 'experiencia', '{"tipo": "tipo_navegacion", "tipo_val": "travesia", "cantidad": 1}', 125, 'epico')
    ON CONFLICT (slug) DO UPDATE SET 
        categoria = 'experiencia',
        puntos = EXCLUDED.puntos;

END $$;
