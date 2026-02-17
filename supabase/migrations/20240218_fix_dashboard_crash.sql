-- Safe migration to fix dashboard crash

-- 1. Ensure columns exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'current_streak') THEN
        ALTER TABLE public.profiles ADD COLUMN current_streak INTEGER DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'last_activity_date') THEN
        ALTER TABLE public.profiles ADD COLUMN last_activity_date DATE;
    END IF;
END $$;

-- 2. Create RPC function
CREATE OR REPLACE FUNCTION public.registrar_actividad_alumno(p_alumno_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_last_activity DATE;
    v_current_streak INTEGER;
    v_today DATE := CURRENT_DATE;
BEGIN
    -- Get current profile data
    SELECT last_activity_date, COALESCE(current_streak, 0)
    INTO v_last_activity, v_current_streak
    FROM public.profiles
    WHERE id = p_alumno_id;

    -- If no profile found, we might want to create one? 
    -- Assuming profile exists for logged in user. If not, just exit.
    IF NOT FOUND THEN
        RETURN;
    END IF;

    -- Update streak logic
    IF v_last_activity IS NULL THEN
        -- First activity ever
        v_current_streak := 1;
    ELSIF v_last_activity = (v_today - 1) THEN
        -- Activity was yesterday, streak continues!
        v_current_streak := v_current_streak + 1;
    ELSIF v_last_activity < (v_today - 1) THEN
        -- Missed a day (or more), reset streak
        v_current_streak := 1;
    ELSE
        -- Same day (v_last_activity = v_today), do nothing (keep streak)
        -- Or future date (should not happen), keep streak
    END IF;

    -- Update profile
    UPDATE public.profiles
    SET 
        last_activity_date = v_today,
        current_streak = v_current_streak,
        updated_at = NOW()
    WHERE id = p_alumno_id;
END;
$$;
