import { NextResponse } from 'next/server';
import { fetchSeaState } from '@/lib/puertos-del-estado';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const seaState = await fetchSeaState();

        const data = {
            wave_height: seaState.waveHeight,
            wave_period: seaState.period,
            water_temp: seaState.waterTemp,
            wind_speed: seaState.windSpeed,
            wind_direction: seaState.windDirection,
            timestamp: seaState.timestamp,
            is_simulated: seaState.isSimulated
        };

        return NextResponse.json(data);
    } catch (error) {
        console.error('Sea State API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch sea state data' }, { status: 500 });
    }
}
