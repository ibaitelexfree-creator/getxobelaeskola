-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info',
    data JSONB,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create evaluacion_feedback table
CREATE TABLE IF NOT EXISTS public.evaluacion_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intento_id UUID NOT NULL REFERENCES public.intentos_evaluacion(id) ON DELETE CASCADE,
    pregunta_id UUID REFERENCES public.preguntas(id) ON DELETE SET NULL,
    feedback_text TEXT,
    feedback_audio_url TEXT,
    instructor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_devices table
CREATE TABLE IF NOT EXISTS public.user_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    platform TEXT, -- 'ios', 'android', 'web'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, token)
);

-- Add columns to horas_navegacion
ALTER TABLE public.horas_navegacion
ADD COLUMN IF NOT EXISTS feedback_text TEXT,
ADD COLUMN IF NOT EXISTS feedback_audio_url TEXT;

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluacion_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_devices ENABLE ROW LEVEL SECURITY;

-- Policies for notifications
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users can view their own notifications') THEN
        CREATE POLICY "Users can view their own notifications" ON public.notifications
            FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users can update their own notifications') THEN
        CREATE POLICY "Users can update their own notifications" ON public.notifications
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Instructors can insert notifications') THEN
        CREATE POLICY "Instructors can insert notifications" ON public.notifications
            FOR INSERT WITH CHECK (
                EXISTS (
                    SELECT 1 FROM public.profiles
                    WHERE id = auth.uid() AND rol IN ('instructor', 'admin')
                )
            );
    END IF;
END $$;

-- Policies for evaluacion_feedback
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'evaluacion_feedback' AND policyname = 'Users can view feedback for their attempts') THEN
        CREATE POLICY "Users can view feedback for their attempts" ON public.evaluacion_feedback
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM public.intentos_evaluacion
                    WHERE id = evaluacion_feedback.intento_id AND alumno_id = auth.uid()
                )
            );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'evaluacion_feedback' AND policyname = 'Instructors can insert feedback') THEN
        CREATE POLICY "Instructors can insert feedback" ON public.evaluacion_feedback
            FOR INSERT WITH CHECK (
                EXISTS (
                    SELECT 1 FROM public.profiles
                    WHERE id = auth.uid() AND rol IN ('instructor', 'admin')
                )
            );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'evaluacion_feedback' AND policyname = 'Instructors can view all feedback') THEN
        CREATE POLICY "Instructors can view all feedback" ON public.evaluacion_feedback
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM public.profiles
                    WHERE id = auth.uid() AND rol IN ('instructor', 'admin')
                )
            );
    END IF;
END $$;

-- Policies for user_devices
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_devices' AND policyname = 'Users can manage their own devices') THEN
        CREATE POLICY "Users can manage their own devices" ON public.user_devices
            FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

-- Policies for horas_navegacion
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'horas_navegacion' AND policyname = 'Instructors can update feedback in logbook') THEN
        CREATE POLICY "Instructors can update feedback in logbook" ON public.horas_navegacion
            FOR UPDATE USING (
                EXISTS (
                    SELECT 1 FROM public.profiles
                    WHERE id = auth.uid() AND rol IN ('instructor', 'admin')
                )
            );
    END IF;
END $$;

-- Grant permissions
GRANT ALL ON public.notifications TO authenticated;
GRANT ALL ON public.evaluacion_feedback TO authenticated;
GRANT ALL ON public.user_devices TO authenticated;
