/**
 * Converts degrees to radians
 */
export function deg2rad(deg: number): number {
	return deg * (Math.PI / 180);
}

/**
 * Converts radians to degrees
 */
export function rad2deg(rad: number): number {
	return rad * (180 / Math.PI);
}

/**
 * Normalizes an angle to [0, 360) range.
 * Useful for compass headings.
 */
export function normalizeAngle360(angle: number): number {
	let result = angle % 360;
	if (result < 0) result += 360;
	return result;
}

/**
 * Normalizes an angle to [-180, 180] range.
 * Useful for relative angles (like AWA or rudder angle).
 */
export function normalizeAngle180(angle: number): number {
	let result = normalizeAngle360(angle);
	if (result > 180) result -= 360;
	return result;
}

/**
 * Calculates the smallest difference between two angles.
 * Returns value in range [-180, 180].
 * Positive means 'target' is clockwise from 'source'.
 */
export function angleDifference(target: number, source: number): number {
	return normalizeAngle180(target - source);
}
