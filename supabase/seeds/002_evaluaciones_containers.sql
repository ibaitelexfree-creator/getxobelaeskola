<<<<<<< HEAD
-- =====================================================
-- SEED: Evaluaciones Contenedores (Quizzes y Exámenes) - COMPLETO
-- =====================================================
-- Genera las evaluaciones para el CURSO 1: INICIACIÓN A LA VELA
-- Cubre 12 Quizzes de Unidad, 3 Exámenes de Módulo y 1 Examen Final.

DO $$
DECLARE
    v_curso_id UUID;
    v_modulo1_id UUID;
    v_modulo2_id UUID;
    v_modulo3_id UUID;
BEGIN
    -- Obtener ID del Curso
    SELECT id INTO v_curso_id FROM public.cursos WHERE slug = 'iniciacion-vela-ligera';
    
    -- Obtener IDs de Módulos
    SELECT id INTO v_modulo1_id FROM public.modulos WHERE curso_id = v_curso_id AND orden = 1;
    SELECT id INTO v_modulo2_id FROM public.modulos WHERE curso_id = v_curso_id AND orden = 2;
    SELECT id INTO v_modulo3_id FROM public.modulos WHERE curso_id = v_curso_id AND orden = 3;

    -- =====================================================
    -- 1. QUIZZES DE UNIDAD (12 UNIDADES)
    -- =====================================================
    
    -- Módulo 1 (U1-U4)
    INSERT INTO public.evaluaciones (tipo, entidad_tipo, entidad_id, titulo_es, titulo_eu, num_preguntas, tiempo_limite_min, nota_aprobado, intentos_maximos, cooldown_minutos)
    SELECT 'quiz_unidad', 'unidad', id, 'Quiz: ' || nombre_es, 'Galdetegia: ' || nombre_eu, 5, 10, 70.00, 3, 60
    FROM public.unidades_didacticas WHERE modulo_id = v_modulo1_id
    ON CONFLICT (entidad_tipo, entidad_id, tipo) DO NOTHING;

    -- Módulo 2 (U5-U8)
    INSERT INTO public.evaluaciones (tipo, entidad_tipo, entidad_id, titulo_es, titulo_eu, num_preguntas, tiempo_limite_min, nota_aprobado, intentos_maximos, cooldown_minutos)
    SELECT 'quiz_unidad', 'unidad', id, 'Quiz: ' || nombre_es, 'Galdetegia: ' || nombre_eu, 5, 10, 70.00, 3, 60
    FROM public.unidades_didacticas WHERE modulo_id = v_modulo2_id
    ON CONFLICT (entidad_tipo, entidad_id, tipo) DO NOTHING;

    -- Módulo 3 (U9-U12)
    INSERT INTO public.evaluaciones (tipo, entidad_tipo, entidad_id, titulo_es, titulo_eu, num_preguntas, tiempo_limite_min, nota_aprobado, intentos_maximos, cooldown_minutos)
    SELECT 'quiz_unidad', 'unidad', id, 'Quiz: ' || nombre_es, 'Galdetegia: ' || nombre_eu, 5, 10, 70.00, 3, 60
    FROM public.unidades_didacticas WHERE modulo_id = v_modulo3_id
    ON CONFLICT (entidad_tipo, entidad_id, tipo) DO NOTHING;


    -- =====================================================
    -- 2. EXÁMENES DE MÓDULO (3 MÓDULOS)
    -- =====================================================
    
    -- Examen Módulo 1
    INSERT INTO public.evaluaciones (tipo, entidad_tipo, entidad_id, titulo_es, titulo_eu, num_preguntas, tiempo_limite_min, nota_aprobado, intentos_maximos, cooldown_minutos, mostrar_respuestas)
    VALUES ('examen_modulo', 'modulo', v_modulo1_id, 'Examen Módulo 1: Seguridad y Bases', '1. Modulu Azterketa: Segurtasuna', 15, 25, 75.00, 2, 720, FALSE)
    ON CONFLICT (entidad_tipo, entidad_id, tipo) DO NOTHING;

    -- Examen Módulo 2
    INSERT INTO public.evaluaciones (tipo, entidad_tipo, entidad_id, titulo_es, titulo_eu, num_preguntas, tiempo_limite_min, nota_aprobado, intentos_maximos, cooldown_minutos, mostrar_respuestas)
    VALUES ('examen_modulo', 'modulo', v_modulo2_id, 'Examen Módulo 2: Navegación y Maniobra', '2. Modulu Azterketa: Nabigazioa', 15, 25, 75.00, 2, 720, FALSE)
    ON CONFLICT (entidad_tipo, entidad_id, tipo) DO NOTHING;

    -- Examen Módulo 3
    INSERT INTO public.evaluaciones (tipo, entidad_tipo, entidad_id, titulo_es, titulo_eu, num_preguntas, tiempo_limite_min, nota_aprobado, intentos_maximos, cooldown_minutos, mostrar_respuestas)
    VALUES ('examen_modulo', 'modulo', v_modulo3_id, 'Examen Módulo 3: Práctica y Reglamento', '3. Modulu Azterketa: Praktika', 15, 25, 75.00, 2, 720, FALSE)
    ON CONFLICT (entidad_tipo, entidad_id, tipo) DO NOTHING;


    -- =====================================================
    -- 3. EXAMEN FINAL DE CURSO
    -- =====================================================
    INSERT INTO public.evaluaciones (tipo, entidad_tipo, entidad_id, titulo_es, titulo_eu, num_preguntas, tiempo_limite_min, nota_aprobado, intentos_maximos, cooldown_minutos, mostrar_respuestas)
    VALUES ('examen_final', 'curso', v_curso_id, 'Examen Final: Iniciación a la Vela', 'Azterketa Finala: Bela Hastapena', 30, 45, 80.00, 2, 1440, FALSE)
    ON CONFLICT (entidad_tipo, entidad_id, tipo) DO NOTHING;

    RAISE NOTICE 'Evaluaciones (quizzes y exámenes) configuradas para el Curso 1';
END $$;
=======
-- =====================================================
-- SEED: Evaluaciones Contenedores (Quizzes y Exámenes) - COMPLETO
-- =====================================================
-- Genera las evaluaciones para el CURSO 1: INICIACIÓN A LA VELA
-- Cubre 12 Quizzes de Unidad, 3 Exámenes de Módulo y 1 Examen Final.

DO $$
DECLARE
    v_curso_id UUID;
    v_modulo1_id UUID;
    v_modulo2_id UUID;
    v_modulo3_id UUID;
BEGIN
    -- Obtener ID del Curso
    SELECT id INTO v_curso_id FROM public.cursos WHERE slug = 'iniciacion-vela-ligera';

    -- Obtener IDs de Módulos
    SELECT id INTO v_modulo1_id FROM public.modulos WHERE curso_id = v_curso_id AND orden = 1;
    SELECT id INTO v_modulo2_id FROM public.modulos WHERE curso_id = v_curso_id AND orden = 2;
    SELECT id INTO v_modulo3_id FROM public.modulos WHERE curso_id = v_curso_id AND orden = 3;

    -- =====================================================
    -- 1. QUIZZES DE UNIDAD (12 UNIDADES)
    -- =====================================================

    -- Módulo 1 (U1-U4)
    INSERT INTO public.evaluaciones (tipo, entidad_tipo, entidad_id, titulo_es, titulo_eu, num_preguntas, tiempo_limite_min, nota_aprobado, intentos_maximos, cooldown_minutos)
    SELECT 'quiz_unidad', 'unidad', id, 'Quiz: ' || nombre_es, 'Galdetegia: ' || nombre_eu, 5, 10, 70.00, 3, 60
    FROM public.unidades_didacticas WHERE modulo_id = v_modulo1_id
    ON CONFLICT (entidad_tipo, entidad_id, tipo) DO NOTHING;

    -- Módulo 2 (U5-U8)
    INSERT INTO public.evaluaciones (tipo, entidad_tipo, entidad_id, titulo_es, titulo_eu, num_preguntas, tiempo_limite_min, nota_aprobado, intentos_maximos, cooldown_minutos)
    SELECT 'quiz_unidad', 'unidad', id, 'Quiz: ' || nombre_es, 'Galdetegia: ' || nombre_eu, 5, 10, 70.00, 3, 60
    FROM public.unidades_didacticas WHERE modulo_id = v_modulo2_id
    ON CONFLICT (entidad_tipo, entidad_id, tipo) DO NOTHING;

    -- Módulo 3 (U9-U12)
    INSERT INTO public.evaluaciones (tipo, entidad_tipo, entidad_id, titulo_es, titulo_eu, num_preguntas, tiempo_limite_min, nota_aprobado, intentos_maximos, cooldown_minutos)
    SELECT 'quiz_unidad', 'unidad', id, 'Quiz: ' || nombre_es, 'Galdetegia: ' || nombre_eu, 5, 10, 70.00, 3, 60
    FROM public.unidades_didacticas WHERE modulo_id = v_modulo3_id
    ON CONFLICT (entidad_tipo, entidad_id, tipo) DO NOTHING;


    -- =====================================================
    -- 2. EXÁMENES DE MÓDULO (3 MÓDULOS)
    -- =====================================================

    -- Examen Módulo 1
    INSERT INTO public.evaluaciones (tipo, entidad_tipo, entidad_id, titulo_es, titulo_eu, num_preguntas, tiempo_limite_min, nota_aprobado, intentos_maximos, cooldown_minutos, mostrar_respuestas)
    VALUES ('examen_modulo', 'modulo', v_modulo1_id, 'Examen Módulo 1: Seguridad y Bases', '1. Modulu Azterketa: Segurtasuna', 15, 25, 75.00, 2, 720, FALSE)
    ON CONFLICT (entidad_tipo, entidad_id, tipo) DO NOTHING;

    -- Examen Módulo 2
    INSERT INTO public.evaluaciones (tipo, entidad_tipo, entidad_id, titulo_es, titulo_eu, num_preguntas, tiempo_limite_min, nota_aprobado, intentos_maximos, cooldown_minutos, mostrar_respuestas)
    VALUES ('examen_modulo', 'modulo', v_modulo2_id, 'Examen Módulo 2: Navegación y Maniobra', '2. Modulu Azterketa: Nabigazioa', 15, 25, 75.00, 2, 720, FALSE)
    ON CONFLICT (entidad_tipo, entidad_id, tipo) DO NOTHING;

    -- Examen Módulo 3
    INSERT INTO public.evaluaciones (tipo, entidad_tipo, entidad_id, titulo_es, titulo_eu, num_preguntas, tiempo_limite_min, nota_aprobado, intentos_maximos, cooldown_minutos, mostrar_respuestas)
    VALUES ('examen_modulo', 'modulo', v_modulo3_id, 'Examen Módulo 3: Práctica y Reglamento', '3. Modulu Azterketa: Praktika', 15, 25, 75.00, 2, 720, FALSE)
    ON CONFLICT (entidad_tipo, entidad_id, tipo) DO NOTHING;


    -- =====================================================
    -- 3. EXAMEN FINAL DE CURSO
    -- =====================================================
    INSERT INTO public.evaluaciones (tipo, entidad_tipo, entidad_id, titulo_es, titulo_eu, num_preguntas, tiempo_limite_min, nota_aprobado, intentos_maximos, cooldown_minutos, mostrar_respuestas)
    VALUES ('examen_final', 'curso', v_curso_id, 'Examen Final: Iniciación a la Vela', 'Azterketa Finala: Bela Hastapena', 30, 45, 80.00, 2, 1440, FALSE)
    ON CONFLICT (entidad_tipo, entidad_id, tipo) DO NOTHING;

    RAISE NOTICE 'Evaluaciones (quizzes y exámenes) configuradas para el Curso 1';
END $$;
>>>>>>> pr-286
