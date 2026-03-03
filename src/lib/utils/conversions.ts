export const KNOTS_TO_KMH = 1.852;
export const KNOTS_TO_MS = 0.514444;
export const MS_TO_KMH = 3.6;

// Speed
export function knotsToKmh(knots: number): number {
	return knots * KNOTS_TO_KMH;
}

export function kmhToKnots(kmh: number): number {
	return kmh / KNOTS_TO_KMH;
}

export function knotsToMs(knots: number): number {
	return knots * KNOTS_TO_MS;
}

export function msToKnots(ms: number): number {
	return ms / KNOTS_TO_MS;
}

export function msToKmh(ms: number): number {
	return ms * MS_TO_KMH;
}

export function kmhToMs(kmh: number): number {
	return kmh / MS_TO_KMH;
}

// Distance
export function feetToMeters(feet: number): number {
	return feet * 0.3048;
}

export function metersToFeet(meters: number): number {
	return meters / 0.3048;
}

export function nauticalMilesToKm(nm: number): number {
	return nm * 1.852;
}

export function kmToNauticalMiles(km: number): number {
	return km / 1.852;
}

// Depth
export function fathomsToMeters(fathoms: number): number {
	return fathoms * 1.8288;
}

export function metersToFathoms(meters: number): number {
	return meters / 1.8288;
}

// Temperature
export function celsiusToFahrenheit(c: number): number {
	return (c * 9) / 5 + 32;
}

export function fahrenheitToCelsius(f: number): number {
	return ((f - 32) * 5) / 9;
}

// Pressure
// hPa is equivalent to mb
export function hpaToInHg(hpa: number): number {
	return hpa * 0.02953;
}

export function inHgToHpa(inHg: number): number {
	return inHg / 0.02953;
}

export function mbToInHg(mb: number): number {
	return mb * 0.02953;
}

export function inHgToMb(inHg: number): number {
	return inHg / 0.02953;
}
