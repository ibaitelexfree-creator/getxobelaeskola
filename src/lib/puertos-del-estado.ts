export interface SeaStateData {
    waveHeight: number; // in meters
    period: number; // in seconds
    waterTemp: number; // in Celsius
    windSpeed: number; // in knots
    windDirection: number; // in degrees
    timestamp: string;
    isSimulated: boolean;
}

// Bilbao-Vizcaya Buoy (3136) - Real Data from Puertos del Estado
const STATION_ID = '3136';
const API_URL = `https://portus.puertos.es/portussvr/api/lastData/station/${STATION_ID}?locale=es`;

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

export async function fetchSeaState(): Promise<SeaStateData> {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(['WIND', 'WAVE', 'WATER_TEMP']),
            next: { revalidate: 300 } // Cache for 5 minutes
        });

        if (!response.ok) {
            throw new Error(`Puertos del Estado API error: ${response.status}`);
        }

        const data = await response.json();

        // Helper to find variable value in the complex API response
        const findValue = (groupName: string, varName: string): number | null => {
            const group = data.find((g: any) => g.variable === groupName);
            if (!group || !group.datos) return null;

            const variable = group.datos.find((v: any) => v.nombreVariable.includes(varName));
            if (!variable || variable.valor === undefined || variable.factor === undefined) return null;

            return variable.valor / variable.factor;
        };

        const waveHeight = findValue('WAVE', 'Altura_Significativa');
        const wavePeriod = findValue('WAVE', 'Periodo_Pico');
        const waterTemp = findValue('WATER_TEMP', 'Temperatura_del_Agua');
        const windSpeedMs = findValue('WIND', 'Velocidad_del_Viento');
        const windDirection = findValue('WIND', 'Direccion_del_Viento');

        if (waveHeight === null || waterTemp === null) {
            console.warn('Incomplete data from Puertos del Estado, using simulation');
            return getSimulatedSeaState();
        }

        return {
            waveHeight: parseFloat(waveHeight.toFixed(2)),
            period: Math.round(wavePeriod || 0),
            waterTemp: parseFloat(waterTemp.toFixed(1)),
            windSpeed: windSpeedMs ? parseFloat((windSpeedMs * 1.94384).toFixed(1)) : 0,
            windDirection: Math.round(windDirection || 0),
            timestamp: new Date().toISOString(),
            isSimulated: false
        };
    } catch (error) {
        console.error('Failed to fetch sea state from API:', error);
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
