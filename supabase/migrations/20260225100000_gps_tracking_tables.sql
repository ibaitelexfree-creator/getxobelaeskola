-- user_live_locations table
CREATE TABLE IF NOT EXISTS public.user_live_locations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) NOT NULL UNIQUE,
    lat float8 NOT NULL,
    lng float8 NOT NULL,
    speed float8,
    heading float8,
    in_water boolean NOT NULL DEFAULT false,
    accuracy float8,
    updated_at timestamptz NOT NULL DEFAULT now(),
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_live_locations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_live_locations
CREATE POLICY "Users can view their own live location"
    ON public.user_live_locations FOR SELECT
    USING (auth.uid() = user_id OR EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND rol IN ('admin', 'instructor')
    ));

CREATE POLICY "Users can insert their own live location"
    ON public.user_live_locations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own live location"
    ON public.user_live_locations FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can delete live locations"
    ON public.user_live_locations FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND rol = 'admin'
    ));

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_live_locations_user ON public.user_live_locations (user_id);
CREATE INDEX IF NOT EXISTS idx_live_locations_in_water ON public.user_live_locations (in_water) WHERE in_water = true;
CREATE INDEX IF NOT EXISTS idx_live_locations_updated ON public.user_live_locations (updated_at);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_live_location_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_user_live_locations_updated_at ON public.user_live_locations;
CREATE TRIGGER trg_user_live_locations_updated_at
BEFORE UPDATE ON public.user_live_locations
FOR EACH ROW
EXECUTE FUNCTION update_live_location_timestamp();

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_live_locations;

-- exploration_tracks table
CREATE TABLE IF NOT EXISTS public.exploration_tracks (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) NOT NULL,
    track_segment jsonb NOT NULL,
    pass_count integer NOT NULL DEFAULT 1,
    session_date date NOT NULL DEFAULT CURRENT_DATE,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.exploration_tracks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for exploration_tracks
CREATE POLICY "Users can view their own exploration tracks"
    ON public.exploration_tracks FOR SELECT
    USING (auth.uid() = user_id OR EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND rol IN ('admin', 'instructor')
    ));

CREATE POLICY "Users can insert their own exploration tracks"
    ON public.exploration_tracks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exploration tracks"
    ON public.exploration_tracks FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Indices
CREATE INDEX IF NOT EXISTS idx_exploration_user_date ON public.exploration_tracks (user_id, session_date);
