-- ==========================================
-- ESTRUCTURA COMPLETA: GETXO BELA ESKOLA
-- ==========================================

-- FASE 1: NÚCLEO INFORMATIVO
-- ------------------------------------------

-- 1. Instructores
CREATE TABLE IF NOT EXISTS public.instructores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    bio_es TEXT,
    bio_eu TEXT,
    foto_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Categorías de Cursos
CREATE TABLE IF NOT EXISTS public.categorias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_es TEXT NOT NULL,
    nombre_eu TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Cursos
DO $$ BEGIN
    CREATE TYPE public.nivel_curso AS ENUM ('iniciacion', 'intermedio', 'avanzado', 'profesional');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.cursos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_es TEXT NOT NULL,
    nombre_eu TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    descripcion_es TEXT,
    descripcion_eu TEXT,
    precio DECIMAL(10, 2) NOT NULL,
    duracion_h INT NOT NULL,
    nivel nivel_curso DEFAULT 'iniciacion',
    categoria_id UUID REFERENCES public.categorias(id),
    instructor_id UUID REFERENCES public.instructores(id),
    imagen_url TEXT,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Mensajes de Contacto
CREATE TABLE IF NOT EXISTS public.mensajes_contacto (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    email TEXT NOT NULL,
    telefono TEXT,
    asunto TEXT,
    mensaje TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- FASE 2: AUTH, EDICIONES Y RESERVAS
-- ------------------------------------------

-- 5. Perfiles (Extensión de auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre TEXT,
    apellidos TEXT,
    telefono TEXT,
    avatar_url TEXT,
    rol TEXT DEFAULT 'alumno' CHECK (rol IN ('alumno', 'instructor', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Función y Trigger para crear perfil automáticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, nombre, apellidos)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'nombre', NEW.raw_user_meta_data->>'apellidos');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$ BEGIN
    CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 6. Ediciones de Curso
CREATE TABLE IF NOT EXISTS public.ediciones_curso (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    curso_id UUID REFERENCES public.cursos(id) ON DELETE CASCADE,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    plazas_totales INT NOT NULL,
    plazas_ocupadas INT DEFAULT 0,
    instructor_id UUID REFERENCES public.instructores(id),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Inscripciones
DO $$ BEGIN
    CREATE TYPE public.estado_pago AS ENUM ('pendiente', 'pagado', 'fallido', 'reembolsado');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.inscripciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    perfil_id UUID REFERENCES public.profiles(id),
    edicion_id UUID REFERENCES public.ediciones_curso(id),
    estado_pago public.estado_pago DEFAULT 'pendiente',
    stripe_session_id TEXT,
    monto_total DECIMAL(10, 2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SEGURIDAD (RLS)
-- ------------------------------------------
ALTER TABLE public.instructores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensajes_contacto ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ediciones_curso ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inscripciones ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Lectura pública instructores" ON public.instructores FOR SELECT USING (true);
CREATE POLICY "Lectura pública categorias" ON public.categorias FOR SELECT USING (true);
CREATE POLICY "Lectura pública cursos" ON public.cursos FOR SELECT USING (true);
CREATE POLICY "Envío público mensajes" ON public.mensajes_contacto FOR INSERT WITH CHECK (true);
CREATE POLICY "Perfiles propios" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Actualizar perfil propio" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Lectura pública ediciones" ON public.ediciones_curso FOR SELECT USING (true);
CREATE POLICY "Inscripciones propias" ON public.inscripciones FOR SELECT USING (auth.uid() = perfil_id);

-- SEED DATA (Opcional)
-- ------------------------------------------
INSERT INTO public.categorias (nombre_es, nombre_eu, slug) 
VALUES ('Vela Ligera', 'Bela Arina', 'vela-ligera')
ON CONFLICT (slug) DO NOTHING;
