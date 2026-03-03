export interface SeaStateData {
    waveHeight: number; // in meters
    period: number; // in seconds
    waterTemp: number; // in Celsius
    windSpeed: number; // in knots
    windDirection: number; // in degrees
    timestamp: string;
    isSimulated: boolean;
}

// Bilbao-Vizcaya Buoy (2630) - Deep Water
// Coastal Point (3136) - Getxo/Bilbao

/**
 * Fetches real-time sea state from Puertos del Estado API.
 * Includes a robust parser and graceful fallback to simulated data.
 */
export async function fetchSeaState(): Promise<SeaStateData> {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const res = await fetch('https://portus.puertos.es/Portus_RT/point/3136/data', {
            signal: controller.signal,
            next: { revalidate: 1800 } // 30 minutes cache
        } as RequestInit); // Casting to handle potential type differences in custom environments

        clearTimeout(timeoutId);

        if (res.ok) {
            const data = await res.json();

            // Puertos del Estado often returns an array of measurements
            if (Array.isArray(data) && data.length > 0) {
                const latest = data[data.length - 1]; // Usually last is most recent

                if (latest) {
                    // Puertos del Estado field mapping (defensive)
                    // Hm0: Significant Wave Height
                    // Tp: Peak Period
                    // water_temp: Water Temperature
                    const waveHeight = latest.Hm0 ?? latest.wave_height ?? latest.height ?? 1.2;
                    const period = latest.Tp ?? latest.period ?? latest.wave_period ?? 8;
                    const waterTemp = latest.water_temp ?? latest.temp ?? 16;

                    return {
                        waveHeight: parseFloat(Number(waveHeight).toFixed(2)),
                        period: Math.round(Number(period)),
                        waterTemp: parseFloat(Number(waterTemp).toFixed(1)),
                        windSpeed: latest.wind_speed ?? 10,
                        windDirection: latest.wind_direction ?? 0,
                        timestamp: latest.timestamp ?? new Date().toISOString(),
                        isSimulated: false
                    };
                }
            }
        }
    } catch (error) {
        console.warn('Puertos del Estado API unavailable, using simulation:', error);
    }

    return getSimulatedSeaState();
}

// Fallback mock data generator based on season and typical Cantabrian sea conditions
export function getSimulatedSeaState(): SeaStateData {
    const now = new Date();
    const month = now.getMonth(); // 0-11

    // Winter (Nov-Mar): Rougher seas, higher waves
    const isWinter = month >= 10 || month <= 2;

    // Base values
    const baseWaveHeight = isWinter ? 2.5 : 1.0;
    const basePeriod = isWinter ? 10 : 7;
    const baseWaterTemp = isWinter ? 13 : 20;
    const baseWindSpeed = isWinter ? 15 : 8;

    // Add randomness
    const waveHeight = parseFloat((baseWaveHeight + (Math.random() * 1.5 - 0.5)).toFixed(2));
    const period = Math.round(basePeriod + (Math.random() * 4 - 2));
    const waterTemp = parseFloat((baseWaterTemp + (Math.random() * 2 - 1)).toFixed(1));
    const windSpeed = Math.round(baseWindSpeed + (Math.random() * 10 - 3));
    const windDirection = Math.round(Math.random() * 360);

    return {
        waveHeight: Math.max(0.5, waveHeight),
        period: Math.max(4, period),
        waterTemp: Math.max(10, Math.min(25, waterTemp)),
        windSpeed: Math.max(0, windSpeed),
        windDirection,
        timestamp: now.toISOString(),
        isSimulated: true
    };
}

/**
 * Returns tide predictions for a given date.
 * Currently simulated for Getxo area.
 */
export function getTidePredictions(date: Date = new Date()): any[] {
    const predictions: any[] = [];
    const day = new Date(date);
    day.setHours(0, 0, 0, 0);

    // 4 tides per day approx (every ~6 hours)
    for (let i = 0; i < 4; i++) {
        const time = new Date(day);
        time.setHours(i * 6 + 2); // Offset
        predictions.push({
            time: time.toISOString(),
            height: 2.5 + Math.sin(i * Math.PI / 2) * 1.5,
            type: i % 2 === 0 ? 'High' : 'Low'
        });
    }
    return predictions;
}

/**
 * Returns simulated tide level for a specific time.
 */
export function getTideLevel(date: Date = new Date()): number {
    const hours = date.getHours() + date.getMinutes() / 60;
    // Simple 12.4h cycle approximation
    return 2.5 + Math.sin((hours / 12.4) * 2 * Math.PI) * 1.5;
}

/**
 * Returns simulated tide state summary.
 */
export function getTideState(date: Date = new Date()): any {
    const level = getTideLevel(date);
    const nextLevel = getTideLevel(new Date(date.getTime() + 30 * 60000));
    const trend = nextLevel > level ? 'rising' : 'falling';

    // Normalize level to 0-1 range [1.0, 4.0]
    const percentage = (level - 1.0) / 3.0;

    return {
        height: parseFloat(level.toFixed(2)),
        trend,
        percentage: Math.max(0, Math.min(1, percentage))
    };
}
