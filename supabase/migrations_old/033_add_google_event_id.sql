
-- Add google_event_id to sessions table for Calendar Sync
ALTER TABLE public.sesiones 
ADD COLUMN IF NOT EXISTS google_event_id TEXT;
