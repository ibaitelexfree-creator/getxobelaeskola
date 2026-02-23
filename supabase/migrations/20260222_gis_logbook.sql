-- Migration: Add PostGIS and create/alter bitacora_rutas table

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA extensions;

-- Create table bitacora_rutas if it doesn't exist
CREATE TABLE IF NOT EXISTS public.bitacora_rutas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    fecha_inicio TIMESTAMPTZ,
    fecha_fin TIMESTAMPTZ,
    -- Spatial column for the route path (LineString in WGS84)
    recorrido_geo GEOGRAPHY(LINESTRING, 4326),
    -- JSONB column for flexible route data or raw points
    recorrido_json JSONB DEFAULT '[]'::jsonb,
    -- URL to the stored GPX file
    gpx_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add spatial index for efficient querying
CREATE INDEX IF NOT EXISTS bitacora_rutas_recorrido_geo_idx ON public.bitacora_rutas USING GIST (recorrido_geo);

-- Add comments for documentation
COMMENT ON TABLE public.bitacora_rutas IS 'Table for storing user routes (GIS Logbook)';
COMMENT ON COLUMN public.bitacora_rutas.recorrido_geo IS 'Spatial representation of the route (PostGIS Geography)';
COMMENT ON COLUMN public.bitacora_rutas.recorrido_json IS 'JSON representation of the route points';
COMMENT ON COLUMN public.bitacora_rutas.gpx_url IS 'URL to the original GPX file';

-- Enable Row Level Security
ALTER TABLE public.bitacora_rutas ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own routes
CREATE POLICY "Users can view their own routes" ON public.bitacora_rutas
    FOR SELECT USING (auth.uid() = usuario_id);

-- Users can insert their own routes
CREATE POLICY "Users can insert their own routes" ON public.bitacora_rutas
    FOR INSERT WITH CHECK (auth.uid() = usuario_id);

-- Users can update their own routes
CREATE POLICY "Users can update their own routes" ON public.bitacora_rutas
    FOR UPDATE USING (auth.uid() = usuario_id);

-- Users can delete their own routes
CREATE POLICY "Users can delete their own routes" ON public.bitacora_rutas
    FOR DELETE USING (auth.uid() = usuario_id);

-- Trigger for updated_at timestamp
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_updated_at') THEN
        CREATE TRIGGER set_updated_at_bitacora_rutas
            BEFORE UPDATE ON public.bitacora_rutas
            FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
    END IF;
END $$;
