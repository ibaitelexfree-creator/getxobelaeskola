-- ==========================================
-- SEED: Catálogo Completo de Logros (30 Achievements)
-- ==========================================

BEGIN;

-- Limpiar catálogo anterior si existe (evitar duplicados por slug si se ha cambiado el nombre)
-- DELETE FROM public.logros; 

INSERT INTO public.logros (slug, nombre_es, nombre_eu, descripcion_es, descripcion_eu, icono, categoria, condicion_json, puntos, rareza) VALUES
-- Categoría: Progreso Académico (8 logros)
('primer-dia', 'Primer Día', 'Lehen Eguna', 'Completar 1 unidad didáctica.', 'Unitate didaktiko bat osatu.', '🎓', 'progreso_academico', '{"tipo": "unidades_completadas", "cantidad": 1}', 10, 'comun'),
('estudiante-aplicado', 'Estudiante Aplicado', 'Ikasle Langilea', 'Completar 5 unidades didácticas.', '5 unitate didaktiko osatu.', '📚', 'progreso_academico', '{"tipo": "unidades_completadas", "cantidad": 5}', 25, 'comun'),
('modulo-superado', 'Módulo Superado', 'Moduloa Gaindituta', 'Completar 1 módulo (todas las unidades + examen).', 'Modulo bat osatu (unitate guztiak + azterketa).', '🏆', 'progreso_academico', '{"tipo": "modulos_completados", "cantidad": 1}', 50, 'comun'),
('graduado', 'Graduado', 'Graduatua', 'Aprobar 1 curso completo.', 'Ikastaro oso bat gainditu.', '👨‍🎓', 'progreso_academico', '{"tipo": "cursos_aprobados", "cantidad": 1}', 100, 'raro'),
('doble-graduado', 'Doble Graduado', 'Graduatu Bikoitza', 'Aprobar 2 cursos completos.', '2 ikastaro oso gainditu.', '📜', 'progreso_academico', '{"tipo": "cursos_aprobados", "cantidad": 2}', 150, 'raro'),
('nivel-conquistado', 'Nivel Conquistado', 'Maila Konkistatua', 'Completar 1 nivel formativo entero.', 'Prestakuntza-maila oso bat osatu.', '🏔️', 'progreso_academico', '{"tipo": "niveles_completados", "cantidad": 1}', 200, 'epico'),
('polivalente', 'Polivalente', 'Polibalentea', 'Completar los niveles transversales (Seguridad + Meteorología).', 'Zeharkako mailak osatu (Segurtasuna + Meteorologia).', '🔄', 'progreso_academico', '{"tipo": "niveles_especificos", "slugs": ["seguridad-emergencias", "meteorologia"]}', 250, 'epico'),
('capitan-completo', 'Capitán Completo', 'Kapitain Osoa', 'Completar los 7 niveles formativos.', '7 prestakuntza-mailak osatu.', '🎖️', 'progreso_academico', '{"tipo": "niveles_completados", "cantidad": 7}', 500, 'legendario'),

-- Categoría: Rendimiento en Evaluaciones (6 logros)
('primera-matricula', 'Primera Matrícula', 'Lehen Matrikula', 'Obtener 100% en cualquier quiz.', 'Edozein quizetan %100 lortu.', '💯', 'rendimiento', '{"tipo": "puntuacion_maxima", "cantidad": 1}', 15, 'comun'),
('perfeccionista', 'Perfeccionista', 'Perfekzionista', 'Obtener 100% en 3 exámenes de módulo distintos.', '3 modulo-azterketa desberdinetan %100 lortu.', '🌟', 'rendimiento', '{"tipo": "examenes_perfectos", "cantidad": 3}', 150, 'epico'),
('mente-brillante', 'Mente Brillante', 'Adimen Distiratsua', 'Obtener ≥ 90% en el examen final de un curso.', 'Ikastaro baten amaierako azterketan %90 baino gehiago lortu.', '🧠', 'rendimiento', '{"tipo": "nota_examen_final", "minima": 90}', 175, 'epico'),
('sin-fallos', 'Sin Fallos', 'Akatsik Gabe', 'Completar un módulo entero sin suspender ningún quiz ni examen en el primer intento.', 'Modulo oso bat osatu lehen saiakeran quiz edo azterketarik huts egin gabe.', '🛡️', 'rendimiento', '{"tipo": "modulo_perfecto", "cantidad": 1}', 300, 'legendario'),
('a-la-primera', 'A la Primera', 'Lehenengoan', 'Aprobar un examen de módulo en el primer intento.', 'Modulo-azterketa bat lehen saiakeran gainditu.', '⚡', 'rendimiento', '{"tipo": "examen_primera_vez", "cantidad": 1}', 75, 'raro'),
('rachazo', 'Rachazo', 'Bolada Ona', 'Aprobar 5 quizzes consecutivos con ≥ 80%.', 'Buztinezko 5 quiz jarraian gainditu %80arekin.', '🔥', 'rendimiento', '{"tipo": "quizzes_consecutivos_aprobados", "cantidad": 5, "minima": 80}', 80, 'raro'),

-- Categoría: Constancia (6 logros)
('dia-1', 'Día 1', '1. Eguna', 'Acceder a la academia por primera vez.', 'Akademian lehen aldiz sartu.', '🆕', 'constancia', '{"tipo": "login_total", "cantidad": 1}', 5, 'comun'),
('semana-activa', 'Semana Activa', 'Aste Aktiboa', 'Acceder 7 días consecutivos.', '7 egun jarraian sartu.', '📅', 'constancia', '{"tipo": "login_consecutivo", "cantidad": 7}', 50, 'raro'),
('mes-activo', 'Mes Activo', 'Hile Aktiboa', 'Acceder 30 días en total.', '30 egun guztira sartu.', '📆', 'constancia', '{"tipo": "login_total", "cantidad": 30}', 100, 'epico'),
('trimestre-marino', 'Trimestre Marino', 'Itsas Hiruhilekoa', 'Acceder 90 días en total.', '90 egun guztira sartu.', '🗺️', 'constancia', '{"tipo": "login_total", "cantidad": 90}', 200, 'legendario'),
('estudio-diario', 'Estudio Diario', 'Eguneroko Ikasketa', 'Completar al menos 1 unidad 5 días seguidos.', 'Unitate bat gutxienez 5 egun jarraian osatu.', '📖', 'constancia', '{"tipo": "unidad_diaria_consecutiva", "cantidad": 5}', 60, 'raro'),
('madrugador-mar', 'Madrugador del Mar', 'Itsasoko Goiztiarra', 'Acceder a la academia antes de las 8:00 AM en 5 ocasiones distintas.', 'Akademian 8:00 AM baino lehen 5 aldiz sartu.', '🌅', 'constancia', '{"tipo": "login_temprano", "hora_max": 8, "cantidad": 5}', 40, 'raro'),

-- Categoría: Habilidades Específicas (5 logros)
('nudos-de-acero', 'Nudos de Acero', 'Altzairuzko Begiztak', 'Obtener habilidad "Manos de Marinero" (≥ 90% en quiz de nudos).', '"Manos de Marinero" trebetasuna lortu.', '🪢', 'habilidades', '{"tipo": "habilidad_especifica", "slug": "manos-marinero"}', 75, 'raro'),
('senor-del-viento', 'Señor del Viento', 'Haizearen Jabea', 'Obtener habilidades "Domador del Viento" + "Trimador".', '"Domador del Viento" + "Trimador" trebetasunak lortu.', '🎐', 'habilidades', '{"tipo": "habilidades_conjunto", "slugs": ["domador-viento", "trimador"]}', 125, 'epico'),
('guardian-del-mar', 'Guardián del Mar', 'Itsasoko Zaindaria', 'Obtener habilidades "Patrón de Rescate" + "Oficial de Seguridad".', '"Patrón de Rescate" + "Oficial de Seguridad" trebetasunak lortu.', '🛟', 'habilidades', '{"tipo": "habilidades_conjunto", "slugs": ["patron-rescate", "oficial-seguridad"]}', 150, 'epico'),
('maestro-de-maniobras', 'Maestro de Maniobras', 'Manobretan Maisu', 'Completar todas las unidades de Virada + Trasluchada con ≥ 85%.', 'Bira eta Trasluchada unitate guztiak osatu %85arekin.', '🕹️', 'habilidades', '{"tipo": "unidades_especificas_puntuacion", "slugs": ["la-virada-por-avante", "la-trasluchada"], "minima": 85}', 100, 'raro'),
('habilidades-completas', 'Habilidades Completas', 'Trebetasun Guztiak', 'Obtener las 12 habilidades.', '12 trebetasunak lortu.', '👑', 'habilidades', '{"tipo": "habilidades_cantidad", "cantidad": 12}', 500, 'legendario'),

-- Categoría: Experiencia Práctica (5 logros)
('10-horas-navegadas', '10 Horas Navegadas', '10 Ordu Nabigatuta', 'Acumular 10 horas de navegación registradas y verificadas.', '10 nabigatze-ordu erregistratu eta egiaztatu.', '⏱️', 'practica', '{"tipo": "horas_navegacion", "cantidad": 10}', 50, 'comun'),
('50-horas-navegadas', '50 Horas Navegadas', '50 Ordu Nabigatuta', 'Acumular 50 horas de navegación registradas.', '50 nabigatze-ordu erregistratu.', '⏱️', 'practica', '{"tipo": "horas_navegacion", "cantidad": 50}', 200, 'raro'),
('100-horas-navegadas', '100 Horas Navegadas', '100 Ordu Nabigatuta', 'Acumular 100 horas de navegación registradas.', '100 nabigatze-ordu erregistratu.', '⏳', 'practica', '{"tipo": "horas_navegacion", "cantidad": 100}', 350, 'epico'),
('primer-regatista', 'Primer Regatista', 'Lehen Erregatista', 'Registrar al menos 1 hora de tipo "regata".', '"Erregata" motako ordu bat gutxienez erregistratu.', '🏁', 'practica', '{"tipo": "horas_tipo", "tipo_hora": "regata", "cantidad": 1}', 75, 'raro'),
('travesia-completada', 'Travesía Completada', 'Zeharkaldia Osatuta', 'Registrar al menos 1 hora de tipo "travesia".', '"Zeharkaldia" motako ordu bat gutxienez erregistratu.', '⚓', 'practica', '{"tipo": "horas_tipo", "tipo_hora": "travesia", "cantidad": 1}', 125, 'epico')
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

COMMIT;
