
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
const BUOY_ID = '2630';
const BUOY_NAME = 'Bilbao-Vizcaya';

// Fallback mock data generator based on season and typical Cantabrian sea conditions
function getSimulatedSeaState(): SeaStateData {
    const now = new Date();
    const month = now.getMonth(); // 0-11

    // Winter (Nov-Mar): Rougher seas, higher waves
    const isWinter = month >= 10 || month <= 2;

    // Base values
    let baseWaveHeight = isWinter ? 2.5 : 1.0;
    let basePeriod = isWinter ? 10 : 7;
    let baseWaterTemp = isWinter ? 13 : 20;
    let baseWindSpeed = isWinter ? 15 : 8;

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

export async function fetchSeaState(): Promise<SeaStateData> {
    // Currently relying on simulation as the official API requires authentication/tokens
    // that are not available in the context.
    // We return simulated data immediately to avoid performance penalties (latency)
    // on the dashboard weather endpoint.

    /*
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);

        const response = await fetch(`https://bancodatos.puertos.es/TablaAccesoSimplificado/util/get_data.php?station=${BUOY_ID}&name=${BUOY_NAME}`, {
            signal: controller.signal,
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; GetxoBelaEskola/1.0)',
                'Accept': 'application/json'
            },
            next: { revalidate: 1800 }
        });

        clearTimeout(timeoutId);

        if (response.ok) {
            const data = await response.json();
            // TODO: Parse real data when endpoint is confirmed working
            // return mapApiData(data);
        }
    } catch (error) {
        console.warn('Sea state API unreachable');
    }
    */

    return getSimulatedSeaState();
}
