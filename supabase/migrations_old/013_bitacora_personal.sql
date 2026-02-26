-- Migration 013: Bitácora Personal del Alumno
CREATE TABLE IF NOT EXISTS public.bitacora_personal (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alumno_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    fecha TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    contenido TEXT NOT NULL,
    estado_animo TEXT CHECK (estado_animo IN ('confident', 'challenging', 'discovery')) DEFAULT 'discovery',
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.bitacora_personal ENABLE ROW LEVEL SECURITY;

-- Políticas de Seguridad
CREATE POLICY "Los alumnos pueden ver sus propias entradas"
    ON public.bitacora_personal FOR SELECT
    USING (auth.uid() = alumno_id);

CREATE POLICY "Los alumnos pueden insertar sus propias entradas"
    ON public.bitacora_personal FOR INSERT
    WITH CHECK (auth.uid() = alumno_id);

CREATE POLICY "Los alumnos pueden borrar sus propias entradas"
    ON public.bitacora_personal FOR DELETE
    USING (auth.uid() = alumno_id);

-- Trigger para updated_at (asumiendo que handle_updated_at ya existe en el sistema)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_updated_at') THEN
        CREATE TRIGGER set_updated_at_bitacora
            BEFORE UPDATE ON public.bitacora_personal
            FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
    END IF;
END $$;
