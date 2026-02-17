-- 000_fix_missing_cursos.sql
-- Crea la tabla cursos si no existe (parece haber sido omitida en migraciones anteriores)

CREATE TABLE IF NOT EXISTS public.cursos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    nivel_formacion_id UUID REFERENCES public.niveles_formacion(id) ON DELETE SET NULL,
    nombre_es TEXT NOT NULL,
    nombre_eu TEXT NOT NULL,
    descripcion_es TEXT,
    descripcion_eu TEXT,
    duracion_h INT DEFAULT 0,
    horas_teoricas INT DEFAULT 0,
    horas_practicas INT DEFAULT 0,
    orden_en_nivel INT DEFAULT 1,
    activo BOOLEAN DEFAULT true,
    objetivos_json JSONB DEFAULT '[]'::jsonb,
    competencias_json JSONB DEFAULT '[]'::jsonb,
    imagen_url TEXT,
    precio DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.cursos ENABLE ROW LEVEL SECURITY;

-- Política de lectura pública
CREATE POLICY "Lectura pública cursos" ON public.cursos FOR SELECT USING (true);

-- Trigger updated_at (si existe la función)
DO $$ BEGIN
    CREATE TRIGGER update_cursos_updated_at BEFORE UPDATE ON public.cursos
        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
    WHEN undefined_function THEN null; -- Ignorar si la función no existe aún
END $$;
