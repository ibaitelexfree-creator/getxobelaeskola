
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
// const BUOY_NAME = 'Bilbao-Vizcaya'; // Unused in new API

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

interface PortusDataValue {
    id: number;
    nombreParametro: string;
    nombreColumna: string;
    paramEseoo: string;
    valor: string;
    factor: number;
    unidad: string;
    paramQC: boolean;
    variable: string;
    averia: boolean;
}

interface PortusResponse {
    fecha: string;
    datos: PortusDataValue[];
}

function parsePortusData(data: PortusResponse): SeaStateData {
    const { fecha, datos } = data;

    // Helper to find value
    const findValue = (paramEseoo: string): number | null => {
        const item = datos.find(d => d.paramEseoo === paramEseoo && !d.averia);
        if (!item || item.valor === null || item.valor === undefined) return null;
        return parseFloat(item.valor) / item.factor;
    };

    const waveHeight = findValue('Hm0'); // Significant Wave Height
    const period = findValue('Tm02'); // Mean Period
    const waterTemp = findValue('WaterTemp');
    const windSpeedMs = findValue('WindSpeed');
    const windDirection = findValue('WindDir');

    if (waveHeight === null || period === null || waterTemp === null || windSpeedMs === null || windDirection === null) {
        throw new Error('Missing critical data from Portus API');
    }

    // Convert Wind Speed m/s to knots
    const windSpeed = parseFloat((windSpeedMs * 1.94384).toFixed(1));

    // Parse date: "2026-02-23 14:00:00.0" -> "2026-02-23T14:00:00.0Z"
    // Assuming the timestamp is in UTC as commonly provided by scientific buoys
    const timestamp = fecha.replace(' ', 'T') + 'Z';

    return {
        waveHeight,
        period,
        waterTemp,
        windSpeed,
        windDirection,
        timestamp,
        isSimulated: false
    };
}

export async function fetchSeaState(): Promise<SeaStateData> {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

        const response = await fetch(`https://portus.puertos.es/portussvr/api/lastData/station/${BUOY_ID}?locale=es`, {
            method: 'POST',
            signal: controller.signal,
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; GetxoBelaEskola/1.0)',
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(["WIND", "WAVE", "WATER_TEMP"]),
            // @ts-ignore - Next.js extension
            next: { revalidate: 1800 } // Cache for 30 minutes
        });

        clearTimeout(timeoutId);

        if (response.ok) {
            const data: PortusResponse = await response.json();
            return parsePortusData(data);
        } else {
             console.warn(`Sea state API returned ${response.status}: ${response.statusText}`);
        }
    } catch (error) {
        console.warn('Sea state API unreachable or parsing error:', error);
    }

    return getSimulatedSeaState();
}
