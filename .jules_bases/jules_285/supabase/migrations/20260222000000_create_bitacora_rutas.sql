-- Enable PostGIS if not already enabled
CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA extensions;

-- Create bitacora_rutas table
CREATE TABLE IF NOT EXISTS public.bitacora_rutas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    nombre TEXT DEFAULT 'Ruta sin nombre',
    descripcion TEXT,
    fecha_inicio TIMESTAMPTZ DEFAULT NOW(),
    fecha_fin TIMESTAMPTZ,

    -- Spatial data: standard 2D LineString (SRID 4326)
    geom GEOMETRY(LINESTRING, 4326),

    -- JSON/GPX storage
    track_json JSONB, -- For frontend (array of points or GeoJSON)
    gpx_data TEXT,    -- Raw GPX XML content (optional)

    -- Metrics
    distancia_nautica NUMERIC DEFAULT 0, -- Nautical Miles
    velocidad_media NUMERIC,             -- Knots
    velocidad_maxima NUMERIC,            -- Knots

    -- Metadata
    metadatos JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for spatial queries
CREATE INDEX IF NOT EXISTS bitacora_rutas_geom_idx ON public.bitacora_rutas USING GIST (geom);

-- RLS
ALTER TABLE public.bitacora_rutas ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Usuarios pueden ver sus propias rutas" ON public.bitacora_rutas
    FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "Usuarios pueden insertar sus propias rutas" ON public.bitacora_rutas
    FOR INSERT WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuarios pueden actualizar sus propias rutas" ON public.bitacora_rutas
    FOR UPDATE USING (auth.uid() = usuario_id);

CREATE POLICY "Usuarios pueden eliminar sus propias rutas" ON public.bitacora_rutas
    FOR DELETE USING (auth.uid() = usuario_id);

-- Trigger for updated_at
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_updated_at') THEN
        CREATE TRIGGER set_updated_at_bitacora_rutas
            BEFORE UPDATE ON public.bitacora_rutas
            FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
    END IF;
END $$;
