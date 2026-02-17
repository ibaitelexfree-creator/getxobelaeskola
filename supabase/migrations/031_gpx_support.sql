
-- Migration 031: Support for GPX Tracks
ALTER TABLE public.horas_navegacion 
ADD COLUMN IF NOT EXISTS track_log JSONB, -- Simplified array of {lat, lng} for rendering
ADD COLUMN IF NOT EXISTS gpx_url TEXT;    -- Original file URL in storage

COMMENT ON COLUMN public.horas_navegacion.track_log IS 'Simplified sailing path coordinates for map rendering';
