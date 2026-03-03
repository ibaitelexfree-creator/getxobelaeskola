import { NextResponse } from 'next/server';
import { fetchWeatherData } from '@/lib/weather';
import { fetchSeaState } from '@/lib/puertos-del-estado';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Priority for wind data: Local stations (Getxo/Abra/Euskalmet)
        let windSpeed = 12;
        let windDirection = 315; // NW
        let isLocalWindSuccessful = false;

        try {
            const weather = await fetchWeatherData();
            if (weather) {
                windSpeed = weather.knots;
                windDirection = weather.direction;
                isLocalWindSuccessful = true;
            }
        } catch (e) {
            console.warn('Failed to fetch local wind data', e);
        }

        // Fetch Sea State Data (Wave Height, Period, Water Temp)
        // This calls the official Puertos del Estado API with a simulation fallback.
        const seaState = await fetchSeaState();

        // If local wind data was unavailable, we can use the wind data from the buoy (if real)
        if (!isLocalWindSuccessful && !seaState.isSimulated) {
             if (seaState.windSpeed !== undefined) windSpeed = seaState.windSpeed;
             if (seaState.windDirection !== undefined) windDirection = seaState.windDirection;
        }

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
