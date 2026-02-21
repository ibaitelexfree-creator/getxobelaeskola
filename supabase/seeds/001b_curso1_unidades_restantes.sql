-- =====================================================
-- SEED: Unidades Didácticas Restantes (4-12) - Curso 1
-- =====================================================
-- Este script completa la creación de las 12 unidades del Curso 1

DO $$
DECLARE
    v_curso_id UUID;
    v_modulo1_id UUID;
    v_modulo2_id UUID;
    v_modulo3_id UUID;
BEGIN
    -- Obtener ID del Curso
    SELECT id INTO v_curso_id FROM public.cursos WHERE slug = 'iniciacion-vela-ligera';
    
    -- Obtener/Asegurar Módulos
    -- Módulo 1: Introducción y Seguridad (U1-U4)
    SELECT id INTO v_modulo1_id FROM public.modulos WHERE curso_id = v_curso_id AND orden = 1;
    -- Módulo 2: Teoría y Maniobra (U5-U8)
    SELECT id INTO v_modulo2_id FROM public.modulos WHERE curso_id = v_curso_id AND orden = 2;
    -- Módulo 3: Práctica y Reglamento (U9-U12)
    -- Si el módulo 3 no existe (seed 001 solo creó 2), lo creamos.
    IF NOT EXISTS (SELECT 1 FROM public.modulos WHERE curso_id = v_curso_id AND orden = 3) THEN
        INSERT INTO public.modulos (curso_id, slug, nombre_es, nombre_eu, descripcion_es, descripcion_eu, orden, duracion_estimada_h)
        VALUES (v_curso_id, 'practica-reglamento', 'Práctica y Reglamento', 'Praktika eta Araudia', 'Maniobras avanzadas, seguridad y reglamento', 'Maniobra aurreratuak, segurtasuna eta araudia', 3, 6)
        RETURNING id INTO v_modulo3_id;
    ELSE
        SELECT id INTO v_modulo3_id FROM public.modulos WHERE curso_id = v_curso_id AND orden = 3;
    END IF;

    -- =====================================================
    -- UNIDAD 4: La Terminología Náutica (M1)
    -- =====================================================
    INSERT INTO unidades_didacticas (modulo_id, slug, nombre_es, nombre_eu, orden, duracion_estimada_min, objetivos_es)
    VALUES (v_modulo1_id, 'terminologia-nautica', 'La Terminología Náutica', 'Terminologia Nautikoa', 4, 30, ARRAY['Dominar el vocabulario esencial de la navegación'])
    ON CONFLICT (slug) DO UPDATE SET modulo_id = v_modulo1_id, orden = 4;

    -- =====================================================
    -- UNIDAD 5: Los Rumbos Respecto al Viento (M2)
    -- =====================================================
    INSERT INTO unidades_didacticas (modulo_id, slug, nombre_es, nombre_eu, orden, duracion_estimada_min, objetivos_es)
    VALUES (v_modulo2_id, 'rumbos-de-navegacion', 'Los Rumbos Respecto al Viento', 'Haizearekiko Norabideak', 2, 45, ARRAY['Identificar los distintos rumbos de navegación'])
    ON CONFLICT (slug) DO UPDATE SET modulo_id = v_modulo2_id, orden = 2;

    -- =====================================================
    -- UNIDAD 6: Preparación y Aparejado del Barco (M2)
    -- =====================================================
    INSERT INTO unidades_didacticas (modulo_id, slug, nombre_es, nombre_eu, orden, duracion_estimada_min, objetivos_es)
    VALUES (v_modulo2_id, 'aparejar-y-desaparejar', 'Preparación y Aparejado del Barco', 'Ontzia Prestatu eta Desmuntatu', 3, 60, ARRAY['Saber preparar una embarcación de vela ligera'])
    ON CONFLICT (slug) DO UPDATE SET modulo_id = v_modulo2_id, orden = 3;

    -- =====================================================
    -- UNIDAD 7: La Virada por Avante (M2)
    -- =====================================================
    INSERT INTO unidades_didacticas (modulo_id, slug, nombre_es, nombre_eu, orden, duracion_estimada_min, objetivos_es)
    VALUES (v_modulo2_id, 'la-virada-por-avante', 'La Virada por Avante', 'Aurretik Biratzea', 4, 45, ARRAY['Ejecutar correctamente una virada por avante'])
    ON CONFLICT (slug) DO UPDATE SET modulo_id = v_modulo2_id, orden = 4;

    -- =====================================================
    -- UNIDAD 8: La Trasluchada (M2)
    -- =====================================================
    INSERT INTO unidades_didacticas (modulo_id, slug, nombre_es, nombre_eu, orden, duracion_estimada_min, objetivos_es)
    VALUES (v_modulo2_id, 'la-trasluchada', 'La Trasluchada', 'Trasluchada', 5, 45, ARRAY['Ejecutar una trasluchada de forma controlada'])
    ON CONFLICT (slug) DO UPDATE SET modulo_id = v_modulo2_id, orden = 5;

    -- =====================================================
    -- UNIDAD 9: Parar, Arrancar y Posición de Seguridad (M3)
    -- =====================================================
    INSERT INTO unidades_didacticas (modulo_id, slug, nombre_es, nombre_eu, orden, duracion_estimada_min, objetivos_es)
    VALUES (v_modulo3_id, 'parar-arrancar-posicion-seguridad', 'Parar, Arrancar y Posición de Seguridad', 'Gelditu, Abiatu eta Segurtasun Posizioa', 1, 40, ARRAY['Saber detener el barco y mantener posición de seguridad'])
    ON CONFLICT (slug) DO UPDATE SET modulo_id = v_modulo3_id, orden = 1;

    -- =====================================================
    -- UNIDAD 10: Reglas de Navegación Básicas (M3)
    -- =====================================================
    INSERT INTO unidades_didacticas (modulo_id, slug, nombre_es, nombre_eu, orden, duracion_estimada_min, objetivos_es)
    VALUES (v_modulo3_id, 'reglas-de-navegacion', 'Reglas de Navegación Básicas', 'Oinarrizko Nabigazio Arauak', 2, 45, ARRAY['Conocer las preferencias de paso en el mar'])
    ON CONFLICT (slug) DO UPDATE SET modulo_id = v_modulo3_id, orden = 2;

    -- =====================================================
    -- UNIDAD 11: Nudos Esenciales (M3)
    -- =====================================================
    INSERT INTO unidades_didacticas (modulo_id, slug, nombre_es, nombre_eu, orden, duracion_estimada_min, objetivos_es)
    VALUES (v_modulo3_id, 'nudos-basicos', 'Nudos Esenciales', 'Oinarrizko Korapiloak', 3, 60, ARRAY['Dominar los 5 nudos fundamentales de la náutica'])
    ON CONFLICT (slug) DO UPDATE SET modulo_id = v_modulo3_id, orden = 3;

    -- =====================================================
    -- UNIDAD 12: Tu Primera Navegación Completa (M3)
    -- =====================================================
    INSERT INTO unidades_didacticas (modulo_id, slug, nombre_es, nombre_eu, orden, duracion_estimada_min, objetivos_es)
    VALUES (v_modulo3_id, 'tu-primera-navegacion', 'Tu Primera Navegación Completa', 'Zure Lehen Nabigazio Osoa', 4, 90, ARRAY['Integrar todo lo aprendido en una navegación autónoma'])
    ON CONFLICT (slug) DO UPDATE SET modulo_id = v_modulo3_id, orden = 4;

    RAISE NOTICE 'Unidades 4-12 de Curso 1 creadas exitosamente.';
END $$;
