import { NextRequest, NextResponse } from 'next/server';
import { fetchWeatherData } from '@/lib/weather';
import { createAdminClient } from '@/lib/supabase/admin';
import { fetchEuskalmetAlerts } from '@/lib/euskalmet';
import { fetchSeaState } from '@/lib/puertos-del-estado';

export const dynamic = 'force-dynamic';

// In-memory cache for weather data (expires in 5 minutes)
let cachedWeather: any = null;
let cachedAlerts: any = null;
let cachedSeaState: any = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const includeHistory = searchParams.get('history') === 'true';
        const supabase = createAdminClient();

        // 1. Fetch current state from DB Cache
        const { data: cacheEntries } = await supabase
            .from('api_cache')
            .select('key, data')
            .in('key', ['weather_current', 'euskalmet_alerts', 'sea_state']);

        const weather = cacheEntries?.find(e => e.key === 'weather_current')?.data || null;
        const alerts = cacheEntries?.find(e => e.key === 'euskalmet_alerts')?.data || [];
        const seaState = cacheEntries?.find(e => e.key === 'sea_state')?.data || {
            waveHeight: 1.0,
            period: 8,
            waterTemp: 18,
            windSpeed: 10,
            timestamp: new Date().toISOString(),
            isSimulated: true
        };

        // Filter alerts (only yellow/orange/red)
        const warningAlerts = Array.isArray(alerts) ? alerts.filter((a: any) =>
            a.level && !['verde', 'green', 'null', 'none'].includes(a.level.toLowerCase())
        ) : [];

        // 2. Fetch History from DB
        let history: any[] | undefined = undefined;
        if (includeHistory) {
            const { data: dbHistory } = await supabase
                .from('weather_history')
                .select('*')
                .order('timestamp', { ascending: false })
                .limit(48);

            if (dbHistory && dbHistory.length > 0) {
                history = dbHistory.map((h: any) => ({
                    time: new Date(h.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
                    wind: h.wind_speed,
                    gust: h.wind_gust,
                    direction: h.wind_direction,
                    temp: h.temperature,
                    tide: h.tide_height || 1.5
                })).reverse();
            }
        }

        // Fleet stats (keep existing logic as it's internal DB)
        let fleetSub = { agua: 1, retorno: 0, pendiente: 2 };
        try {
            const { data: rentals } = await supabase
                .from('reservas_alquiler')
                .select('estado_entrega');

            if (rentals && rentals.length > 0) {
                fleetSub = {
                    agua: rentals.filter((r: any) => r.estado_entrega === 'entregado').length,
                    retorno: rentals.filter((r: any) => r.estado_entrega === 'devuelto').length,
                    pendiente: rentals.filter((r: any) => r.estado_entrega === 'pendiente').length
                };
            }
        } catch (e) {
            console.error('Error fetching fleet stats:', e);
        }

        return NextResponse.json({
            weather,
            seaState,
            fleet: fleetSub,
            alerts: warningAlerts,
            history: history || []
        });
    } catch (error) {
        console.error('Weather API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch weather data' }, { status: 500 });
    }
}

