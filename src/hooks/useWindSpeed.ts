'use client';

import { useState, useEffect } from 'react';
import { WeatherService } from '@/lib/academy/weather-service';

/**
 * Hook to fetch and refresh wind speed every 10 minutes.
 */
export function useWindSpeed(refreshIntervalMs = 600000) {
    const [windSpeed, setWindSpeed] = useState<number>(0);

    useEffect(() => {
        const fetchWind = async () => {
            try {
                const data = await WeatherService.getGetxoWeather();
                if (data.windSpeed !== undefined) {
                    setWindSpeed(data.windSpeed);
                }
            } catch (e: unknown) {
                console.error('Weather fetch error in useWindSpeed', e);
            }
        };

        fetchWind();
        const interval = setInterval(fetchWind, refreshIntervalMs);

        return () => clearInterval(interval);
    }, [refreshIntervalMs]);

    return windSpeed;
}
