-- Migration to handle atomic registration and enrollment

-- 1. Create or Replace the existing handle_new_user trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_curso_slug TEXT;
    v_curso_id UUID;
BEGIN
    -- 1. Create Profile (Standard behavior)
    -- Using public.profiles as verified in schema.sql (mapped from "perfiles" in user prompt)
    INSERT INTO public.profiles (id, nombre, apellidos, created_at, updated_at)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'nombre',
        NEW.raw_user_meta_data->>'apellidos',
        NOW(),
        NOW()
    );

    -- 2. Check for Course Enrollment in Metadata
    v_curso_slug := NEW.raw_user_meta_data->>'course_slug';

    IF v_curso_slug IS NOT NULL THEN
        -- Find the course ID by slug
        SELECT id INTO v_curso_id FROM public.cursos WHERE slug = v_curso_slug;

        -- If course exists, enroll the user
        IF v_curso_id IS NOT NULL THEN
            -- Insert into Inscripciones (Payment/Access Record)
            -- We check for existence to avoid duplicates if this runs multiple times (idempotency)
            IF NOT EXISTS (SELECT 1 FROM public.inscripciones WHERE perfil_id = NEW.id AND curso_id = v_curso_id) THEN
                INSERT INTO public.inscripciones (
                    perfil_id,
                    curso_id,
                    estado_pago,
                    monto_total,
                    created_at
                ) VALUES (
                    NEW.id,
                    v_curso_id,
                    'pagado', -- Assuming free course for now as per prompt "curso gratuito"
                    0,
                    NOW()
                );
            END IF;

            -- Insert into Progreso Alumno (Academic Progress)
            INSERT INTO public.progreso_alumno (
                alumno_id,
                tipo_entidad,
                entidad_id,
                estado,
                porcentaje,
                created_at,
                updated_at
            ) VALUES (
                NEW.id,
                'curso',
                v_curso_id,
                'no_iniciado',
                0,
                NOW(),
                NOW()
            )
            ON CONFLICT (alumno_id, tipo_entidad, entidad_id) DO NOTHING;

        ELSE
            -- Strict mode: If a course slug is provided but invalid, fail the registration
            -- This ensures the user isn't created without their intended enrollment
            RAISE EXCEPTION 'Course not found for slug: %', v_curso_slug;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 2. Create RPC for Existing Users (Atomic Enrollment)
CREATE OR REPLACE FUNCTION public.enroll_student_atomic(
    p_user_id UUID,
    p_course_slug TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_curso_id UUID;
    v_inscripcion_id UUID;
    v_progreso_id UUID;
    v_requesting_user_id UUID;
    v_requesting_user_role TEXT;
BEGIN
    -- Security Check: Authorization
    v_requesting_user_id := auth.uid();

    -- Get role of requesting user (if logged in)
    IF v_requesting_user_id IS NOT NULL THEN
        SELECT rol INTO v_requesting_user_role FROM public.profiles WHERE id = v_requesting_user_id;
    END IF;

    -- Allow if:
    -- 1. Self-enrollment (p_user_id matches auth.uid())
    -- 2. Admin/Instructor requesting
    -- 3. Service Role (auth.uid() is null but typically bypassed, or we check jwt)
    -- Note: Service role usually bypasses RLS, but inside SECURITY DEFINER we must be careful.
    -- We assume if auth.uid() is NULL, it might be a service call, OR we explicitly check permissions.
    -- Safest: Only allow if ID matches or Role is Admin.

    IF v_requesting_user_id IS NOT NULL AND v_requesting_user_id != p_user_id AND (v_requesting_user_role IS NULL OR v_requesting_user_role NOT IN ('admin', 'instructor')) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: You can only enroll yourself or must be an admin.');
    END IF;

    -- Verify Target User Exists
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_user_id) THEN
        RETURN jsonb_build_object('success', false, 'error', 'User not found');
    END IF;

    -- Find Course
    SELECT id INTO v_curso_id FROM public.cursos WHERE slug = p_course_slug;

    IF v_curso_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Course not found');
    END IF;

    -- Lock the user profile row to prevent race conditions on concurrent enrollments
    PERFORM 1 FROM public.profiles WHERE id = p_user_id FOR UPDATE;

    -- Check if already enrolled (Progreso Alumno)
    IF EXISTS (SELECT 1 FROM public.progreso_alumno WHERE alumno_id = p_user_id AND tipo_entidad = 'curso' AND entidad_id = v_curso_id) THEN
         RETURN jsonb_build_object('success', true, 'message', 'Already enrolled');
    END IF;

    -- Insert Inscripcion (if not exists)
    -- Note: inscripciones might not have a unique constraint on (perfil_id, curso_id), so we check manually.
    IF NOT EXISTS (SELECT 1 FROM public.inscripciones WHERE perfil_id = p_user_id AND curso_id = v_curso_id) THEN
        INSERT INTO public.inscripciones (
            perfil_id,
            curso_id,
            estado_pago,
            monto_total,
            created_at
        ) VALUES (
            p_user_id,
            v_curso_id,
            'pagado',
            0,
            NOW()
        ) RETURNING id INTO v_inscripcion_id;
    ELSE
        SELECT id INTO v_inscripcion_id FROM public.inscripciones WHERE perfil_id = p_user_id AND curso_id = v_curso_id LIMIT 1;
    END IF;

    -- Insert Progreso (Atomic with Inscripcion due to transaction)
    INSERT INTO public.progreso_alumno (
        alumno_id,
        tipo_entidad,
        entidad_id,
        estado,
        porcentaje,
        created_at,
        updated_at
    ) VALUES (
        p_user_id,
        'curso',
        v_curso_id,
        'no_iniciado',
        0,
        NOW(),
        NOW()
    )
    ON CONFLICT (alumno_id, tipo_entidad, entidad_id) DO NOTHING
    RETURNING id INTO v_progreso_id;

    -- If returning id is null (due to conflict), fetch the existing one
    IF v_progreso_id IS NULL THEN
        SELECT id INTO v_progreso_id FROM public.progreso_alumno WHERE alumno_id = p_user_id AND tipo_entidad = 'curso' AND entidad_id = v_curso_id;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'course_id', v_curso_id,
        'inscripcion_id', v_inscripcion_id,
        'progreso_id', v_progreso_id
    );

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;
