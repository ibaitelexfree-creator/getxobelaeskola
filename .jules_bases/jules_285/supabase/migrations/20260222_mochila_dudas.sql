-- Create table for tracking failed questions for review (Mochila de Dudas)
CREATE TABLE IF NOT EXISTS public.repaso_errores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alumno_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    pregunta_id UUID NOT NULL REFERENCES public.preguntas(id) ON DELETE CASCADE,
    estado TEXT NOT NULL CHECK (estado IN ('pendiente', 'dominada')) DEFAULT 'pendiente',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(alumno_id, pregunta_id)
);

-- Enable RLS
ALTER TABLE public.repaso_errores ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Ver errores propios" ON public.repaso_errores FOR SELECT USING (auth.uid() = alumno_id);
CREATE POLICY "Insertar errores propios" ON public.repaso_errores FOR INSERT WITH CHECK (auth.uid() = alumno_id);
CREATE POLICY "Actualizar errores propios" ON public.repaso_errores FOR UPDATE USING (auth.uid() = alumno_id);

-- Trigger for updated_at
DO $$ BEGIN
    CREATE TRIGGER update_repaso_errores_updated_at BEFORE UPDATE ON public.repaso_errores
        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
