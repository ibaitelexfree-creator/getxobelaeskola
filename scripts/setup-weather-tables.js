const { Client } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

async function setupTables() {
    const isLocal = connectionString?.includes('localhost') || connectionString?.includes('127.0.0.1');
    const client = new Client({
        connectionString,
        ssl: isLocal ? false : { rejectUnauthorized: false }
    });

    const sql = `
-- Tabla para historial de clima (pestaña de gráficos)
CREATE TABLE IF NOT EXISTS public.weather_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    station TEXT NOT NULL,
    wind_speed NUMERIC NOT NULL,
    wind_gust NUMERIC,
    wind_direction NUMERIC,
    temperature NUMERIC,
    tide_height NUMERIC,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla para el estado actual consolidado (caché persistente)
CREATE TABLE IF NOT EXISTS public.api_cache (
    key TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para consultas rápidas por tiempo
CREATE INDEX IF NOT EXISTS idx_weather_history_timestamp ON public.weather_history(timestamp DESC);

-- Habilitar RLS
ALTER TABLE public.weather_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_cache ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Lectura pública weather_history') THEN
        CREATE POLICY "Lectura pública weather_history" ON public.weather_history FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Lectura pública api_cache') THEN
        CREATE POLICY "Lectura pública api_cache" ON public.api_cache FOR SELECT USING (true);
    END IF;
END $$;
  `;

    try {
        await client.connect();
        console.log('Conectado a la base de datos.');
        await client.query(sql);
        console.log('✅ Tablas de clima configuradas con éxito.');
    } catch (err) {
        console.error('❌ Error configurando tablas:', err.message);
    } finally {
        await client.end();
    }
}

setupTables();
