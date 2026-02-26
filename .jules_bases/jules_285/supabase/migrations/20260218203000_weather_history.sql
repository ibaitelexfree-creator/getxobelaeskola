
-- 1. Create weather_history table
CREATE TABLE IF NOT EXISTS public.weather_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    station TEXT,
    wind_speed FLOAT,
    wind_gust FLOAT,
    wind_direction FLOAT,
    temperature FLOAT,
    pressure FLOAT,
    tide_height FLOAT,
    visibility FLOAT,
    condition TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add index for performance on historical lookups
CREATE INDEX IF NOT EXISTS idx_weather_history_timestamp ON public.weather_history (timestamp DESC);

-- 3. Enable RLS
ALTER TABLE public.weather_history ENABLE ROW LEVEL SECURITY;

-- 4. Policies (Public read, but only internal service write)
CREATE POLICY "Public weather history access" ON public.weather_history
    FOR SELECT USING (true);

-- No insert/update for public to avoid tampering, we will use service role or admin client.
