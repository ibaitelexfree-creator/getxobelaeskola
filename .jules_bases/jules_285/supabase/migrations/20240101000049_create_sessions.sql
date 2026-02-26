
-- Create Sesiones Table
CREATE TABLE IF NOT EXISTS public.sesiones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    curso_id UUID REFERENCES public.cursos(id) ON DELETE SET NULL,
    instructor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- User with role instructor
    embarcacion_id UUID REFERENCES public.embarcaciones(id) ON DELETE SET NULL,
    fecha_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
    fecha_fin TIMESTAMP WITH TIME ZONE NOT NULL,
    estado TEXT NOT NULL DEFAULT 'programada', -- 'programada', 'realizada', 'cancelada'
    observaciones TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Sesion Asistentes Table (Attendance)
CREATE TABLE IF NOT EXISTS public.sesion_asistentes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sesion_id UUID REFERENCES public.sesiones(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- Student
    asistencia TEXT NOT NULL DEFAULT 'pendiente', -- 'pendiente', 'presente', 'ausente', 'justificado'
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(sesion_id, usuario_id)
);

-- Enable RLS
ALTER TABLE public.sesiones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sesion_asistentes ENABLE ROW LEVEL SECURITY;

-- Policies for Sessions
-- Admins: Full access
CREATE POLICY "Admins full access on sesiones" ON public.sesiones
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND rol = 'admin')
    );

-- Instructors: View all, Update assigned
CREATE POLICY "Instructors view all sesiones" ON public.sesiones
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (rol = 'instructor' OR rol = 'admin'))
    );

CREATE POLICY "Instructors update assigned sessions" ON public.sesiones
    FOR UPDATE USING (
        instructor_id = auth.uid() OR 
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND rol = 'admin')
    );

-- Policies for Attendance
-- Admins: Full access
CREATE POLICY "Admins full access on sesion_asistentes" ON public.sesion_asistentes
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND rol = 'admin')
    );

-- Instructors: Manage attendance for their sessions (or all, for simplicity)
CREATE POLICY "Instructors manage attendance" ON public.sesion_asistentes
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (rol = 'instructor' OR rol = 'admin'))
    );

-- Students: View their own attendance
CREATE POLICY "Students view own attendance" ON public.sesion_asistentes
    FOR SELECT USING (
        usuario_id = auth.uid()
    );
