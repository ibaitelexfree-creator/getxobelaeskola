-- Create Weekly Challenge Templates Table
CREATE TABLE IF NOT EXISTS public.weekly_challenge_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('lesson_count', 'quiz_score', 'logbook_entry')),
    target_count INTEGER DEFAULT 1,
    target_score INTEGER, -- Only for quiz_score
    description_es TEXT NOT NULL,
    description_eu TEXT NOT NULL,
    xp_reward INTEGER DEFAULT 50,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Weekly Challenges Table (The active instance for a week)
CREATE TABLE IF NOT EXISTS public.weekly_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES public.weekly_challenge_templates(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(start_date, end_date) -- Only one challenge per week
);

-- Create User Weekly Challenge Progress Table
CREATE TABLE IF NOT EXISTS public.user_weekly_challenge_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    challenge_id UUID REFERENCES public.weekly_challenges(id) ON DELETE CASCADE,
    current_value INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    reward_claimed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, challenge_id)
);

-- RLS Policies
ALTER TABLE public.weekly_challenge_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_weekly_challenge_progress ENABLE ROW LEVEL SECURITY;

-- Everyone can view templates and active challenges
CREATE POLICY "Public view templates" ON public.weekly_challenge_templates FOR SELECT USING (true);
CREATE POLICY "Public view challenges" ON public.weekly_challenges FOR SELECT USING (true);

-- Users can view their own progress
CREATE POLICY "User view own progress" ON public.user_weekly_challenge_progress FOR SELECT USING (auth.uid() = user_id);
-- Users can insert their own progress (managed by triggers but needed for initial check)
CREATE POLICY "User insert own progress" ON public.user_weekly_challenge_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Seed Data
INSERT INTO public.weekly_challenge_templates (type, target_count, description_es, description_eu, xp_reward) VALUES
('lesson_count', 3, 'Completa 3 lecciones esta semana', 'Osatu 3 ikasgai aste honetan', 50),
('logbook_entry', 2, 'Registra 2 salidas en tu bitácora', 'Erregistratu 2 irteera zure bitakoran', 50);

INSERT INTO public.weekly_challenge_templates (type, target_score, description_es, description_eu, xp_reward, metadata) VALUES
('quiz_score', 90, 'Obtén más del 90% en un quiz', 'Lortu %90 baino gehiago galdetegi batean', 100, '{"min_score": 90}'::jsonb);


-- Function to Get or Create Current Weekly Challenge
CREATE OR REPLACE FUNCTION public.get_or_create_weekly_challenge()
RETURNS JSONB AS $$
DECLARE
    v_start_date DATE;
    v_end_date DATE;
    v_challenge_id UUID;
    v_template_id UUID;
    v_result JSONB;
BEGIN
    -- Calculate start of current week (Monday)
    v_start_date := date_trunc('week', current_date)::date;
    v_end_date := v_start_date + 6;

    -- Check if challenge exists
    SELECT id INTO v_challenge_id
    FROM public.weekly_challenges
    WHERE start_date = v_start_date;

    -- If not, create one
    IF v_challenge_id IS NULL THEN
        -- Select random template
        SELECT id INTO v_template_id
        FROM public.weekly_challenge_templates
        ORDER BY random()
        LIMIT 1;

        IF v_template_id IS NOT NULL THEN
            INSERT INTO public.weekly_challenges (template_id, start_date, end_date)
            VALUES (v_template_id, v_start_date, v_end_date)
            RETURNING id INTO v_challenge_id;
        END IF;
    END IF;

    -- Return the challenge with template details
    SELECT jsonb_build_object(
        'id', c.id,
        'start_date', c.start_date,
        'end_date', c.end_date,
        'template', jsonb_build_object(
            'type', t.type,
            'target_count', t.target_count,
            'target_score', t.target_score,
            'description_es', t.description_es,
            'description_eu', t.description_eu,
            'xp_reward', t.xp_reward
        )
    ) INTO v_result
    FROM public.weekly_challenges c
    JOIN public.weekly_challenge_templates t ON c.template_id = t.id
    WHERE c.id = v_challenge_id;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Function to Update Progress (SECURITY DEFINER with checks)
CREATE OR REPLACE FUNCTION public.process_weekly_challenge_progress(
    p_user_id UUID,
    p_type TEXT,
    p_increment INTEGER DEFAULT 1,
    p_score INTEGER DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    v_challenge_id UUID;
    v_template_type TEXT;
    v_target_count INTEGER;
    v_target_score INTEGER;
    v_xp_reward INTEGER;
    v_progress_id UUID;
    v_current_value INTEGER;
    v_is_completed BOOLEAN;
    v_new_value INTEGER;
    v_completed BOOLEAN := FALSE;
    v_target INTEGER;
BEGIN
    -- Security Check: Ensure caller is authorized or is system
    -- Allow if auth.uid() is null (system) or matches p_user_id
    IF (auth.uid() IS NOT NULL AND auth.uid() != p_user_id) THEN
        -- Log warning but don't fail transaction, just exit
        RAISE WARNING 'Unauthorized attempt to update weekly progress for user % by user %', p_user_id, auth.uid();
        RETURN;
    END IF;

    -- Get current active challenge
    SELECT c.id, t.type, t.target_count, t.target_score, t.xp_reward
    INTO v_challenge_id, v_template_type, v_target_count, v_target_score, v_xp_reward
    FROM public.weekly_challenges c
    JOIN public.weekly_challenge_templates t ON c.template_id = t.id
    WHERE c.start_date <= current_date AND c.end_date >= current_date
    AND t.type = p_type;

    IF v_challenge_id IS NULL THEN
        RETURN; -- No active challenge of this type
    END IF;

    -- Check specific conditions
    IF p_type = 'quiz_score' THEN
        IF p_score < v_target_score THEN
            RETURN; -- Score too low, doesn't count
        END IF;
        -- For quiz score, we might count *number of passed quizzes* or just *one passed quiz*
        v_target := COALESCE(v_target_count, 1);
    ELSE
        v_target := v_target_count;
    END IF;

    -- Get or create progress record
    SELECT id, current_value, completed INTO v_progress_id, v_current_value, v_is_completed
    FROM public.user_weekly_challenge_progress
    WHERE user_id = p_user_id AND challenge_id = v_challenge_id;

    IF v_progress_id IS NULL THEN
        INSERT INTO public.user_weekly_challenge_progress (user_id, challenge_id, current_value)
        VALUES (p_user_id, v_challenge_id, 0)
        RETURNING id, current_value, completed INTO v_progress_id, v_current_value, v_is_completed;
    END IF;

    IF v_is_completed THEN
        RETURN; -- Already completed
    END IF;

    -- Update value
    v_new_value := v_current_value + p_increment;

    -- Check completion
    IF v_new_value >= v_target THEN
        v_completed := TRUE;

        -- Award XP (Safely)
        BEGIN
            PERFORM public.add_xp(p_user_id, v_xp_reward);
        EXCEPTION WHEN OTHERS THEN
            -- Log error or ignore if function missing, but don't fail transaction
            RAISE WARNING 'Could not award XP: %', SQLERRM;
        END;
    END IF;

    -- Update record
    UPDATE public.user_weekly_challenge_progress
    SET current_value = v_new_value,
        completed = v_completed,
        completed_at = CASE WHEN v_completed THEN NOW() ELSE NULL END,
        updated_at = NOW()
    WHERE id = v_progress_id;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Revoke execute from public to prevent RPC abuse (triggers run as owner usually)
REVOKE EXECUTE ON FUNCTION public.process_weekly_challenge_progress(UUID, TEXT, INTEGER, INTEGER) FROM PUBLIC;


-- Trigger 1: Lessons (progreso_alumno)
CREATE OR REPLACE FUNCTION public.trigger_weekly_progress_lessons()
RETURNS TRIGGER AS $$
BEGIN
    -- If lesson completed (tipo_entidad='unidad' AND estado='completado')
    IF NEW.tipo_entidad = 'unidad' AND NEW.estado = 'completado' THEN
        -- Only if it wasn't completed before (handle INSERT and UPDATE)
        IF (TG_OP = 'INSERT') OR (TG_OP = 'UPDATE' AND OLD.estado IS DISTINCT FROM 'completado') THEN
             PERFORM public.process_weekly_challenge_progress(NEW.alumno_id, 'lesson_count', 1, NULL);
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_weekly_progress_lessons ON public.progreso_alumno;
CREATE TRIGGER tr_weekly_progress_lessons
AFTER INSERT OR UPDATE ON public.progreso_alumno
FOR EACH ROW EXECUTE FUNCTION public.trigger_weekly_progress_lessons();


-- Trigger 2: Quizzes (intentos_evaluacion)
CREATE OR REPLACE FUNCTION public.trigger_weekly_progress_quiz()
RETURNS TRIGGER AS $$
BEGIN
    -- If quiz completed with score
    IF NEW.estado = 'completado' AND NEW.puntuacion IS NOT NULL THEN
        -- Only if it wasn't completed before or score changed (handle INSERT and UPDATE)
        IF (TG_OP = 'INSERT') OR (TG_OP = 'UPDATE' AND OLD.estado IS DISTINCT FROM 'completado') THEN
             PERFORM public.process_weekly_challenge_progress(NEW.alumno_id, 'quiz_score', 1, NEW.puntuacion::INTEGER);
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_weekly_progress_quiz ON public.intentos_evaluacion;
CREATE TRIGGER tr_weekly_progress_quiz
AFTER INSERT OR UPDATE ON public.intentos_evaluacion
FOR EACH ROW EXECUTE FUNCTION public.trigger_weekly_progress_quiz();


-- Trigger 3: Logbook (bitacora_personal)
CREATE OR REPLACE FUNCTION public.trigger_weekly_progress_logbook()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM public.process_weekly_challenge_progress(NEW.alumno_id, 'logbook_entry', 1, NULL);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_weekly_progress_logbook ON public.bitacora_personal;
CREATE TRIGGER tr_weekly_progress_logbook
AFTER INSERT ON public.bitacora_personal
FOR EACH ROW EXECUTE FUNCTION public.trigger_weekly_progress_logbook();
