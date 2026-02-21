-- Migration: Create Mistake Review System (Mochila de Dudas)

CREATE TABLE IF NOT EXISTS public.errores_repaso (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alumno_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    pregunta_id UUID NOT NULL REFERENCES public.preguntas(id) ON DELETE CASCADE,
    estado TEXT NOT NULL CHECK (estado IN ('pendiente', 'dominada')) DEFAULT 'pendiente',
    fecha_fallo TIMESTAMPTZ DEFAULT NOW(),
    fecha_repaso TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(alumno_id, pregunta_id)
);

-- Enable Row Level Security
ALTER TABLE public.errores_repaso ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Ver errores propios" ON public.errores_repaso
    FOR SELECT USING (auth.uid() = alumno_id);

CREATE POLICY "Registrar errores propios" ON public.errores_repaso
    FOR INSERT WITH CHECK (auth.uid() = alumno_id);

CREATE POLICY "Actualizar errores propios" ON public.errores_repaso
    FOR UPDATE USING (auth.uid() = alumno_id);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_errores_repaso_alumno ON public.errores_repaso(alumno_id);
CREATE INDEX IF NOT EXISTS idx_errores_repaso_estado ON public.errores_repaso(estado);
