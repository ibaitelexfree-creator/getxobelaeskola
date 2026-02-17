-- ==========================================
-- MASTER FIX FOR ACADEMY DASHBOARD
-- Run this in Supabase SQL Editor
-- ==========================================

-- 1. HARDENING PROFILES TABLE
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
    
    -- xp & total_xp
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'xp') THEN
        ALTER TABLE public.profiles ADD COLUMN xp INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'total_xp') THEN
        ALTER TABLE public.profiles ADD COLUMN total_xp INTEGER DEFAULT 0;
    END IF;
END $$;

-- 2. DAILY CHALLENGES TABLES
CREATE TABLE IF NOT EXISTS public.desafios_diarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pregunta_es TEXT NOT NULL,
    pregunta_eu TEXT NOT NULL,
    opciones JSONB NOT NULL, -- Array of strings: ["Opción 1", "Opción 2", ...]
    respuesta_correcta INTEGER NOT NULL, -- Index starting from 0
    explicacion_es TEXT,
    explicacion_eu TEXT,
    xp_recompensa INTEGER DEFAULT 20,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.intentos_desafios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    perfil_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    desafio_id UUID REFERENCES public.desafios_diarios(id) ON DELETE CASCADE,
    fecha DATE DEFAULT current_date,
    correcto BOOLEAN NOT NULL,
    creado_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(perfil_id, fecha)
);

-- 3. ENABLE RLS
ALTER TABLE public.desafios_diarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intentos_desafios ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view active challenges') THEN
        CREATE POLICY "Anyone can view active challenges" ON public.desafios_diarios FOR SELECT USING (activo = true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own attempts') THEN
        CREATE POLICY "Users can view their own attempts" ON public.intentos_desafios FOR SELECT USING (auth.uid() = perfil_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own attempts') THEN
        CREATE POLICY "Users can insert their own attempts" ON public.intentos_desafios FOR INSERT WITH CHECK (auth.uid() = perfil_id);
    END IF;
END $$;

-- 4. RPC FUNCTIONS

-- ADD XP
CREATE OR REPLACE FUNCTION public.add_xp(p_user_id UUID, p_amount INT)
RETURNS VOID AS $$
BEGIN
    UPDATE public.profiles
    SET xp = COALESCE(xp, 0) + p_amount,
        total_xp = COALESCE(total_xp, 0) + p_amount
    WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- REGISTRAR ACTIVIDAD
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
    SELECT last_activity_date, COALESCE(current_streak, 0)
    INTO v_last_activity, v_current_streak
    FROM public.profiles
    WHERE id = p_alumno_id;

    IF NOT FOUND THEN RETURN; END IF;

    IF v_last_activity IS NULL THEN
        v_current_streak := 1;
    ELSIF v_last_activity = (v_today - 1) THEN
        v_current_streak := v_current_streak + 1;
    ELSIF v_last_activity < (v_today - 1) THEN
        v_current_streak := 1;
    END IF;

    UPDATE public.profiles
    SET
        last_activity_date = v_today,
        current_streak = v_current_streak,
        updated_at = NOW()
    WHERE id = p_alumno_id;
END;
$$;

-- COMPLETAR DESAFÍO
CREATE OR REPLACE FUNCTION public.completar_desafio_diario(
    p_desafio_id UUID,
    p_respuesta INTEGER
)
RETURNS JSONB AS $$
DECLARE
    v_correcto BOOLEAN;
    v_xp INT;
    v_perfil_id UUID := auth.uid();
    v_already_done BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM public.intentos_desafios 
        WHERE perfil_id = v_perfil_id AND fecha = current_date
    ) INTO v_already_done;

    IF v_already_done THEN
        RETURN jsonb_build_object('success', false, 'error', 'Ya has completado el desafío de hoy');
    END IF;

    SELECT (respuesta_correcta = p_respuesta), xp_recompensa 
    INTO v_correcto, v_xp
    FROM public.desafios_diarios 
    WHERE id = p_desafio_id;

    INSERT INTO public.intentos_desafios (perfil_id, desafio_id, correcto)
    VALUES (v_perfil_id, p_desafio_id, v_correcto);

    IF v_correcto THEN
        PERFORM public.add_xp(v_perfil_id, v_xp);
        RETURN jsonb_build_object('success', true, 'correcto', true, 'xp_ganado', v_xp);
    ELSE
        RETURN jsonb_build_object('success', true, 'correcto', false, 'xp_ganado', 0);
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. INITIAL DATA
INSERT INTO public.desafios_diarios (pregunta_es, pregunta_eu, opciones, respuesta_correcta, explicacion_es, explicacion_eu)
SELECT '¿Qué es la Amura?', 'Zer da Amura?', '["La parte delantera del costado del buque", "La parte trasera del buque", "El cable que sujeta el palo", "Una vela pequeña"]'::jsonb, 0, 'La amura es la zona del costado del buque que se estrecha para formar la proa.', 'Amura ontziaren alboaren zati bat da, branka osatzeko estutzen dena.'
WHERE NOT EXISTS (SELECT 1 FROM public.desafios_diarios WHERE pregunta_es = '¿Qué es la Amura?');

INSERT INTO public.desafios_diarios (pregunta_es, pregunta_eu, opciones, respuesta_correcta, explicacion_es, explicacion_eu)
SELECT '¿Cómo se llama el lado derecho de la embarcación mirando a proa?', 'Nola deitzen da ontziaren eskuineko aldea brankara begiratzean?', '["Babor", "Estribor", "Popa", "Costado"]'::jsonb, 1, 'Estribor es el nombre que recibe el costado derecho de una embarcación.', 'Estribor ontzi baten eskuineko alboak jasotzen duen izena da.'
WHERE NOT EXISTS (SELECT 1 FROM public.desafios_diarios WHERE pregunta_es = '¿Cómo se llama el lado derecho de la embarcación mirando a proa?');
