const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

function getEnv() {
    const envPath = path.join(process.cwd(), '.env');
    const content = fs.readFileSync(envPath, 'utf8');
    const env = {};
    content.split('\n').forEach(line => {
        const [key, ...val] = line.split('=');
        if (key && val) env[key.trim()] = val.join('=').trim().replace(/"/g, '').replace(/'/g, '');
    });
    return env;
}

const env = getEnv();
const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
);

async function applyMigration() {
    console.log('Applying weather_history migration...');

    const sql = `
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

        CREATE INDEX IF NOT EXISTS idx_weather_history_timestamp ON public.weather_history (timestamp DESC);

        ALTER TABLE public.weather_history ENABLE ROW LEVEL SECURITY;

        DO $$ 
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_policies 
                WHERE tablename = 'weather_history' AND policyname = 'Public weather history access'
            ) THEN
                CREATE POLICY "Public weather history access" ON public.weather_history
                    FOR SELECT USING (true);
            END IF;
        END $$;
    `;

    const { error } = await supabase.rpc('exec_sql', { sql });

    if (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    } else {
        console.log('Migration applied successfully!');
    }
}

applyMigration();
