export interface SeaStateData {
    waveHeight: number; // in meters
    period: number; // in seconds
    waterTemp: number; // in Celsius
    windSpeed: number; // in knots
    windDirection: number; // in degrees
    timestamp: string;
    isSimulated: boolean;
}

// Bilbao-Vizcaya Buoy (3136)
const PUERTOS_API_URL = 'https://portus.puertos.es/Portus_RT/point/3136/data';

// Fallback mock data generator based on season and typical Cantabrian sea conditions
function getSimulatedSeaState(): SeaStateData {
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
 * Fetches real sea state data from Puertos del Estado.
 * Falls back to simulation if the API is unavailable.
 */
export async function fetchSeaState(): Promise<SeaStateData> {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

        const response = await fetch(PUERTOS_API_URL, {
            signal: controller.signal,
            // @ts-ignore
            next: { revalidate: 1800 }
        } as any);

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`Puertos del Estado API error: ${response.status}`);
        }

        const data = await response.json();

        // The Puertos del Estado API typically returns an array of measurements
        // or an object with specific keys in Spanish.
        // If it's an array, we take the most recent one.
        const measurement = Array.isArray(data) ? data[0] : data;

        if (!measurement) throw new Error('No measurement data found');

        // Mapping logic: Looking for common Spanish keys in Puertos del Estado API
        // Examples: "Altura de ola significante", "Periodo de pico", "Temperatura del agua"
        // or shorter keys like "Hs", "Tp", "T"
        const waveHeight = measurement["Altura de ola significante"] || measurement["Hs"] || measurement["altura_ola"];
        const period = measurement["Periodo de pico"] || measurement["Tp"] || measurement["periodo_ola"];
        const waterTemp = measurement["Temperatura del agua"] || measurement["T"] || measurement["temperatura_agua"];

        // If we have at least wave height, we consider it a success
        if (waveHeight !== undefined && !isNaN(parseFloat(waveHeight))) {
            return {
                waveHeight: parseFloat(waveHeight),
                period: parseFloat(period) || 8,
                waterTemp: parseFloat(waterTemp) || 15,
                // Wind data is usually better from local stations (Euskalmet/Unisono),
                // but we can map it if available as secondary fallback.
                windSpeed: parseFloat(measurement["Velocidad del viento"] || measurement["Wv"]) || 0,
                windDirection: parseFloat(measurement["Dirección del viento"] || measurement["Wd"]) || 0,
                timestamp: measurement["fecha"] || new Date().toISOString(),
                isSimulated: false
            };
        }

        throw new Error('Required fields missing from API response');

    } catch (error) {
        console.warn('Failed to fetch real sea state, using simulation:', error);
        return getSimulatedSeaState();
    }
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
        height: level,
        trend,
        percentage: Math.max(0, Math.min(1, percentage))
    };
}
