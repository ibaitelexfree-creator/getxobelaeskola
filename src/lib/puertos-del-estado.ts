import { addMinutes, startOfDay, endOfDay } from 'date-fns';

export interface TidePrediction {
    time: Date;
    height: number;
    type: 'HIGH' | 'LOW';
}

export interface TideState {
    height: number;
    trend: 'RISING' | 'FALLING';
    percentage: number; // 0 to 1 (Low to High)
    nextTide: TidePrediction;
}

// Bilbao approximate harmonic constants (simplified for simulation)
// M2 Constituent (Moon)
const TIDE_PERIOD_MINUTES = 12 * 60 + 25.2; // 12h 25m
const AMPLITUDE = 1.5; // meters (approx range 3m)
const MEAN_LEVEL = 2.5; // meters

// Reference High Tide: Random recent date known to be high tide or just an arbitrary point
// Let's pick a reference point: Jan 1, 2024 at 03:00 AM (Approximate)
const REFERENCE_DATE = new Date('2024-01-01T03:00:00Z');

export function getTidePredictions(date: Date): TidePrediction[] {
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);

    const predictions: TidePrediction[] = [];

    // Find the first high tide before or at the start of the day
    let currentEventTime = new Date(REFERENCE_DATE);

    // Adjust to be near the target date
    const diffTime = dayStart.getTime() - REFERENCE_DATE.getTime();
    const periods = Math.floor(diffTime / (TIDE_PERIOD_MINUTES * 60 * 1000 / 2)); // Half periods (High -> Low -> High)

    // Move closer
    currentEventTime = addMinutes(currentEventTime, periods * (TIDE_PERIOD_MINUTES / 2));

    // Ensure we start a bit before
    currentEventTime = addMinutes(currentEventTime, -TIDE_PERIOD_MINUTES);

    let isHigh = periods % 2 === 0; // If even half-periods passed, type is same as reference (High)

    // Generate events for the day covering 24h + buffer
    while (currentEventTime <= dayEnd) {
        if (currentEventTime >= dayStart) {
            predictions.push({
                time: new Date(currentEventTime),
                height: isHigh ? MEAN_LEVEL + AMPLITUDE : MEAN_LEVEL - AMPLITUDE,
                type: isHigh ? 'HIGH' : 'LOW'
            });
        }

        // Next event (High -> Low or Low -> High) is half a period away
        currentEventTime = addMinutes(currentEventTime, TIDE_PERIOD_MINUTES / 2);
        isHigh = !isHigh;
    }

    return predictions;
}

export function getTideLevel(date: Date): number {
    const timeDiff = date.getTime() - REFERENCE_DATE.getTime();
    // Simple sinusoidal wave: h(t) = Mean + Amplitude * cos(2 * pi * t / Period)
    // t is in milliseconds, Period is in milliseconds
    const periodMs = TIDE_PERIOD_MINUTES * 60 * 1000;
    const phase = (2 * Math.PI * timeDiff) / periodMs;

    return MEAN_LEVEL + AMPLITUDE * Math.cos(phase);
}

export function getTideState(date: Date): TideState {
    const currentHeight = getTideLevel(date);

    // To determine trend, check a small delta
    const nextHeight = getTideLevel(addMinutes(date, 1));
    const trend = nextHeight > currentHeight ? 'RISING' : 'FALLING';

    const minHeight = MEAN_LEVEL - AMPLITUDE;
    const maxHeight = MEAN_LEVEL + AMPLITUDE;
    const percentage = (currentHeight - minHeight) / (maxHeight - minHeight);

    const predictions = getTidePredictions(date);
    // Find next prediction
    const nextTide = predictions.find(p => p.time > date) || predictions[0]; // Fallback

    return {
        height: currentHeight,
        trend,
        percentage,
        nextTide
    };
}
