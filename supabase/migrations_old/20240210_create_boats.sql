
-- Create Embarcaciones Table
CREATE TABLE IF NOT EXISTS public.embarcaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL,
    tipo TEXT NOT NULL DEFAULT 'vela_ligera', -- 'vela_ligera', 'crucero', 'motor', 'neumatica'
    capacidad INT NOT NULL DEFAULT 1,
    matricula TEXT,
    estado TEXT NOT NULL DEFAULT 'disponible', -- 'disponible', 'mantenimiento', 'en_uso', 'averiado'
    notas TEXT,
    imagen_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.embarcaciones ENABLE ROW LEVEL SECURITY;

-- Create Policies
-- Policy 1: Admins have full access
CREATE POLICY "Admins full access on embarcaciones" ON public.embarcaciones
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.rol = 'admin'
        )
    );

-- Policy 2: Instructors can view embarcaciones
CREATE POLICY "Instructors view embarcaciones" ON public.embarcaciones
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND (profiles.rol = 'instructor' OR profiles.rol = 'admin')
        )
    );

-- Policy 3: Instructors can update status/notes (e.g. report damage)
CREATE POLICY "Instructors update status on embarcaciones" ON public.embarcaciones
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND (profiles.rol = 'instructor' OR profiles.rol = 'admin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND (profiles.rol = 'instructor' OR profiles.rol = 'admin')
        )
    );
