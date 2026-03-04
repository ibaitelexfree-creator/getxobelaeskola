import { NextResponse } from 'next/server';
import { fetchWeatherData } from '@/lib/weather';
import { fetchSeaState } from '@/lib/puertos-del-estado';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Fetch sea state from centralized library (Puertos del Estado API + Simulation Fallback)
        const seaState = await fetchSeaState();

        let windSpeed = seaState.windSpeed;
        let windDirection = seaState.windDirection;

        // Supplement with more accurate local wind data if available
        try {
            const weather = await fetchWeatherData();
            if (weather) {
                windSpeed = weather.knots;
                windDirection = weather.direction;
            }
        } catch (e) {
            console.warn('Failed to fetch real-time local wind, using sea state fallback', e);
        }

        // Map to snake_case for legacy frontend components
        const data = {
            wave_height: seaState.waveHeight,
            wave_period: seaState.period,
            water_temp: seaState.waterTemp,
            wind_speed: windSpeed,
            wind_direction: windDirection,
            timestamp: seaState.timestamp,
            is_simulated: seaState.isSimulated
        };

        return NextResponse.json(data);
    } catch (error) {
        console.error('Sea State API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch sea state data' }, { status: 500 });
    }
}
