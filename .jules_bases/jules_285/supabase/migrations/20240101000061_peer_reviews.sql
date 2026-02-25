-- Migration: Peer Review System

-- 1. Modify 'actividades' table
-- Add columns for rubric and review requirement
ALTER TABLE public.actividades
ADD COLUMN IF NOT EXISTS rubrica JSONB,
ADD COLUMN IF NOT EXISTS requiere_revision BOOLEAN DEFAULT FALSE;

-- Update type constraint (drop and recreate)
ALTER TABLE public.actividades DROP CONSTRAINT IF EXISTS actividades_tipo_check;
ALTER TABLE public.actividades ADD CONSTRAINT actividades_tipo_check
CHECK (tipo IN ('decision_tactica', 'simulacion_maniobra', 'identificacion_visual', 'escenario_emergencia', 'meteorologia', 'nudos', 'regata', 'ejercicio_escrito'));

-- 2. Modify 'intentos_actividad' table
-- Add status for review and public feedback
ALTER TABLE public.intentos_actividad
ADD COLUMN IF NOT EXISTS estado_revision TEXT CHECK (estado_revision IN ('pendiente', 'asignado', 'revisado')) DEFAULT 'pendiente',
ADD COLUMN IF NOT EXISTS feedback_publico TEXT;

-- 3. Create 'peer_reviews' table
CREATE TABLE IF NOT EXISTS public.peer_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intento_id UUID NOT NULL REFERENCES public.intentos_actividad(id) ON DELETE CASCADE,
    revisor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
    puntuacion INT CHECK (puntuacion BETWEEN 0 AND 100),
    rubrica_valores JSONB, -- Stores the scores per criteria
    feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(intento_id, revisor_id) -- Only one review per student per attempt (initially)
);

-- 4. Enable RLS
ALTER TABLE public.peer_reviews ENABLE ROW LEVEL SECURITY;

-- 5. Policies
-- Reviewers can insert reviews
CREATE POLICY "Reviewers can create reviews" ON public.peer_reviews
    FOR INSERT WITH CHECK (auth.uid() = revisor_id);

-- Reviewers can see their own reviews
CREATE POLICY "Reviewers can see own reviews" ON public.peer_reviews
    FOR SELECT USING (auth.uid() = revisor_id);

-- Students (authors) can see reviews of their work
CREATE POLICY "Authors can see reviews of their work" ON public.peer_reviews
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.intentos_actividad ia
            WHERE ia.id = peer_reviews.intento_id
            AND ia.alumno_id = auth.uid()
        )
    );

-- 6. Trigger for updated_at
CREATE TRIGGER update_peer_reviews_updated_at BEFORE UPDATE ON public.peer_reviews
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
