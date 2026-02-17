-- 1. Hardening profiles table with common missing columns
DO $$
BEGIN
    -- current_streak
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'current_streak') THEN
        ALTER TABLE public.profiles ADD COLUMN current_streak INTEGER DEFAULT 0;
    END IF;

    -- last_activity_date
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'last_activity_date') THEN
        ALTER TABLE public.profiles ADD COLUMN last_activity_date DATE;
    END IF;

    -- updated_at
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'updated_at') THEN
        ALTER TABLE public.profiles ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;

    -- avatar_url
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'avatar_url') THEN
        ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT;
    END IF;
END $$;

-- 2. Fixed RPC function (now safe with updated_at)
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

    -- If no profile found, exit
    IF NOT FOUND THEN
        RETURN;
    END IF;

    -- Update streak logic
    IF v_last_activity IS NULL THEN
        v_current_streak := 1;
    ELSIF v_last_activity = (v_today - 1) THEN
        v_current_streak := v_current_streak + 1;
    ELSIF v_last_activity < (v_today - 1) THEN
        v_current_streak := 1;
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
