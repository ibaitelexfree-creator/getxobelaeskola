-- Migration: Enable Multi-tenancy and Enforce JWT-based RLS

-- 1. Helper Functions

-- Extract Tenant ID from JWT
CREATE OR REPLACE FUNCTION public.get_tenant_id()
RETURNS UUID AS $$
BEGIN
    RETURN (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::UUID;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Safe get_my_role to avoid RLS recursion and prioritize JWT
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text AS $$
DECLARE
    user_role text;
BEGIN
    -- Try JWT first (Performance + Security)
    user_role := (auth.jwt() -> 'app_metadata' ->> 'role');
    IF user_role IS NOT NULL THEN
        RETURN user_role;
    END IF;

    -- Fallback to profiles (Security Definer avoids RLS recursion)
    SELECT rol INTO user_role FROM public.profiles WHERE id = auth.uid();
    RETURN user_role;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 2. Add tenant_id column and Index to Core Tables
DO $$
DECLARE
    t text;
    tables text[] := ARRAY[
        'profiles', 'embarcaciones', 'mantenimiento_logs',
        'sesiones', 'sesion_asistentes', 'cursos',
        'ediciones_curso', 'inscripciones', 'mensajes_contacto',
        'categorias', 'instructores'
    ];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        -- Add column if it doesn't exist
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT ''00000000-0000-0000-0000-000000000000''::UUID NOT NULL', t);

        -- Create Index
        EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%I_tenant_id ON public.%I(tenant_id)', t, t);

        -- Enable RLS
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    END LOOP;
END $$;

-- 3. Update handle_new_user Trigger to include tenant_id and sync to app_metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    target_tenant_id UUID;
BEGIN
    -- Determine Tenant ID (Default to 000... if missing)
    target_tenant_id := COALESCE((NEW.raw_user_meta_data->>'tenant_id')::UUID, '00000000-0000-0000-0000-000000000000'::UUID);

    -- Insert into profiles
    INSERT INTO public.profiles (id, nombre, apellidos, tenant_id)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'nombre',
        NEW.raw_user_meta_data->>'apellidos',
        target_tenant_id
    );

    -- Sync tenant_id to auth.users.raw_app_meta_data so future JWTs have it
    -- (This requires the function to be SECURITY DEFINER, which it is)
    UPDATE auth.users
    SET raw_app_meta_data =
        jsonb_set(
            COALESCE(raw_app_meta_data, '{}'::jsonb),
            '{tenant_id}',
            to_jsonb(target_tenant_id)
        )
    WHERE id = NEW.id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Re-create RLS Policies
-- First, drop all existing policies to ensure clean state
DO $$
DECLARE
    t text;
    tables text[] := ARRAY[
        'profiles', 'embarcaciones', 'mantenimiento_logs',
        'sesiones', 'sesion_asistentes', 'cursos',
        'ediciones_curso', 'inscripciones', 'mensajes_contacto',
        'categorias', 'instructores'
    ];
    pol record;
BEGIN
    FOREACH t IN ARRAY tables LOOP
        FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = t LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, t);
        END LOOP;
    END LOOP;
END $$;

-- Define Policies

-- PROFILES
-- Users see themselves; Admins see all in tenant
CREATE POLICY "profiles_isolation" ON public.profiles
    USING (
        (auth.uid() = id AND tenant_id = get_tenant_id())
        OR
        (public.get_my_role() = 'admin' AND tenant_id = get_tenant_id())
    )
    WITH CHECK (
        (auth.uid() = id AND tenant_id = get_tenant_id())
        OR
        (public.get_my_role() = 'admin' AND tenant_id = get_tenant_id())
    );

-- EMBARCACIONES (Boats)
-- Read: All in tenant
-- Write: Admin/Instructor in tenant
CREATE POLICY "embarcaciones_select" ON public.embarcaciones FOR SELECT
    USING (tenant_id = get_tenant_id());

CREATE POLICY "embarcaciones_modify" ON public.embarcaciones FOR ALL
    USING (public.get_my_role() IN ('admin', 'instructor') AND tenant_id = get_tenant_id());

-- MANTENIMIENTO_LOGS
-- Read/Write: Admin/Instructor in tenant
CREATE POLICY "mantenimiento_logs_isolation" ON public.mantenimiento_logs FOR ALL
    USING (public.get_my_role() IN ('admin', 'instructor') AND tenant_id = get_tenant_id());

-- SESIONES
-- Read: All in tenant
-- Write: Admin/Instructor in tenant
CREATE POLICY "sesiones_select" ON public.sesiones FOR SELECT
    USING (tenant_id = get_tenant_id());

CREATE POLICY "sesiones_modify" ON public.sesiones FOR ALL
    USING (public.get_my_role() IN ('admin', 'instructor') AND tenant_id = get_tenant_id());

-- SESION_ASISTENTES
-- Select: Own OR Admin/Instructor
-- Modify: Admin/Instructor
CREATE POLICY "sesion_asistentes_select" ON public.sesion_asistentes FOR SELECT
    USING (
        (usuario_id = auth.uid() AND tenant_id = get_tenant_id())
        OR
        (public.get_my_role() IN ('admin', 'instructor') AND tenant_id = get_tenant_id())
    );

CREATE POLICY "sesion_asistentes_modify" ON public.sesion_asistentes FOR ALL
    USING (public.get_my_role() IN ('admin', 'instructor') AND tenant_id = get_tenant_id());

-- CURSOS, CATEGORIAS, INSTRUCTORES, EDICIONES_CURSO
-- Public Read (Authenticated with Tenant)
-- Write: Admin
CREATE POLICY "content_select_cursos" ON public.cursos FOR SELECT USING (tenant_id = get_tenant_id());
CREATE POLICY "content_modify_cursos" ON public.cursos FOR ALL USING (public.get_my_role() = 'admin' AND tenant_id = get_tenant_id());

CREATE POLICY "content_select_categorias" ON public.categorias FOR SELECT USING (tenant_id = get_tenant_id());
CREATE POLICY "content_modify_categorias" ON public.categorias FOR ALL USING (public.get_my_role() = 'admin' AND tenant_id = get_tenant_id());

CREATE POLICY "content_select_instructores" ON public.instructores FOR SELECT USING (tenant_id = get_tenant_id());
CREATE POLICY "content_modify_instructores" ON public.instructores FOR ALL USING (public.get_my_role() = 'admin' AND tenant_id = get_tenant_id());

CREATE POLICY "content_select_ediciones" ON public.ediciones_curso FOR SELECT USING (tenant_id = get_tenant_id());
CREATE POLICY "content_modify_ediciones" ON public.ediciones_curso FOR ALL USING (public.get_my_role() = 'admin' AND tenant_id = get_tenant_id());

-- INSCRIPCIONES
-- Select: Own OR Admin
-- Modify: Admin
CREATE POLICY "inscripciones_select" ON public.inscripciones FOR SELECT
    USING (
        (perfil_id = auth.uid() AND tenant_id = get_tenant_id())
        OR
        (public.get_my_role() = 'admin' AND tenant_id = get_tenant_id())
    );

CREATE POLICY "inscripciones_modify" ON public.inscripciones FOR ALL
    USING (public.get_my_role() = 'admin' AND tenant_id = get_tenant_id());

-- MENSAJES_CONTACTO
-- Select: Admin
-- Insert: Public (if tenant_id provided? No, strict mode: Authenticated only for now, or use service role)
-- Assuming stricter security: Admin only read.
CREATE POLICY "mensajes_contacto_isolation" ON public.mensajes_contacto FOR ALL
    USING (public.get_my_role() = 'admin' AND tenant_id = get_tenant_id());

-- Allow Insert from generic authenticated users?
-- If we want strict tenant enforcement, users must be logged in.
CREATE POLICY "mensajes_contacto_insert" ON public.mensajes_contacto FOR INSERT
    WITH CHECK (tenant_id = get_tenant_id());
