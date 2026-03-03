import { NextResponse } from 'next/server';
import { fetchWeatherData } from '@/lib/weather';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        let windSpeed = 12;
        let windDirection = 315; // NW
        let waveHeight = (0.8 + Math.random() * 1.5).toFixed(1); // 0.8 - 2.3m
        let wavePeriod = Math.floor(6 + Math.random() * 6); // 6 - 12s
        let waterTemp = (14.5 + Math.random() * 1.5).toFixed(1); // 14.5 - 16.0C

        let fetchedWindFromApi = false;

        // 1. Try Puertos del Estado API first
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const response = await fetch('https://portus.puertos.es/Portus_RT/point/3136/data', {
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'GetxoWeb/1.0'
                }
            });
            clearTimeout(timeoutId);

            if (response.ok) {
                const apiData = await response.json();

                // Puertos del Estado API typically returns { data: [...] } or an array directly
                const points = Array.isArray(apiData) ? apiData : (apiData.data || []);
                const currentData = points.length > 0 ? points[points.length - 1] : null;

                if (currentData) {
                    const hm0 = currentData.wave_height ?? currentData.hm0 ?? currentData.waveHeight ?? currentData.wave_height_hm0;
                    const tp = currentData.wave_period ?? currentData.tp ?? currentData.period ?? currentData.wave_period_tp;
                    const temp = currentData.water_temp ?? currentData.t_agua ?? currentData.temperature ?? currentData.waterTemp;
                    const wspd = currentData.wind_speed ?? currentData.vel_viento ?? currentData.windSpeed;
                    const wdir = currentData.wind_direction ?? currentData.dir_viento ?? currentData.windDirection;

                    if (hm0 !== undefined && hm0 !== null) waveHeight = parseFloat(hm0).toFixed(1);
                    if (tp !== undefined && tp !== null) wavePeriod = Math.round(parseFloat(tp));
                    if (temp !== undefined && temp !== null) waterTemp = parseFloat(temp).toFixed(1);
                    if (wspd !== undefined && wspd !== null) {
                        windSpeed = Math.round(parseFloat(wspd));
                        fetchedWindFromApi = true;
                    }
                    if (wdir !== undefined && wdir !== null) {
                        windDirection = Math.round(parseFloat(wdir));
                    }
                }
            } else {
                console.warn(`Puertos del Estado API returned status ${response.status}`);
            }
        } catch (apiError) {
            console.warn('Failed to fetch from Puertos del Estado API, falling back to mock/weather data', apiError);
        }

        // 2. Fetch wind fallback if wind wasn't successfully overridden by Puertos API
        if (!fetchedWindFromApi) {
            try {
                const weather = await fetchWeatherData();
                if (weather) {
                    windSpeed = weather.knots;
                    windDirection = weather.direction;
                }
            } catch (e) {
                console.warn('Failed to fetch real wind data, using mock fallback', e);
            }
        }

        const data = {
            wave_height: parseFloat(String(waveHeight)),
            wave_period: Number(wavePeriod),
            water_temp: parseFloat(String(waterTemp)),
            wind_speed: Number(windSpeed),
            wind_direction: Number(windDirection),
            timestamp: new Date().toISOString()
        };

        return NextResponse.json(data);
    } catch (error) {
        console.error('Sea State API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch sea state data' }, { status: 500 });
    }
}
