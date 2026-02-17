import { NextResponse, NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Coordinates for Getxo (Arriluze)
const LAT = 43.3444;
const LON = -3.0139;

// Global cache to persist across requests (per instance)
let cachedWeather: any = null;
let lastWeatherFetch = 0;
let cachedTides: any = null;
let lastTideFetch = 0;

// OWM: 1000/day = ~1 every 1.4 min. We'll cache for 10 minutes.
const WEATHER_CACHE_MS = 10 * 60 * 1000;

// Stormglass: 10/day. We'll cache for 12 hours.
const TIDE_CACHE_MS = 12 * 60 * 60 * 1000;

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const getHistory = searchParams.get('history') === 'true';
    const supabase = createAdminClient();

    if (getHistory) {
        const { data, error } = await supabase
            .from('weather_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(24);

        if (error) {
            console.error('Error fetching weather history:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Format for rich meteogram visualization
        const history = data.reverse().map(log => ({
            time: new Date(log.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
            wind: log.wind_speed,
            gust: log.wind_gust,
            direction: log.wind_direction,
            tide: log.tide_height,
            temp: log.temperature,
            pressure: log.pressure,
            condition: log.condition
        }));

        return NextResponse.json({ history });
    }

    const now = Date.now();

    // Check school hours in Madrid time (UTC+1/UTC+2)
    const madridTime = new Date().toLocaleString("en-US", { timeZone: "Europe/Madrid" });
    const hour = new Date(madridTime).getHours();

    const isSchoolOpen = hour >= 7 && hour < 22;

    // 1. Handle Weather (OpenWeatherMap)
    let weatherData = cachedWeather;
    if (!cachedWeather || (now - lastWeatherFetch > WEATHER_CACHE_MS)) {
        if (isSchoolOpen) {
            try {
                const apiKey = process.env.OPENWEATHERMAP_API_KEY;
                const url = `https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&appid=${apiKey}&units=metric`;
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    weatherData = {
                        windSpeed: Math.round(data.wind.speed * 1.94384), // m/s to knots
                        windGust: data.wind.gust ? Math.round(data.wind.gust * 1.94384) : Math.round(data.wind.speed * 1.94384 * 1.2),
                        windDirection: data.wind.deg,
                        temperature: Math.round(data.main.temp),
                        pressure: data.main.pressure,
                        condition: data.weather[0].main,
                        visibility: Math.round(data.visibility / 1852), // meters to nm
                    };
                    cachedWeather = weatherData;
                    lastWeatherFetch = now;

                    // LOG TO SUPABASE
                    try {
                        await supabase.from('weather_logs').insert({
                            wind_speed: weatherData.windSpeed,
                            wind_gust: weatherData.windGust,
                            wind_direction: weatherData.windDirection,
                            temperature: weatherData.temperature,
                            pressure: weatherData.pressure,
                            visibility: weatherData.visibility,
                            condition: weatherData.condition
                        });
                    } catch (e) {
                        console.error('Logging failed:', e);
                    }
                }
            } catch (error) {
                console.error('Error fetching OWM:', error);
            }
        }
    }

    // 2. Handle Tides (Stormglass)
    let tideData = cachedTides;
    if (!cachedTides || (now - lastTideFetch > TIDE_CACHE_MS)) {
        if (isSchoolOpen) {
            try {
                const apiKey = process.env.STORMGLASS_API_KEY;
                // Fetch extremes for today and tomorrow
                const start = new Date().toISOString();
                const url = `https://api.stormglass.io/v2/tide/extremes/point?lat=${LAT}&lng=${LON}&start=${start}`;
                const res = await fetch(url, {
                    headers: { 'Authorization': apiKey || '' }
                });
                if (res.ok) {
                    const data = await res.json();
                    // Transform Stormglass data to our TideEvent interface
                    const nextTides = data.data.map((t: any) => ({
                        time: new Date(t.time).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid' }),
                        type: t.type === 'high' ? 'high' : 'low',
                        height: t.height
                    })).slice(0, 4);

                    // Calculate current tide status/height (rough estimation as Stormglass extremes only gives peaks)
                    // For now we'll just return the next events and a mock height between the peaks
                    tideData = {
                        nextTides,
                        tideHeight: nextTides[0]?.height || 1.5,
                        tideStatus: nextTides[0]?.type === 'high' ? 'rising' : 'falling'
                    };
                    cachedTides = tideData;
                    lastTideFetch = now;
                }
            } catch (error) {
                console.error('Error fetching Stormglass:', error);
            }
        }
    }

    // Fallback to mock if everything fails or outside hours
    if (!weatherData) {
        weatherData = {
            windSpeed: 10,
            windGust: 14,
            windDirection: 270,
            temperature: 15,
            pressure: 1013,
            condition: 'Clear',
            visibility: 10,
        };
    }

    if (!tideData) {
        tideData = {
            tideHeight: 1.2,
            tideStatus: 'rising',
            nextTides: [
                { time: '18:45', type: 'high', height: 3.2 },
                { time: '01:12', type: 'low', height: 0.8 }
            ]
        };
    }

    return NextResponse.json({
        ...weatherData,
        ...tideData,
        isLive: isSchoolOpen && lastWeatherFetch > 0
    });
}
