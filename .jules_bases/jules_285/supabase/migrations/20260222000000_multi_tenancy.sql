-- Migration: Multi-tenancy Support
-- Created: 2026-02-22
-- Description: Adds tenant_id to core tables and implements RLS policies.

-- 1. Create Tenants Table
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- Insert Default Tenant (Getxo Bela Eskola)
INSERT INTO public.tenants (id, name, slug)
VALUES ('e7f8e7f8-e7f8-e7f8-e7f8-e7f8e7f8e7f8', 'Getxo Bela Eskola', 'getxo-bela-eskola')
ON CONFLICT (slug) DO NOTHING;

-- 2. Add tenant_id to Profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) DEFAULT 'e7f8e7f8-e7f8-e7f8-e7f8-e7f8e7f8e7f8';

UPDATE public.profiles SET tenant_id = 'e7f8e7f8-e7f8-e7f8-e7f8-e7f8e7f8e7f8' WHERE tenant_id IS NULL;
ALTER TABLE public.profiles ALTER COLUMN tenant_id SET NOT NULL;

-- 3. Update handle_new_user Trigger Function
-- Replaces existing function to include tenant_id assignment
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, nombre, apellidos, tenant_id)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'nombre',
        NEW.raw_user_meta_data->>'apellidos',
        'e7f8e7f8-e7f8-e7f8-e7f8-e7f8e7f8e7f8'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 4. Add tenant_id to Content & User Data Tables
DO $$
DECLARE
    t text;
    tables text[] := ARRAY[
        'instructores', 'categorias', 'cursos', 'ediciones_curso', 'inscripciones',
        'mensajes_contacto', 'bitacora_personal', 'progreso_alumno', 'intentos_evaluacion',
        'intentos_desafios', 'desafios_diarios', 'mantenimiento_logs', 'sesiones', 'sesion_asistentes',
        'experiencias', 'reservas_experiencia', 'habilidades_alumno', 'logros_alumno',
        'horas_navegacion', 'certificados', 'intentos_actividad'
    ];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = t) THEN
            EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) DEFAULT %L', t, 'e7f8e7f8-e7f8-e7f8-e7f8-e7f8e7f8e7f8');
            EXECUTE format('UPDATE public.%I SET tenant_id = %L WHERE tenant_id IS NULL', t, 'e7f8e7f8-e7f8-e7f8-e7f8-e7f8e7f8e7f8');
            EXECUTE format('ALTER TABLE public.%I ALTER COLUMN tenant_id SET NOT NULL', t);
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
        END IF;
    END LOOP;
END $$;


-- 5. RLS Policies

-- Helper Function to avoid recursion in RLS policies
CREATE OR REPLACE FUNCTION public.get_current_user_tenant_id()
RETURNS UUID AS $$
DECLARE
    tid UUID;
BEGIN
    SELECT tenant_id INTO tid FROM public.profiles WHERE id = auth.uid();
    RETURN tid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Tenants Policy
CREATE POLICY "Users can view their own tenant" ON public.tenants
    FOR SELECT USING (
        id = public.get_current_user_tenant_id()
    );

-- Profiles Policy
DROP POLICY IF EXISTS "Perfiles propios" ON public.profiles;
CREATE POLICY "View own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "View tenant profiles" ON public.profiles FOR SELECT USING (tenant_id = public.get_current_user_tenant_id());
CREATE POLICY "Update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Explicit Policy Updates for Content Tables
-- We must remove "Public Read" policies and enforce Tenant Scoping.

-- Instructores
DROP POLICY IF EXISTS "Lectura pública instructores" ON public.instructores;
CREATE POLICY "Tenant Read instructores" ON public.instructores FOR SELECT USING (tenant_id = public.get_current_user_tenant_id());

-- Categorias
DROP POLICY IF EXISTS "Lectura pública categorias" ON public.categorias;
CREATE POLICY "Tenant Read categorias" ON public.categorias FOR SELECT USING (tenant_id = public.get_current_user_tenant_id());

-- Cursos
DROP POLICY IF EXISTS "Lectura pública cursos" ON public.cursos;
CREATE POLICY "Tenant Read cursos" ON public.cursos FOR SELECT USING (tenant_id = public.get_current_user_tenant_id());

-- Experiencias
DROP POLICY IF EXISTS "experiencias_public_read" ON public.experiencias;
CREATE POLICY "Tenant Read experiencias" ON public.experiencias FOR SELECT USING (tenant_id = public.get_current_user_tenant_id());

-- Desafios Diarios
DROP POLICY IF EXISTS "Anyone can view active challenges" ON public.desafios_diarios;
CREATE POLICY "Tenant Read desafios_diarios" ON public.desafios_diarios FOR SELECT USING (tenant_id = public.get_current_user_tenant_id());

-- Ediciones Curso
DROP POLICY IF EXISTS "Lectura pública ediciones" ON public.ediciones_curso;
CREATE POLICY "Tenant Read ediciones_curso" ON public.ediciones_curso FOR SELECT USING (tenant_id = public.get_current_user_tenant_id());

-- Mensajes Contacto (Insert only usually, but restricting view to admin of tenant)
CREATE POLICY "Tenant Admins view messages" ON public.mensajes_contacto FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND rol IN ('admin', 'instructor') AND tenant_id = mensajes_contacto.tenant_id)
);

-- Trigger to Auto-Assign Tenant ID
CREATE OR REPLACE FUNCTION public.set_tenant_id_from_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Only override if NULL.
    IF NEW.tenant_id IS NULL THEN
        -- Try to get from user profile via helper function (safe)
        NEW.tenant_id := public.get_current_user_tenant_id();
    END IF;

    -- Fallback to default if still NULL (e.g. unauthenticated insert or system job)
    IF NEW.tenant_id IS NULL THEN
        NEW.tenant_id := 'e7f8e7f8-e7f8-e7f8-e7f8-e7f8e7f8e7f8';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply Trigger to relevant tables
DO $$
DECLARE
    t text;
    user_insert_tables text[] := ARRAY[
        'instructores', 'categorias', 'cursos', 'ediciones_curso', 'inscripciones',
        'mensajes_contacto', 'bitacora_personal', 'progreso_alumno', 'intentos_evaluacion',
        'intentos_desafios', 'mantenimiento_logs', 'sesiones', 'sesion_asistentes',
        'experiencias', 'reservas_experiencia', 'desafios_diarios', 'habilidades_alumno',
        'logros_alumno', 'horas_navegacion', 'certificados', 'intentos_actividad'
    ];
BEGIN
    FOREACH t IN ARRAY user_insert_tables LOOP
        IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = t) THEN
            EXECUTE format('DROP TRIGGER IF EXISTS tr_set_tenant_id ON public.%I', t);
            EXECUTE format('CREATE TRIGGER tr_set_tenant_id BEFORE INSERT ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_tenant_id_from_user()', t);
        END IF;
    END LOOP;
END $$;
