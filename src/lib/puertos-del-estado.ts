
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

// ----------------------------------------------------------------------
// Tide Simulation Logic (Restored)
// ----------------------------------------------------------------------

export interface TidePrediction {
    time: Date;
    height: number;
    type: 'HIGH' | 'LOW';
}

export interface TideState {
    height: number;
    trend: 'RISING' | 'FALLING';
    percentage: number; // 0-1 (low to high)
    nextHigh: Date;
    nextLow: Date;
}

// M2 Tidal Constituent (Principal Lunar Semidiurnal)
// Period: 12.42 hours
const M2_PERIOD_HOURS = 12.4206012;
const M2_AMPLITUDE = 1.5; // meters (approx for Bilbao)
const MEAN_SEA_LEVEL = 2.5; // meters

// Epoch for M2 phase calculation (arbitrary reference)
const TIDE_EPOCH = new Date('2024-01-01T00:00:00Z').getTime();

/**
 * Calculates the tide height at a specific date using a simplified harmonic model (M2 only).
 * h(t) = Mean + Amplitude * cos(2 * PI * (t - epoch) / period)
 */
export function getTideLevel(date: Date): number {
    const t = date.getTime();
    const hoursSinceEpoch = (t - TIDE_EPOCH) / (1000 * 3600);
    const phase = (hoursSinceEpoch % M2_PERIOD_HOURS) / M2_PERIOD_HOURS;
    const angle = phase * 2 * Math.PI;

    // Cosine wave: 1 at high tide, -1 at low tide
    return MEAN_SEA_LEVEL + M2_AMPLITUDE * Math.cos(angle);
}

/**
 * Generates high and low tide predictions for a given day.
 */
export function getTidePredictions(date: Date): TidePrediction[] {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const predictions: TidePrediction[] = [];
    const periodMs = M2_PERIOD_HOURS * 3600 * 1000;

    // Find the first high tide relative to epoch
    // High tide happens when cos(angle) = 1, i.e., angle = 0, 2PI, etc.
    // t = epoch + k * period
    // We want to find k such that t is near startOfDay.

    const timeSinceEpoch = startOfDay.getTime() - TIDE_EPOCH;
    const periodsSinceEpoch = timeSinceEpoch / periodMs;

    // Start searching a bit before the day starts to catch any tide right at 00:00
    let k = Math.floor(periodsSinceEpoch) - 1;

    // Search for next 4 peaks/troughs
    for (let i = 0; i < 5; i++) {
        // High tide
        const tHigh = TIDE_EPOCH + (k + i) * periodMs;
        const dHigh = new Date(tHigh);

        if (dHigh >= startOfDay && dHigh <= endOfDay) {
            predictions.push({
                time: dHigh,
                height: MEAN_SEA_LEVEL + M2_AMPLITUDE,
                type: 'HIGH'
            });
        }

        // Low tide (half period offset)
        const tLow = tHigh + (periodMs / 2);
        const dLow = new Date(tLow);

        if (dLow >= startOfDay && dLow <= endOfDay) {
            predictions.push({
                time: dLow,
                height: MEAN_SEA_LEVEL - M2_AMPLITUDE,
                type: 'LOW'
            });
        }
    }

    return predictions.sort((a, b) => a.time.getTime() - b.time.getTime());
}

/**
 * Determines the current state of the tide.
 */
export function getTideState(date: Date): TideState {
    const currentHeight = getTideLevel(date);

    // Calculate a small delta to determine trend
    const futureDate = new Date(date.getTime() + 60000); // +1 minute
    const futureHeight = getTideLevel(futureDate);
    const trend = futureHeight > currentHeight ? 'RISING' : 'FALLING';

    // Percentage (0 = Low Tide, 1 = High Tide)
    // Range is [Mean - Amp, Mean + Amp]
    const min = MEAN_SEA_LEVEL - M2_AMPLITUDE;
    const max = MEAN_SEA_LEVEL + M2_AMPLITUDE;
    const percentage = (currentHeight - min) / (max - min);

    // Find next tides
    const predictions = getTidePredictions(date);
    // If no predictions left today, check tomorrow (simplified for now to just return null/mock if empty,
    // but the getTidePredictions above only returns today's.
    // For robust 'next' finding we'd need to look ahead.
    // For this simulation, let's just create them on the fly.)

    const periodMs = M2_PERIOD_HOURS * 3600 * 1000;
    const t = date.getTime();
    const timeSinceEpoch = t - TIDE_EPOCH;

    // Phase 0 to 1
    const phase = (timeSinceEpoch % periodMs) / periodMs;

    // High tide is at phase 0 (or 1). Low tide is at phase 0.5.
    let timeToNextHigh: number;
    let timeToNextLow: number;

    if (phase < 0.5) {
        // Before low tide
        timeToNextLow = (0.5 - phase) * periodMs;
        timeToNextHigh = (1.0 - phase) * periodMs;
    } else {
        // After low tide
        timeToNextLow = (1.5 - phase) * periodMs;
        timeToNextHigh = (1.0 - phase) * periodMs; // Wait, if phase is 0.8, next high is at 1.0. Correct.
    }

    return {
        height: currentHeight,
        trend,
        percentage: Math.max(0, Math.min(1, percentage)),
        nextHigh: new Date(t + timeToNextHigh),
        nextLow: new Date(t + timeToNextLow)
    };
}
