-- Create Mantenimiento Logs Table
CREATE TABLE IF NOT EXISTS public.mantenimiento_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    embarcacion_id UUID NOT NULL REFERENCES public.embarcaciones(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL CHECK (tipo IN ('preventivo', 'correctivo', 'mejora')),
    descripcion TEXT NOT NULL,
    coste DECIMAL(10, 2) DEFAULT 0,
    estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_proceso', 'completado')), -- 'pendiente', 'en_proceso', 'completado'
    fecha_inicio TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    fecha_fin TIMESTAMP WITH TIME ZONE,
    realizado_por UUID REFERENCES public.profiles(id), -- Staff who logged/performed it
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.mantenimiento_logs ENABLE ROW LEVEL SECURITY;

-- Create Policies
-- Policy 1: Admins have full access
CREATE POLICY "Admins full access on mantenimiento_logs" ON public.mantenimiento_logs
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.rol = 'admin'
        )
    );

-- Policy 2: Instructors can create logs (report needed maintenance)
CREATE POLICY "Instructors create maintenance logs" ON public.mantenimiento_logs
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND (profiles.rol = 'instructor' OR profiles.rol = 'admin')
        )
    );

-- Policy 3: Instructors can view all logs
CREATE POLICY "Instructors select maintenance logs" ON public.mantenimiento_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND (profiles.rol = 'instructor' OR profiles.rol = 'admin')
        )
    );

-- Policy 4: Instructors can update logs (mark as completed, add notes)
CREATE POLICY "Instructors update maintenance logs" ON public.mantenimiento_logs
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND (profiles.rol = 'instructor' OR profiles.rol = 'admin')
        )
    );
