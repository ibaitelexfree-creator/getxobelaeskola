-- Migration for Peer Review System (Consolidated)

-- 1. Update 'actividades' table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'actividades' AND column_name = 'rubrica') THEN
        ALTER TABLE public.actividades ADD COLUMN rubrica JSONB;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'actividades' AND column_name = 'requiere_revision') THEN
        ALTER TABLE public.actividades ADD COLUMN requiere_revision BOOLEAN DEFAULT false;
    END IF;
END $$;

-- 2. Create 'intentos_actividad' table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.intentos_actividad (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alumno_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    actividad_id UUID NOT NULL REFERENCES public.actividades(id) ON DELETE CASCADE,
    puntuacion NUMERIC, -- Nullable initially
    puntuacion_maxima INT DEFAULT 100,
    porcentaje DECIMAL(5, 2),
    tiempo_empleado_seg INT,
    datos_json JSONB,
    completado BOOLEAN DEFAULT FALSE,
    estado_revision TEXT DEFAULT 'pendiente' CHECK (estado_revision IN ('pendiente', 'asignado', 'revisado', 'aprobado', 'rechazado')),
    feedback_publico TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- If table existed but columns missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'intentos_actividad' AND column_name = 'estado_revision') THEN
        ALTER TABLE public.intentos_actividad ADD COLUMN estado_revision TEXT DEFAULT 'pendiente' CHECK (estado_revision IN ('pendiente', 'asignado', 'revisado', 'aprobado', 'rechazado'));
    END IF;
END $$;

-- 3. Create 'peer_reviews' table
CREATE TABLE IF NOT EXISTS public.peer_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intento_id UUID NOT NULL REFERENCES public.intentos_actividad(id) ON DELETE CASCADE,
    revisor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    puntuacion NUMERIC NOT NULL,
    rubrica_valores JSONB,
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(intento_id, revisor_id)
);

-- 4. Enable RLS
ALTER TABLE public.intentos_actividad ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peer_reviews ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies

-- intentos_actividad policies
DO $$
BEGIN
    -- SELECT
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own attempts' AND tablename = 'intentos_actividad') THEN
        CREATE POLICY "Users can view their own attempts" ON public.intentos_actividad FOR SELECT USING (auth.uid() = alumno_id);
    END IF;

    -- INSERT
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own attempts' AND tablename = 'intentos_actividad') THEN
        CREATE POLICY "Users can insert their own attempts" ON public.intentos_actividad FOR INSERT WITH CHECK (auth.uid() = alumno_id);
    END IF;

    -- UPDATE (Crucial for resubmission or auto-save)
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own attempts' AND tablename = 'intentos_actividad') THEN
        CREATE POLICY "Users can update their own attempts" ON public.intentos_actividad FOR UPDATE USING (auth.uid() = alumno_id);
    END IF;
END $$;

-- peer_reviews policies
DO $$
BEGIN
    -- SELECT
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view reviews on their own attempts' AND tablename = 'peer_reviews') THEN
        CREATE POLICY "Users can view reviews on their own attempts" ON public.peer_reviews FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM public.intentos_actividad
                WHERE id = peer_reviews.intento_id
                AND alumno_id = auth.uid()
            )
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Reviewers can view their own reviews' AND tablename = 'peer_reviews') THEN
        CREATE POLICY "Reviewers can view their own reviews" ON public.peer_reviews FOR SELECT USING (auth.uid() = revisor_id);
    END IF;

    -- INSERT (Usually handled via admin client in server action for integrity, but good to have if we switch to client-side)
    -- We restrict this so only the revisor can insert, but ideally this should be controlled by the backend logic to ensure 'module completed' check.
    -- So we might NOT want to expose INSERT to public RLS unless we can enforce the 'module completed' rule here.
    -- For now, we rely on the Server Action which uses Admin Client.
END $$;
