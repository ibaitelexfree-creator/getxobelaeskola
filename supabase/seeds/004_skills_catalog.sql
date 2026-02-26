<<<<<<< HEAD
-- =====================================================
-- SEED: Catálogo de Habilidades y Reglas de Desbloqueo
-- =====================================================

DO $$
DECLARE
    v_skill_id UUID;
    v_source_id UUID;
BEGIN
    -- =====================================================
    -- 1. HABILIDADES (12 TOTAL)
    -- =====================================================

    -- 1. Marinero de Agua Dulce
    INSERT INTO public.skills (name, category, icon, description)
    VALUES ('Marinero de Agua Dulce', 'Técnica', '⚓', 'Primer contacto superado: ya conoces las partes del barco y la seguridad básica.')
    RETURNING id INTO v_skill_id;

    -- Regla: Completar Módulo 1 of Iniciación
    SELECT id INTO v_source_id FROM public.modulos WHERE slug = 'introduccion-seguridad';
    IF v_source_id IS NOT NULL THEN
        INSERT INTO public.skill_unlock_rules (skill_id, rule_type, source_id)
        VALUES (v_skill_id, 'complete_module', v_source_id);
    END IF;


    -- 2. Domador del Viento
    INSERT INTO public.skills (name, category, icon, description)
    VALUES ('Domador del Viento', 'Técnica', '💨', 'Entiendes cómo el viento se convierte en movimiento.')
    RETURNING id INTO v_skill_id;

    -- Regla: Completar Módulo 2 of Iniciación
    SELECT id INTO v_source_id FROM public.modulos WHERE slug = 'teoria-navegacion';
    IF v_source_id IS NOT NULL THEN
        INSERT INTO public.skill_unlock_rules (skill_id, rule_type, source_id)
        VALUES (v_skill_id, 'complete_module', v_source_id);
    END IF;


    -- 3. Manos de Marinero
    INSERT INTO public.skills (name, category, icon, description)
    VALUES ('Manos de Marinero', 'Técnica', '🪢', 'Capacidad demostrada para realizar los nudos esenciales con precisión.')
    RETURNING id INTO v_skill_id;

    -- Regla: Completar Unidad de Nudos
    SELECT id INTO v_source_id FROM public.unidades_didacticas WHERE slug = 'nudos-esenciales';
    IF v_source_id IS NOT NULL THEN
        INSERT INTO public.skill_unlock_rules (skill_id, rule_type, source_id)
        VALUES (v_skill_id, 'complete_unit', v_source_id);
    END IF;


    -- 4. Trimador
    INSERT INTO public.skills (name, category, icon, description)
    VALUES ('Trimador', 'Técnica', '⛵', 'Dominas el ajuste fino de las velas para obtener el máximo rendimiento.')
    RETURNING id INTO v_skill_id;


    -- 5. Táctico
    INSERT INTO public.skills (name, category, icon, description)
    VALUES ('Táctico', 'Táctica', '🧭', 'Capacidad para leer el campo de regatas y tomar decisiones estratégicas.')
    RETURNING id INTO v_skill_id;


    -- 6. Patrón de Rescate
    INSERT INTO public.skills (name, category, icon, description)
    VALUES ('Patrón de Rescate', 'Seguridad', '🛟', 'Experto en maniobras de hombre al agua y seguridad avanzada.')
    RETURNING id INTO v_skill_id;


    -- 7. Regatista
    INSERT INTO public.skills (name, category, icon, description)
    VALUES ('Regatista', 'Táctica', '🏁', 'Iniciación a la competición y dominio de las reglas de regata.')
    RETURNING id INTO v_skill_id;


    -- 8. Patrón de Bahía
    INSERT INTO public.skills (name, category, icon, description)
    VALUES ('Patrón de Bahía', 'Técnica', '🏙️', 'Capacidad para patronear embarcaciones de crucero en aguas costeras.')
    RETURNING id INTO v_skill_id;


    -- 9. Lobo de Mar
    INSERT INTO public.skills (name, category, icon, description)
    VALUES ('Lobo de Mar', 'Técnica', '🌊', 'Experiencia contrastada en condiciones meteorológicas adversas y maniobras complejas.')
    RETURNING id INTO v_skill_id;


    -- 10. Oficial de Seguridad
    INSERT INTO public.skills (name, category, icon, description)
    VALUES ('Oficial de Seguridad', 'Seguridad', '🆘', 'Máximo nivel de competencia en protocolos de emergencia y salvamento.')
    RETURNING id INTO v_skill_id;


    -- 11. Meteorólogo de Abordo
    INSERT INTO public.skills (name, category, icon, description)
    VALUES ('Meteorólogo de Abordo', 'Meteorología', '🌤️', 'Capacidad para interpretar mapas, nubes y modelos para una navegación segura.')
    RETURNING id INTO v_skill_id;


    -- 12. Capitán
    INSERT INTO public.skills (name, category, icon, description)
    VALUES ('Capitán', 'Excelencia', '🟡', 'Navegante completo: dominio total de todas las facetas de la náutica.')
    RETURNING id INTO v_skill_id;

    -- Regla: Completar Level 7 (Meteorología) or Final Level
    SELECT id INTO v_source_id FROM public.niveles_formacion WHERE slug = 'meteorologia';
    IF v_source_id IS NOT NULL THEN
        INSERT INTO public.skill_unlock_rules (skill_id, rule_type, source_id)
        VALUES (v_skill_id, 'complete_level', v_source_id);
    END IF;

    RAISE NOTICE 'Catálogo de 12 habilidades y reglas básicas insertadas correctamente.';
END $$;
=======
-- =====================================================
-- SEED: Catálogo de Habilidades y Reglas de Desbloqueo
-- =====================================================

DO $$
DECLARE
    v_skill_id UUID;
    v_source_id UUID;
BEGIN
    -- =====================================================
    -- 1. HABILIDADES (12 TOTAL)
    -- =====================================================

    -- 1. Marinero de Agua Dulce
    INSERT INTO public.skills (name, category, icon, description)
    VALUES ('Marinero de Agua Dulce', 'Técnica', '⚓', 'Primer contacto superado: ya conoces las partes del barco y la seguridad básica.')
    RETURNING id INTO v_skill_id;

    -- Regla: Completar Módulo 1 of Iniciación
    SELECT id INTO v_source_id FROM public.modulos WHERE slug = 'introduccion-seguridad';
    IF v_source_id IS NOT NULL THEN
        INSERT INTO public.skill_unlock_rules (skill_id, rule_type, source_id)
        VALUES (v_skill_id, 'complete_module', v_source_id);
    END IF;


    -- 2. Domador del Viento
    INSERT INTO public.skills (name, category, icon, description)
    VALUES ('Domador del Viento', 'Técnica', '💨', 'Entiendes cómo el viento se convierte en movimiento.')
    RETURNING id INTO v_skill_id;

    -- Regla: Completar Módulo 2 of Iniciación
    SELECT id INTO v_source_id FROM public.modulos WHERE slug = 'teoria-navegacion';
    IF v_source_id IS NOT NULL THEN
        INSERT INTO public.skill_unlock_rules (skill_id, rule_type, source_id)
        VALUES (v_skill_id, 'complete_module', v_source_id);
    END IF;


    -- 3. Manos de Marinero
    INSERT INTO public.skills (name, category, icon, description)
    VALUES ('Manos de Marinero', 'Técnica', '🪢', 'Capacidad demostrada para realizar los nudos esenciales con precisión.')
    RETURNING id INTO v_skill_id;

    -- Regla: Completar Unidad de Nudos
    SELECT id INTO v_source_id FROM public.unidades_didacticas WHERE slug = 'nudos-esenciales';
    IF v_source_id IS NOT NULL THEN
        INSERT INTO public.skill_unlock_rules (skill_id, rule_type, source_id)
        VALUES (v_skill_id, 'complete_unit', v_source_id);
    END IF;


    -- 4. Trimador
    INSERT INTO public.skills (name, category, icon, description)
    VALUES ('Trimador', 'Técnica', '⛵', 'Dominas el ajuste fino de las velas para obtener el máximo rendimiento.')
    RETURNING id INTO v_skill_id;


    -- 5. Táctico
    INSERT INTO public.skills (name, category, icon, description)
    VALUES ('Táctico', 'Táctica', '🧭', 'Capacidad para leer el campo de regatas y tomar decisiones estratégicas.')
    RETURNING id INTO v_skill_id;


    -- 6. Patrón de Rescate
    INSERT INTO public.skills (name, category, icon, description)
    VALUES ('Patrón de Rescate', 'Seguridad', '🛟', 'Experto en maniobras de hombre al agua y seguridad avanzada.')
    RETURNING id INTO v_skill_id;


    -- 7. Regatista
    INSERT INTO public.skills (name, category, icon, description)
    VALUES ('Regatista', 'Táctica', '🏁', 'Iniciación a la competición y dominio de las reglas de regata.')
    RETURNING id INTO v_skill_id;


    -- 8. Patrón de Bahía
    INSERT INTO public.skills (name, category, icon, description)
    VALUES ('Patrón de Bahía', 'Técnica', '🏙️', 'Capacidad para patronear embarcaciones de crucero en aguas costeras.')
    RETURNING id INTO v_skill_id;


    -- 9. Lobo de Mar
    INSERT INTO public.skills (name, category, icon, description)
    VALUES ('Lobo de Mar', 'Técnica', '🌊', 'Experiencia contrastada en condiciones meteorológicas adversas y maniobras complejas.')
    RETURNING id INTO v_skill_id;


    -- 10. Oficial de Seguridad
    INSERT INTO public.skills (name, category, icon, description)
    VALUES ('Oficial de Seguridad', 'Seguridad', '🆘', 'Máximo nivel de competencia en protocolos de emergencia y salvamento.')
    RETURNING id INTO v_skill_id;


    -- 11. Meteorólogo de Abordo
    INSERT INTO public.skills (name, category, icon, description)
    VALUES ('Meteorólogo de Abordo', 'Meteorología', '🌤️', 'Capacidad para interpretar mapas, nubes y modelos para una navegación segura.')
    RETURNING id INTO v_skill_id;


    -- 12. Capitán
    INSERT INTO public.skills (name, category, icon, description)
    VALUES ('Capitán', 'Excelencia', '🟡', 'Navegante completo: dominio total de todas las facetas de la náutica.')
    RETURNING id INTO v_skill_id;

    -- Regla: Completar Level 7 (Meteorología) or Final Level
    SELECT id INTO v_source_id FROM public.niveles_formacion WHERE slug = 'meteorologia';
    IF v_source_id IS NOT NULL THEN
        INSERT INTO public.skill_unlock_rules (skill_id, rule_type, source_id)
        VALUES (v_skill_id, 'complete_level', v_source_id);
    END IF;

    RAISE NOTICE 'Catálogo de 12 habilidades y reglas básicas insertadas correctamente.';
END $$;
>>>>>>> pr-286
