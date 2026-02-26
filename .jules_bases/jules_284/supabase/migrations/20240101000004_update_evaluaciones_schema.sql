
-- Update evaluaciones table to support Phase 2 Quizzes

-- 1. Evaluaciones Table
CREATE TABLE IF NOT EXISTS public.evaluaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo TEXT NOT NULL, -- 'quiz_unidad', 'examen_final', etc.
    entidad_tipo TEXT, -- 'unidad', 'curso'
    entidad_id UUID,
    titulo_es TEXT,
    titulo_eu TEXT,
    num_preguntas INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add Phase 2 columns if missing
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'evaluaciones' AND column_name = 'tiempo_limite_min') THEN
        ALTER TABLE public.evaluaciones ADD COLUMN tiempo_limite_min INT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'evaluaciones' AND column_name = 'nota_aprobado') THEN
        ALTER TABLE public.evaluaciones ADD COLUMN nota_aprobado DECIMAL(5, 2) DEFAULT 50.00;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'evaluaciones' AND column_name = 'cooldown_minutos') THEN
        ALTER TABLE public.evaluaciones ADD COLUMN cooldown_minutos INT DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'evaluaciones' AND column_name = 'intentos_ventana_limite') THEN
        ALTER TABLE public.evaluaciones ADD COLUMN intentos_ventana_limite INT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'evaluaciones' AND column_name = 'intentos_ventana_horas') THEN
        ALTER TABLE public.evaluaciones ADD COLUMN intentos_ventana_horas INT;
    END IF;
END $$;

-- 2. Preguntas Table
CREATE TABLE IF NOT EXISTS public.preguntas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluacion_id UUID REFERENCES public.evaluaciones(id) ON DELETE CASCADE,
    enunciado_es TEXT NOT NULL,
    enunciado_eu TEXT,
    tipo_pregunta TEXT DEFAULT 'multiple_choice',
    orden INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'preguntas' AND column_name = 'opciones_es') THEN
         ALTER TABLE public.preguntas ADD COLUMN opciones_es JSONB;
    END IF;
     IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'preguntas' AND column_name = 'opciones_eu') THEN
         ALTER TABLE public.preguntas ADD COLUMN opciones_eu JSONB;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'preguntas' AND column_name = 'respuesta_correcta') THEN
         ALTER TABLE public.preguntas ADD COLUMN respuesta_correcta JSONB; -- Or TEXT depending on format
    END IF;
END $$;


-- 3. Actividades Table (Interactive Scenarios)
CREATE TABLE IF NOT EXISTS public.actividades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unidad_id UUID, -- Optional foreign key to units
    tipo TEXT NOT NULL, -- 'escenario_emergencia', 'simulacion'
    titulo_es TEXT NOT NULL,
    titulo_eu TEXT,
    descripcion_es TEXT,
    descripcion_eu TEXT,
    config_json JSONB, -- Stores scenario steps, rules etc.
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.evaluaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preguntas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.actividades ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public read evaluaciones" ON public.evaluaciones FOR SELECT USING (true);
CREATE POLICY "Public read preguntas" ON public.preguntas FOR SELECT USING (true);
CREATE POLICY "Public read actividades" ON public.actividades FOR SELECT USING (true);



