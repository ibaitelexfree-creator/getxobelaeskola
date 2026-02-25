-- 004_evaluaciones_curso1.sql
-- FASE 2: Seed de Evaluaciones (Quizzes y Exámenes)

BEGIN;

-- 1. Quizzes de Unidad (1 por cada una de las 12 unidades)
-- Configuración: 5 preg, 60% aprobado, sin tiempo, 2 min cooldown
INSERT INTO public.evaluaciones (tipo, entidad_tipo, entidad_id, titulo_es, titulo_eu, num_preguntas, tiempo_limite_min, nota_aprobado, cooldown_minutos, intentos_ventana_limite, intentos_ventana_horas)
SELECT 
    'quiz_unidad', 
    'unidad', 
    id, 
    'Quiz de Unidad: ' || nombre_es, 
    'Unitate-Quiz: ' || nombre_eu, 
    5, 
    NULL, 
    60.00,
    2,
    NULL,
    NULL
FROM public.unidades_didacticas
WHERE modulo_id IN (
    SELECT id FROM public.modulos WHERE curso_id = (SELECT id FROM public.cursos WHERE slug = 'iniciacion-vela-ligera' LIMIT 1)
)
ON CONFLICT DO NOTHING;

-- 2. Exámenes de Módulo (4 módulos)
-- Configuración: 15 preg, 70% aprobado, 20 min limite, 3 intentos/24h
INSERT INTO public.evaluaciones (tipo, entidad_tipo, entidad_id, titulo_es, titulo_eu, num_preguntas, tiempo_limite_min, nota_aprobado, cooldown_minutos, intentos_ventana_limite, intentos_ventana_horas)
SELECT 
    'examen_modulo', 
    'modulo', 
    id, 
    'Examen Módulo: ' || nombre_es, 
    'Modulo-Azterketa: ' || nombre_eu, 
    15, 
    20, 
    70.00,
    0,
    3,
    24
FROM public.modulos
WHERE curso_id = (SELECT id FROM public.cursos WHERE slug = 'iniciacion-vela-ligera' LIMIT 1)
ON CONFLICT DO NOTHING;

-- 3. Examen Final del Curso
-- Configuración: 30 preg, 75% aprobado, 45 min limite, 2 intentos/48h
INSERT INTO public.evaluaciones (tipo, entidad_tipo, entidad_id, titulo_es, titulo_eu, num_preguntas, tiempo_limite_min, nota_aprobado, cooldown_minutos, intentos_ventana_limite, intentos_ventana_horas)
SELECT 
    'examen_final', 
    'curso', 
    id, 
    'Examen Final: ' || nombre_es, 
    'Ikastaro-Amaierako Azterketa: ' || nombre_eu, 
    30, 
    45, 
    75.00,
    0,
    2,
    48
FROM public.cursos
WHERE slug = 'iniciacion-vela-ligera'
ON CONFLICT DO NOTHING;

-- 4. Casos Prácticos (Actividades Interactivas)
-- Linked to relevant units

-- Caso 1: Viento creciente -> Seguridad
INSERT INTO public.actividades (unidad_id, tipo, titulo_es, titulo_eu, descripcion_es, config_json)
SELECT id, 'escenario_emergencia', 'Viento creciente en través', 'Haizea handitzen zeharka', 
'Escenario de decisión ante un aumento repentino de intensidad del viento.',
'{"escenario": "Estás navegando en través con 8 nudos. El viento sube a 18 nudos. El barco escora mucho.", "pasos": ["Largar escota", "Hacer banda", "Valorar", "Orzar a posición de seguridad"]}'::jsonb
FROM public.unidades_didacticas WHERE slug = 'seguridad-en-el-mar' LIMIT 1;

-- Caso 2: Trasluchada involuntaria -> Maniobra
INSERT INTO public.actividades (unidad_id, tipo, titulo_es, titulo_eu, descripcion_es, config_json)
SELECT id, 'simulacion_maniobra', 'Trasluchada involuntaria', 'Nahi gabeko trasluchada', 
'Cómo reaccionar cuando la botavara cruza de golpe sin aviso.',
'{"escenario": "Viento de popa, la botavara empieza a cruzar sola.", "pasos": ["Agacharse", "Sujetar escota", "Cambiar de banda", "Estabilizar"]}'::jsonb
FROM public.unidades_didacticas WHERE slug = 'la-trasluchada' LIMIT 1;

-- Caso 3: Quedarse en proa -> Virada
INSERT INTO public.actividades (unidad_id, tipo, titulo_es, titulo_eu, descripcion_es, config_json)
SELECT id, 'simulacion_maniobra', 'Virada fallida: en proa', 'Bira hutsa: proan geratzea', 
'Resolución de la situación de bloqueo mirando al viento.',
'{"escenario": "Barco parado mirando al viento tras intentar virar.", "pasos": ["Timón a fondo", "Vela suelta", "Esperar caída", "Arrancar"]}'::jsonb
FROM public.unidades_didacticas WHERE slug = 'la-virada-por-avante' LIMIT 1;

-- Caso 4: Tapón de achique -> Preparación
INSERT INTO public.actividades (unidad_id, tipo, titulo_es, titulo_eu, descripcion_es, config_json)
SELECT id, 'escenario_emergencia', 'Olvidaste el tapón', 'Tapoia ahaztu duzu', 
'Detección y solución de entrada de agua por descuido.',
'{"escenario": "El barco pesa y hay agua dentro del casco.", "pasos": ["Proa al viento", "Localizar tapón", "Cerrar", "Achicar"]}'::jsonb
FROM public.unidades_didacticas WHERE slug = 'preparacion-aparejado' LIMIT 1;

-- Caso 5: Cruce con otro velero -> Reglas
INSERT INTO public.actividades (unidad_id, tipo, titulo_es, titulo_eu, descripcion_es, config_json)
SELECT id, 'decision_tactica', 'Cruce con otro velero', 'Belaontzi baten aurrean gurutzatzea', 
'Aplicación de la regla "Estribor manda".',
'{"escenario": "Ves un barco con viento de estribor. Tú vas de babor.", "regla": "Estribor manda", "accion": "Maniobrar pronto y visible"}'::jsonb
FROM public.unidades_didacticas WHERE slug = 'reglas-navegacion-basicas' LIMIT 1;

-- Caso 6: Vuelco -> Seguridad
INSERT INTO public.actividades (unidad_id, tipo, titulo_es, titulo_eu, descripcion_es, config_json)
SELECT id, 'escenario_emergencia', 'Vuelco (ozobra)', 'Iraultzea', 
'Protocolo de adrizamiento de la embarcación.',
'{"escenario": "Barco volcado con la vela en el agua.", "pasos": ["Mantener calma", "No abandonar barco", "Subirse a orza", "Hacer palanca", "Adrizar"]}'::jsonb
FROM public.unidades_didacticas WHERE slug = 'seguridad-en-el-mar' LIMIT 1;

-- Caso 7: Bañistas -> Reglas
INSERT INTO public.actividades (unidad_id, tipo, titulo_es, titulo_eu, descripcion_es, config_json)
SELECT id, 'decision_tactica', 'Zona de bañistas', 'Bainu-eremua', 
'Entrada segura a la playa respetando boyas amarillas.',
'{"escenario": "Llegas a la playa con gente bañándose.", "pasos": ["Identificar boyas", "Bajar velocidad", "Canal de entrada", "Levantar orza"]}'::jsonb
FROM public.unidades_didacticas WHERE slug = 'reglas-navegacion-basicas' LIMIT 1;

-- Caso 8: Timón roto -> Emergencia
INSERT INTO public.actividades (unidad_id, tipo, titulo_es, titulo_eu, descripcion_es, config_json)
SELECT id, 'escenario_emergencia', 'Pérdida de gobierno', 'Gobernua galtzea', 
'Navegación de emergencia sin timón usando pesos y velas.',
'{"escenario": "El timón se ha roto. Estás a 1 milla de puerto.", "pasos": ["Soltar escota", "Usar peso", "Trimado", "Señalizar"]}'::jsonb
FROM public.unidades_didacticas WHERE slug = 'tu-primera-navegacion' LIMIT 1;

-- Caso 9: Rolada -> Rumbos
INSERT INTO public.actividades (unidad_id, tipo, titulo_es, titulo_eu, descripcion_es, config_json)
SELECT id, 'decision_tactica', 'Cambio brusco de viento', 'Haizearen bat-bateko aldaketa', 
'Ajuste de rumbos y velas ante una rolada.',
'{"escenario": "El viento gira 90 grados de repente.", "pasos": ["Soltar escota", "Orzar/Arribar", "Identificar nuevo viento", "Trimado"]}'::jsonb
FROM public.unidades_didacticas WHERE slug = 'los-rumbos-respecto-al-viento' LIMIT 1;

-- Caso 10: Compañero en apuros -> Seguridad
INSERT INTO public.actividades (unidad_id, tipo, titulo_es, titulo_eu, descripcion_es, config_json)
SELECT id, 'escenario_emergencia', 'Compañero en dificultades', 'Kide bat larrialdian', 
'Protocolo de asistencia y seguridad ante otro barco volcado.',
'{"escenario": "Ves a otro alumno volcado cansado.", "pasos": ["Aproximación segura", "Comunicar", "Avisar instructor", "No ser segunda víctima"]}'::jsonb
FROM public.unidades_didacticas WHERE slug = 'reglas-navegacion-basicas' LIMIT 1;

COMMIT;
