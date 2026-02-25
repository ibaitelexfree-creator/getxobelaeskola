-- Study Planner System

-- 1. Study Goals (Objetivos de estudio)
CREATE TABLE IF NOT EXISTS public.study_goals (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    weekly_goal_minutes INT DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Study Sessions (Sesiones de estudio)
CREATE TABLE IF NOT EXISTS public.study_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Security Policies (RLS)
ALTER TABLE public.study_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

-- Policies for study_goals
CREATE POLICY "Users can view their own study goals"
    ON public.study_goals FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own study goals"
    ON public.study_goals FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own study goals"
    ON public.study_goals FOR UPDATE
    USING (auth.uid() = user_id);

-- Policies for study_sessions
CREATE POLICY "Users can view their own study sessions"
    ON public.study_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own study sessions"
    ON public.study_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own study sessions"
    ON public.study_sessions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own study sessions"
    ON public.study_sessions FOR DELETE
    USING (auth.uid() = user_id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Check if trigger exists before creating
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_study_goals_updated') THEN
        CREATE TRIGGER on_study_goals_updated
            BEFORE UPDATE ON public.study_goals
            FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_study_sessions_updated') THEN
        CREATE TRIGGER on_study_sessions_updated
            BEFORE UPDATE ON public.study_sessions
            FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
    END IF;
END $$;
