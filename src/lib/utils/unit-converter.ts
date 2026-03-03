
export type SpeedUnit = 'knots' | 'kmh' | 'ms';
export type DistanceUnit = 'feet' | 'meters' | 'nautical_miles' | 'km' | 'fathoms';
export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type PressureUnit = 'hpa' | 'mb' | 'inhg';

// Conversion factors
const KNOTS_TO_KMH = 1.852;
const KNOTS_TO_MS = 0.514444;
const FEET_TO_METERS = 0.3048;
const NAUTICAL_MILE_TO_KM = 1.852;
const FATHOM_TO_METERS = 1.8288;
const HPA_TO_INHG = 0.0295299830714; // More precise

export const convertSpeed = (value: number, from: SpeedUnit, to: SpeedUnit): number => {
    if (from === to) return value;
    let inKnots = value;
    // Convert to base unit (knots)
    if (from === 'kmh') inKnots = value / KNOTS_TO_KMH;
    else if (from === 'ms') inKnots = value / KNOTS_TO_MS;

    // Convert from base unit (knots) to target
    if (to === 'kmh') return inKnots * KNOTS_TO_KMH;
    if (to === 'ms') return inKnots * KNOTS_TO_MS;
    return inKnots;
};

export const convertDistance = (value: number, from: DistanceUnit, to: DistanceUnit): number => {
    if (from === to) return value;
    let inMeters = value;

    // Convert to base unit (meters)
    switch (from) {
        case 'feet': inMeters = value * FEET_TO_METERS; break;
        case 'nautical_miles': inMeters = value * NAUTICAL_MILE_TO_KM * 1000; break;
        case 'km': inMeters = value * 1000; break;
        case 'fathoms': inMeters = value * FATHOM_TO_METERS; break;
    }

    // Convert from base unit (meters) to target
    switch (to) {
        case 'feet': return inMeters / FEET_TO_METERS;
        case 'nautical_miles': return inMeters / (NAUTICAL_MILE_TO_KM * 1000);
        case 'km': return inMeters / 1000;
        case 'fathoms': return inMeters / FATHOM_TO_METERS;
        case 'meters': return inMeters;
    }
    return inMeters;
};

export const convertTemperature = (value: number, from: TemperatureUnit, to: TemperatureUnit): number => {
    if (from === to) return value;
    if (from === 'celsius' && to === 'fahrenheit') return (value * 9/5) + 32;
    if (from === 'fahrenheit' && to === 'celsius') return (value - 32) * 5/9;
    return value;
};

export const convertPressure = (value: number, from: PressureUnit, to: PressureUnit): number => {
    if (from === to) return value;
    // hPa and mb are numerically equivalent (1 hPa = 1 mb)
    if ((from === 'hpa' && to === 'mb') || (from === 'mb' && to === 'hpa')) return value;

    let inHpa = value;
    if (from === 'inhg') inHpa = value / HPA_TO_INHG;
    // mb is same as hpa

    if (to === 'inhg') return inHpa * HPA_TO_INHG;

    return inHpa;
};
