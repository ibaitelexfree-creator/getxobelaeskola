-- Migration: Interactive Missions System
-- Description: Adds support for multi-step, branching missions with state persistence.

-- 1. Create missions table
CREATE TABLE IF NOT EXISTS public.missions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    slug TEXT UNIQUE NOT NULL,
    initial_step_id UUID, -- Logical reference to mission_steps(id)
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create mission_steps table
CREATE TABLE IF NOT EXISTS public.mission_steps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    mission_id UUID REFERENCES public.missions(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('info', 'question', 'video', 'challenge', 'summary')),
    content JSONB DEFAULT '{}'::jsonb, -- Title, Body, Media URL
    options JSONB DEFAULT '[]'::jsonb, -- Array of branch options
    position INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add explicit FK for initial_step_id now that mission_steps exists
ALTER TABLE public.missions
ADD CONSTRAINT fk_initial_step
FOREIGN KEY (initial_step_id) REFERENCES public.mission_steps(id)
ON DELETE SET NULL;

-- 3. Create mission_progress table
CREATE TABLE IF NOT EXISTS public.mission_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    mission_id UUID REFERENCES public.missions(id) ON DELETE CASCADE,
    current_step_id UUID REFERENCES public.mission_steps(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'started' CHECK (status IN ('started', 'completed', 'failed')),
    score INTEGER DEFAULT 0,
    history JSONB DEFAULT '[]'::jsonb, -- Log of steps taken
    started_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, mission_id)
);

-- 4. Enable RLS
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_progress ENABLE ROW LEVEL SECURITY;

-- 5. Create Policies

-- Missions: Public Read
CREATE POLICY "missions_read_all" ON public.missions
FOR SELECT USING (true);

-- Mission Steps: Public Read
CREATE POLICY "mission_steps_read_all" ON public.mission_steps
FOR SELECT USING (true);

-- Mission Progress: User can read/write own progress
CREATE POLICY "mission_progress_own_read" ON public.mission_progress
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "mission_progress_own_insert" ON public.mission_progress
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "mission_progress_own_update" ON public.mission_progress
FOR UPDATE USING (auth.uid() = user_id);

-- 6. Seed Data: Sample Mission "Rescate en Alta Mar"
DO $$
DECLARE
    v_mission_id UUID;
    v_step1_id UUID;
    v_step2_id UUID;
    v_step3_success_id UUID;
    v_step3_fail_id UUID;
BEGIN
    -- Create Mission
    INSERT INTO public.missions (title, description, slug, settings)
    VALUES (
        'Misión: Rescate en Alta Mar',
        'Una simulación interactiva donde debes responder a una llamada de socorro y tomar decisiones críticas.',
        'rescate-alta-mar',
        '{"allow_retry": true, "show_feedback": true}'::jsonb
    ) RETURNING id INTO v_mission_id;

    -- Create Steps

    -- Step 1: Introduction (Info)
    INSERT INTO public.mission_steps (mission_id, type, content, position)
    VALUES (
        v_mission_id,
        'info',
        '{"title": "Llamada de Socorro", "body": "Recibes un mensaje Mayday en el canal 16. Una embarcación reporta fuego a bordo a 3 millas de tu posición."}'::jsonb,
        1
    ) RETURNING id INTO v_step1_id;

    -- Step 2: Decision (Question)
    INSERT INTO public.mission_steps (mission_id, type, content, position)
    VALUES (
        v_mission_id,
        'question',
        '{"title": "Análisis de Situación", "body": "¿Cuál es tu primera acción al recibir el Mayday?"}'::jsonb,
        2
    ) RETURNING id INTO v_step2_id;

    -- Step 3 Success: Action (Info/End)
    INSERT INTO public.mission_steps (mission_id, type, content, position)
    VALUES (
        v_mission_id,
        'summary',
        '{"title": "¡Bien hecho!", "body": "Has procedido correctamente. El fuego fue controlado y la tripulación está a salvo."}'::jsonb,
        3
    ) RETURNING id INTO v_step3_success_id;

    -- Step 3 Fail: Wrong Action (Info/End)
    INSERT INTO public.mission_steps (mission_id, type, content, position)
    VALUES (
        v_mission_id,
        'summary',
        '{"title": "Error Crítico", "body": "Al no anotar la posición, perdiste tiempo valioso. La embarcación sufrió daños graves."}'::jsonb,
        3
    ) RETURNING id INTO v_step3_fail_id;

    -- Update Step 1 to point to Step 2
    UPDATE public.mission_steps
    SET options = jsonb_build_array(
        jsonb_build_object(
            'label', 'Entendido, proceder',
            'next_step_id', v_step2_id,
            'score_delta', 0
        )
    )
    WHERE id = v_step1_id;

    -- Update Step 2 with Branching
    UPDATE public.mission_steps
    SET options = jsonb_build_array(
        jsonb_build_object(
            'label', 'Anotar posición y confirmar recepción (Silence Mayday)',
            'next_step_id', v_step3_success_id,
            'score_delta', 10,
            'feedback', 'Correcto. Priorizar la información y el silencio radio es clave.'
        ),
        jsonb_build_object(
            'label', 'Salir inmediatamente hacia la zona visual',
            'next_step_id', v_step3_fail_id,
            'score_delta', -5,
            'feedback', 'Incorrecto. Sin confirmar posición ni detalles, es peligroso navegar a ciegas.'
        )
    )
    WHERE id = v_step2_id;

    -- Set Initial Step
    UPDATE public.missions
    SET initial_step_id = v_step1_id
    WHERE id = v_mission_id;

END $$;
