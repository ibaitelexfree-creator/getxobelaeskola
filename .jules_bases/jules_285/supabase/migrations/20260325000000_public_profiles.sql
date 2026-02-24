-- Migration: Public Profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE;

-- Update RLS for profiles
CREATE POLICY "Public profiles are viewable by everyone"
ON public.profiles FOR SELECT
USING (is_public = true);

-- Update RLS for related tables
-- Progreso Alumno
CREATE POLICY "Public profile progress is viewable by everyone"
ON public.progreso_alumno FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = progreso_alumno.alumno_id
        AND profiles.is_public = true
    )
);

-- Logros Alumno
CREATE POLICY "Public profile badges are viewable by everyone"
ON public.logros_alumno FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = logros_alumno.alumno_id
        AND profiles.is_public = true
    )
);

-- Horas Navegacion
CREATE POLICY "Public profile logbook is viewable by everyone"
ON public.horas_navegacion FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = horas_navegacion.alumno_id
        AND profiles.is_public = true
    )
);

-- Certificados
CREATE POLICY "Public profile certificates are viewable by everyone"
ON public.certificados FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = certificados.alumno_id
        AND profiles.is_public = true
    )
);

-- Habilidades Alumno (Skills)
CREATE POLICY "Public profile skills are viewable by everyone"
ON public.habilidades_alumno FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = habilidades_alumno.alumno_id
        AND profiles.is_public = true
    )
);
