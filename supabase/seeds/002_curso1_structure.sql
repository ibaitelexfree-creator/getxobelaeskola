<<<<<<< HEAD
-- 002_curso1_structure.sql
-- Completa la estructura del Curso 1 (Unidades 4-12 y Módulos 3-4) y sus slugs.

DO $$
DECLARE
    v_curso_id UUID;
    v_modulo1_id UUID;
    v_modulo2_id UUID;
    v_modulo3_id UUID;
    v_modulo4_id UUID;
BEGIN
    -- Obtener ID del curso Iniciación
    SELECT id INTO v_curso_id FROM cursos WHERE slug = 'iniciacion-vela-ligera';
    
    IF v_curso_id IS NULL THEN
        RAISE EXCEPTION 'Curso no encontrado "iniciacion-vela-ligera"';
    END IF;

    -- =====================================================
    -- Módulo 1 (Ya existe): Introducción y Seguridad
    -- =====================================================
    SELECT id INTO v_modulo1_id FROM modulos WHERE slug = 'introduccion-seguridad';
    
    -- =====================================================
    -- Módulo 2 (Ya existe): Teoría de la Navegación (Ampliar)
    -- =====================================================
    SELECT id INTO v_modulo2_id FROM modulos WHERE slug = 'teoria-navegacion';

    -- Unidad 2.2: La Terminología Náutica
    INSERT INTO unidades_didacticas (modulo_id, slug, nombre_es, nombre_eu, orden, duracion_estimada_min, objetivos_es, objetivos_eu)
    VALUES (
        v_modulo2_id,
        'la-terminologia-nautica',
        'La Terminología Náutica',
        'Terminologia Nautikoa',
        2,
        45,
        ARRAY['Dominar vocabulario esencial'],
        ARRAY['Funtsezko hiztegia menderatzea']
    ) ON CONFLICT (modulo_id, slug) DO NOTHING;

    -- Unidad 2.3: Los Rumbos Respecto al Viento
    INSERT INTO unidades_didacticas (modulo_id, slug, nombre_es, nombre_eu, orden, duracion_estimada_min, objetivos_es, objetivos_eu)
    VALUES (
        v_modulo2_id,
        'los-rumbos-respecto-al-viento',
        'Los Rumbos Respecto al Viento',
        'Haizearen Araberako Norabideak',
        3,
        60,
        ARRAY['Identificar ceñida, través, largo y empopada'],
        ARRAY['Haize-aldea, zeharka, luzea eta popa identifikatzea']
    ) ON CONFLICT (modulo_id, slug) DO NOTHING;


    -- =====================================================
    -- Módulo 3 (NUEVO): Técnica de Navegación
    -- =====================================================
    INSERT INTO modulos (curso_id, slug, nombre_es, nombre_eu, orden, duracion_estimada_h, descripcion_es, descripcion_eu, objetivos_json)
    VALUES (
        v_curso_id,
        'tecnica-navegacion',
        'Técnica de Navegación',
        'Nabigazio Teknika',
        3,
        8,
        'Maniobras fundamentales: aparejado, virada, trasluchada y seguridad',
        'Oinarrizko maniobrak: ontziraketa, biraketa, trasluchada eta segurtasuna',
        '["Dominar aparejado", "Virar fluidamente", "Trasluchar con seguridad"]'::jsonb
    ) ON CONFLICT (curso_id, slug) DO UPDATE SET orden=3
    RETURNING id INTO v_modulo3_id;

    -- Unidad 3.1: Preparación y Aparejado
    INSERT INTO unidades_didacticas (modulo_id, slug, nombre_es, nombre_eu, orden, duracion_estimada_min, objetivos_es, objetivos_eu)
    VALUES (v_modulo3_id, 'preparacion-aparejado', 'Preparación y Aparejado del Barco', 'Ontziaren Prestaketa', 1, 45, ARRAY['Saber montar el barco'], ARRAY['Ontzia muntatzen jakitea'])
    ON CONFLICT (modulo_id, slug) DO NOTHING;

    -- Unidad 3.2: La Virada por Avante
    INSERT INTO unidades_didacticas (modulo_id, slug, nombre_es, nombre_eu, orden, duracion_estimada_min, objetivos_es, objetivos_eu)
    VALUES (v_modulo3_id, 'la-virada-por-avante', 'La Virada por Avante', 'Aurrera Biraketa', 2, 60, ARRAY['Virar sin perder inercia'], ARRAY['Inertzia galdu gabe biratzea'])
    ON CONFLICT (modulo_id, slug) DO NOTHING;

    -- Unidad 3.3: La Trasluchada
    INSERT INTO unidades_didacticas (modulo_id, slug, nombre_es, nombre_eu, orden, duracion_estimada_min, objetivos_es, objetivos_eu)
    VALUES (v_modulo3_id, 'la-trasluchada', 'La Trasluchada', 'Trasluchada', 3, 45, ARRAY['Trasluchar controlando escota'], ARRAY['Eskota kontrolatuz trasluchatzea'])
    ON CONFLICT (modulo_id, slug) DO NOTHING;

    -- Unidad 3.4: Parar, Arrancar y Posición de Seguridad
    INSERT INTO unidades_didacticas (modulo_id, slug, nombre_es, nombre_eu, orden, duracion_estimada_min, objetivos_es, objetivos_eu)
    VALUES (v_modulo3_id, 'parar-arrancar-seguridad', 'Parar, Arrancar y Posición de Seguridad', 'Gelditu, Hasi eta Segurtasuna', 4, 30, ARRAY['Detener el barco a voluntad'], ARRAY['Ontzia nahierara gelditzea'])
    ON CONFLICT (modulo_id, slug) DO NOTHING;


    -- =====================================================
    -- Módulo 4 (NUEVO): Reglamento y Marinería
    -- =====================================================
    INSERT INTO modulos (curso_id, slug, nombre_es, nombre_eu, orden, duracion_estimada_h, descripcion_es, descripcion_eu, objetivos_json)
    VALUES (
        v_curso_id,
        'reglamento-marineria',
        'Reglamento y Marinería',
        'Araudia eta Marinel-Artea',
        4,
        4,
        'Reglas de paso, nudos esenciales y navegación autónoma',
        'Pasabide arauak, funtsezko korapiloak eta nabigazio autonomoa',
        '["Conocer preferencias de paso", "Hacer 5 nudos básicos", "Integrar todo en navegación real"]'::jsonb
    ) ON CONFLICT (curso_id, slug) DO UPDATE SET orden=4
    RETURNING id INTO v_modulo4_id;

    -- Unidad 4.1: Reglas de Navegación Básicas
    INSERT INTO unidades_didacticas (modulo_id, slug, nombre_es, nombre_eu, orden, duracion_estimada_min, objetivos_es, objetivos_eu)
    VALUES (v_modulo4_id, 'reglas-navegacion-basicas', 'Reglas de Navegación Básicas', 'Oinarrizko Nabigazio Arauak', 1, 45, ARRAY['Preferencias de paso'], ARRAY['Lehentasun arauak'])
    ON CONFLICT (modulo_id, slug) DO NOTHING;

    -- Unidad 4.2: Nudos Esenciales
    INSERT INTO unidades_didacticas (modulo_id, slug, nombre_es, nombre_eu, orden, duracion_estimada_min, objetivos_es, objetivos_eu)
    VALUES (v_modulo4_id, 'nudos-esenciales', 'Nudos Esenciales', 'Funtsezko Korapiloak', 2, 60, ARRAY['As de guía, ballestrinque, ocho'], ARRAY['Gidarri korapiloa, ballestrinque, zortzikoa'])
    ON CONFLICT (modulo_id, slug) DO NOTHING;

    -- Unidad 4.3: Tu Primera Navegación Completa
    INSERT INTO unidades_didacticas (modulo_id, slug, nombre_es, nombre_eu, orden, duracion_estimada_min, objetivos_es, objetivos_eu)
    VALUES (v_modulo4_id, 'tu-primera-navegacion', 'Tu Primera Navegación Completa', 'Zure Lehen Nabigazio Osoa', 3, 90, ARRAY['Integración práctica total'], ARRAY['Integrazio praktiko osoa'])
    ON CONFLICT (modulo_id, slug) DO NOTHING;

END $$;
=======
-- 002_curso1_structure.sql
-- Completa la estructura del Curso 1 (Unidades 4-12 y Módulos 3-4) y sus slugs.

DO $$
DECLARE
    v_curso_id UUID;
    v_modulo1_id UUID;
    v_modulo2_id UUID;
    v_modulo3_id UUID;
    v_modulo4_id UUID;
BEGIN
    -- Obtener ID del curso Iniciación
    SELECT id INTO v_curso_id FROM cursos WHERE slug = 'iniciacion-vela-ligera';

    IF v_curso_id IS NULL THEN
        RAISE EXCEPTION 'Curso no encontrado "iniciacion-vela-ligera"';
    END IF;

    -- =====================================================
    -- Módulo 1 (Ya existe): Introducción y Seguridad
    -- =====================================================
    SELECT id INTO v_modulo1_id FROM modulos WHERE slug = 'introduccion-seguridad';

    -- =====================================================
    -- Módulo 2 (Ya existe): Teoría de la Navegación (Ampliar)
    -- =====================================================
    SELECT id INTO v_modulo2_id FROM modulos WHERE slug = 'teoria-navegacion';

    -- Unidad 2.2: La Terminología Náutica
    INSERT INTO unidades_didacticas (modulo_id, slug, nombre_es, nombre_eu, orden, duracion_estimada_min, objetivos_es, objetivos_eu)
    VALUES (
        v_modulo2_id,
        'la-terminologia-nautica',
        'La Terminología Náutica',
        'Terminologia Nautikoa',
        2,
        45,
        ARRAY['Dominar vocabulario esencial'],
        ARRAY['Funtsezko hiztegia menderatzea']
    ) ON CONFLICT (modulo_id, slug) DO NOTHING;

    -- Unidad 2.3: Los Rumbos Respecto al Viento
    INSERT INTO unidades_didacticas (modulo_id, slug, nombre_es, nombre_eu, orden, duracion_estimada_min, objetivos_es, objetivos_eu)
    VALUES (
        v_modulo2_id,
        'los-rumbos-respecto-al-viento',
        'Los Rumbos Respecto al Viento',
        'Haizearen Araberako Norabideak',
        3,
        60,
        ARRAY['Identificar ceñida, través, largo y empopada'],
        ARRAY['Haize-aldea, zeharka, luzea eta popa identifikatzea']
    ) ON CONFLICT (modulo_id, slug) DO NOTHING;


    -- =====================================================
    -- Módulo 3 (NUEVO): Técnica de Navegación
    -- =====================================================
    INSERT INTO modulos (curso_id, slug, nombre_es, nombre_eu, orden, duracion_estimada_h, descripcion_es, descripcion_eu, objetivos_json)
    VALUES (
        v_curso_id,
        'tecnica-navegacion',
        'Técnica de Navegación',
        'Nabigazio Teknika',
        3,
        8,
        'Maniobras fundamentales: aparejado, virada, trasluchada y seguridad',
        'Oinarrizko maniobrak: ontziraketa, biraketa, trasluchada eta segurtasuna',
        '["Dominar aparejado", "Virar fluidamente", "Trasluchar con seguridad"]'::jsonb
    ) ON CONFLICT (curso_id, slug) DO UPDATE SET orden=3
    RETURNING id INTO v_modulo3_id;

    -- Unidad 3.1: Preparación y Aparejado
    INSERT INTO unidades_didacticas (modulo_id, slug, nombre_es, nombre_eu, orden, duracion_estimada_min, objetivos_es, objetivos_eu)
    VALUES (v_modulo3_id, 'preparacion-aparejado', 'Preparación y Aparejado del Barco', 'Ontziaren Prestaketa', 1, 45, ARRAY['Saber montar el barco'], ARRAY['Ontzia muntatzen jakitea'])
    ON CONFLICT (modulo_id, slug) DO NOTHING;

    -- Unidad 3.2: La Virada por Avante
    INSERT INTO unidades_didacticas (modulo_id, slug, nombre_es, nombre_eu, orden, duracion_estimada_min, objetivos_es, objetivos_eu)
    VALUES (v_modulo3_id, 'la-virada-por-avante', 'La Virada por Avante', 'Aurrera Biraketa', 2, 60, ARRAY['Virar sin perder inercia'], ARRAY['Inertzia galdu gabe biratzea'])
    ON CONFLICT (modulo_id, slug) DO NOTHING;

    -- Unidad 3.3: La Trasluchada
    INSERT INTO unidades_didacticas (modulo_id, slug, nombre_es, nombre_eu, orden, duracion_estimada_min, objetivos_es, objetivos_eu)
    VALUES (v_modulo3_id, 'la-trasluchada', 'La Trasluchada', 'Trasluchada', 3, 45, ARRAY['Trasluchar controlando escota'], ARRAY['Eskota kontrolatuz trasluchatzea'])
    ON CONFLICT (modulo_id, slug) DO NOTHING;

    -- Unidad 3.4: Parar, Arrancar y Posición de Seguridad
    INSERT INTO unidades_didacticas (modulo_id, slug, nombre_es, nombre_eu, orden, duracion_estimada_min, objetivos_es, objetivos_eu)
    VALUES (v_modulo3_id, 'parar-arrancar-seguridad', 'Parar, Arrancar y Posición de Seguridad', 'Gelditu, Hasi eta Segurtasuna', 4, 30, ARRAY['Detener el barco a voluntad'], ARRAY['Ontzia nahierara gelditzea'])
    ON CONFLICT (modulo_id, slug) DO NOTHING;


    -- =====================================================
    -- Módulo 4 (NUEVO): Reglamento y Marinería
    -- =====================================================
    INSERT INTO modulos (curso_id, slug, nombre_es, nombre_eu, orden, duracion_estimada_h, descripcion_es, descripcion_eu, objetivos_json)
    VALUES (
        v_curso_id,
        'reglamento-marineria',
        'Reglamento y Marinería',
        'Araudia eta Marinel-Artea',
        4,
        4,
        'Reglas de paso, nudos esenciales y navegación autónoma',
        'Pasabide arauak, funtsezko korapiloak eta nabigazio autonomoa',
        '["Conocer preferencias de paso", "Hacer 5 nudos básicos", "Integrar todo en navegación real"]'::jsonb
    ) ON CONFLICT (curso_id, slug) DO UPDATE SET orden=4
    RETURNING id INTO v_modulo4_id;

    -- Unidad 4.1: Reglas de Navegación Básicas
    INSERT INTO unidades_didacticas (modulo_id, slug, nombre_es, nombre_eu, orden, duracion_estimada_min, objetivos_es, objetivos_eu)
    VALUES (v_modulo4_id, 'reglas-navegacion-basicas', 'Reglas de Navegación Básicas', 'Oinarrizko Nabigazio Arauak', 1, 45, ARRAY['Preferencias de paso'], ARRAY['Lehentasun arauak'])
    ON CONFLICT (modulo_id, slug) DO NOTHING;

    -- Unidad 4.2: Nudos Esenciales
    INSERT INTO unidades_didacticas (modulo_id, slug, nombre_es, nombre_eu, orden, duracion_estimada_min, objetivos_es, objetivos_eu)
    VALUES (v_modulo4_id, 'nudos-esenciales', 'Nudos Esenciales', 'Funtsezko Korapiloak', 2, 60, ARRAY['As de guía, ballestrinque, ocho'], ARRAY['Gidarri korapiloa, ballestrinque, zortzikoa'])
    ON CONFLICT (modulo_id, slug) DO NOTHING;

    -- Unidad 4.3: Tu Primera Navegación Completa
    INSERT INTO unidades_didacticas (modulo_id, slug, nombre_es, nombre_eu, orden, duracion_estimada_min, objetivos_es, objetivos_eu)
    VALUES (v_modulo4_id, 'tu-primera-navegacion', 'Tu Primera Navegación Completa', 'Zure Lehen Nabigazio Osoa', 3, 90, ARRAY['Integración práctica total'], ARRAY['Integrazio praktiko osoa'])
    ON CONFLICT (modulo_id, slug) DO NOTHING;

END $$;
>>>>>>> pr-286
