
import { NextRequest, NextResponse } from 'next/server';
import { fetchWeatherData } from '@/lib/weather';
import { createAdminClient } from '@/lib/supabase/admin';
import { fetchEuskalmetAlerts } from '@/lib/euskalmet';

export const dynamic = 'force-dynamic';

// In-memory cache for weather data (expires in 5 minutes)
let cachedWeather: any = null;
let cachedAlerts: any = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const includeHistory = searchParams.get('history') === 'true';

        const now = Date.now();
        let weather, alerts;

        if (cachedWeather && cachedAlerts && (now - lastFetchTime < CACHE_DURATION)) {
            weather = cachedWeather;
            alerts = cachedAlerts;
        } else {
            [weather, alerts] = await Promise.all([
                fetchWeatherData(),
                fetchEuskalmetAlerts()
            ]);
            cachedWeather = weather;
            cachedAlerts = alerts;
            lastFetchTime = now;
        }

        const supabase = createAdminClient();

        // 1. Data Collection: Save snapshot to history (max once every 15 mins)
        try {
            // Only try if we have valid weather data
            if (weather && weather.knots !== undefined) {
                // Check last entry time
                const { data: lastEntry } = await supabase
                    .from('weather_history')
                    .select('timestamp')
                    .order('timestamp', { ascending: false })
                    .limit(1)
                    .single();

                const now = new Date();
                const shouldSave = !lastEntry ||
                    (now.getTime() - new Date(lastEntry.timestamp).getTime() > 15 * 60 * 1000);

                if (shouldSave) {
                    await supabase.from('weather_history').insert({
                        station: weather.station,
                        wind_speed: weather.knots,
                        wind_gust: weather.gusts || weather.knots,
                        wind_direction: weather.direction,
                        temperature: weather.temp,
                        timestamp: now.toISOString()
                    });
                }
            }
        } catch (e) {
            // Silently fail if table doesn't exist yet
            console.warn('Weather history persistence skipped (table might not exist)');
        }

        let fleetSub = {
            agua: 1,
            retorno: 0,
            pendiente: 2
        };

        try {
            const { data: rentals } = await supabase
                .from('reservas_alquiler')
                .select('estado_entrega');

            if (rentals) {
                fleetSub = {
                    agua: rentals.filter(r => r.estado_entrega === 'entregado').length,
                    retorno: rentals.filter(r => r.estado_entrega === 'devuelto').length,
                    pendiente: rentals.filter(r => r.estado_entrega === 'pendiente').length
                };

                if (fleetSub.agua === 0 && fleetSub.pendiente === 0) {
                    fleetSub = { agua: 1, retorno: 0, pendiente: 2 };
                }
            }
        } catch (e) {
            console.error('Error fetching fleet stats:', e);
        }

        // Filter alerts (only yellow/orange/red)
        const warningAlerts = (alerts || []).filter((a: any) =>
            a.level && !['verde', 'green', 'null'].includes(a.level.toLowerCase())
        );

        // 2. Fetch History from DB or Fallback to mock
        let history = undefined;
        if (includeHistory) {
            try {
                const { data: dbHistory, error: historyError } = await supabase
                    .from('weather_history')
                    .select('*')
                    .order('timestamp', { ascending: false })
                    .limit(48); // Last 12 hours if 15min intervals

                if (dbHistory && dbHistory.length > 0) {
                    // Map DB results to UI format
                    history = dbHistory.map(h => ({
                        time: new Date(h.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
                        wind: h.wind_speed,
                        gust: h.wind_gust,
                        direction: h.wind_direction,
                        temp: h.temperature,
                        tide: h.tide_height || 1.5 // Fallback if not available
                    })).reverse(); // Oldest first for charts
                }
            } catch (e) {
                console.warn('Falling back to mock history');
            }

            // Fallback to mock if DB empty or error
            if (!history) {
                const now = new Date();
                history = Array.from({ length: 24 }).map((_, i) => {
                    const hour = new Date(now.getTime() - (23 - i) * 3600000);
                    const baseWind = 10 + Math.sin(i / 3) * 5 + Math.random() * 3;
                    return {
                        time: `${hour.getHours().toString().padStart(2, '0')}:00`,
                        wind: Math.round(baseWind),
                        gust: Math.round(baseWind * (1.2 + Math.random() * 0.4)),
                        direction: Math.round((280 + Math.sin(i / 5) * 40 + Math.random() * 20) % 360),
                        temp: Math.round(14 + Math.cos(i / 10) * 4),
                        tide: 1.5 + Math.sin(i / 4) * 1.2
                    };
                });
            }
        }

        return NextResponse.json({
            weather,
            fleet: fleetSub,
            alerts: warningAlerts,
            history
        });
    } catch (error) {
        console.error('Weather API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch weather data' }, { status: 500 });
    }
}
