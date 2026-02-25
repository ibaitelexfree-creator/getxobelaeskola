-- ==========================================
-- MIGRATION: ATOMIC COURSE REGISTRATION RPC
-- ==========================================

-- Function: registrar_curso_gratuito
-- Description: Atomic transaction to register a user for a free course, ensure profile exists,
--              create enrollment, and initialize progress.
-- Security: SECURITY DEFINER to bypass RLS for profile creation/updates if needed, though policies should handle it.
--           However, using SECURITY DEFINER ensures consistency regardless of current user permissions on other tables.

CREATE OR REPLACE FUNCTION public.registrar_curso_gratuito(
    p_curso_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_profile_exists BOOLEAN;
    v_inscripcion_id UUID;
    v_progreso_curso_id UUID;
    v_first_module_id UUID;
    v_first_unit_id UUID;
BEGIN
    -- 1. Get Authenticated User ID
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuario no autenticado';
    END IF;

    -- 2. Ensure Profile Exists
    SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = v_user_id) INTO v_profile_exists;
    IF NOT v_profile_exists THEN
        -- Insert basic profile if missing.
        -- Note: Triggers on auth.users usually handle this, but this is a safeguard.
        INSERT INTO public.profiles (id) VALUES (v_user_id);
    END IF;

    -- 3. Check or Create Enrollment (Inscripción)
    SELECT id INTO v_inscripcion_id FROM public.inscripciones
    WHERE perfil_id = v_user_id AND curso_id = p_curso_id;

    IF v_inscripcion_id IS NULL THEN
        INSERT INTO public.inscripciones (perfil_id, curso_id, estado_pago, monto_total)
        VALUES (v_user_id, p_curso_id, 'pagado', 0)
        RETURNING id INTO v_inscripcion_id;
    END IF;

    -- 4. Initialize Progress (Course Level)
    INSERT INTO public.progreso_alumno (alumno_id, tipo_entidad, entidad_id, estado, porcentaje)
    VALUES (v_user_id, 'curso', p_curso_id, 'en_progreso', 0)
    ON CONFLICT (alumno_id, tipo_entidad, entidad_id) DO NOTHING;

    -- 5. Find First Module
    SELECT id INTO v_first_module_id
    FROM public.modulos
    WHERE curso_id = p_curso_id
    ORDER BY orden ASC
    LIMIT 1;

    IF v_first_module_id IS NOT NULL THEN
        -- Initialize Progress (Module Level)
        INSERT INTO public.progreso_alumno (alumno_id, tipo_entidad, entidad_id, estado, porcentaje)
        VALUES (v_user_id, 'modulo', v_first_module_id, 'en_progreso', 0)
        ON CONFLICT (alumno_id, tipo_entidad, entidad_id) DO NOTHING;

        -- 6. Find First Unit
        SELECT id INTO v_first_unit_id
        FROM public.unidades_didacticas
        WHERE modulo_id = v_first_module_id
        ORDER BY orden ASC
        LIMIT 1;

        IF v_first_unit_id IS NOT NULL THEN
            -- Initialize Progress (Unit Level)
            INSERT INTO public.progreso_alumno (alumno_id, tipo_entidad, entidad_id, estado, porcentaje)
            VALUES (v_user_id, 'unidad', v_first_unit_id, 'en_progreso', 0)
            ON CONFLICT (alumno_id, tipo_entidad, entidad_id) DO NOTHING;
        END IF;
    END IF;

    -- Return Success
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Inscripción realizada con éxito',
        'inscripcion_id', v_inscripcion_id
    );

EXCEPTION
    WHEN OTHERS THEN
        -- Return Error
        RETURN jsonb_build_object(
            'success', false,
            'message', SQLERRM
        );
END;
$$;
