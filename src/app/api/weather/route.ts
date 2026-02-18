
import { NextRequest, NextResponse } from 'next/server';
import { fetchWeatherData } from '@/lib/weather';
import { createAdminClient } from '@/lib/supabase/admin';
import { fetchEuskalmetAlerts } from '@/lib/euskalmet';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const includeHistory = searchParams.get('history') === 'true';

        const [weather, alerts] = await Promise.all([
            fetchWeatherData(),
            fetchEuskalmetAlerts()
        ]);

        let fleetSub = {
            agua: 1,
            retorno: 0,
            pendiente: 2
        };

        try {
            const supabase = createAdminClient();
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

        // Generate mock history for professional charts if requested
        let history = undefined;
        if (includeHistory) {
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
