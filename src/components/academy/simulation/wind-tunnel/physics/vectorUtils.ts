import { Vector2D } from '../types';
import { deg2rad, rad2deg } from './angleUtils';

/**
 * Converts polar coordinates to Cartesian vector.
 * 0 degrees = North (Up, -Y), 90 degrees = East (Right, +X)
 * This aligns with navigation convention but swaps standard trig Y axis.
 */
export function polarToCartesian(magnitude: number, angleDeg: number): Vector2D {
    // Standard Trig: 0 = East, CCW
    // Navigation: 0 = North, CW
    // Conversion:
    // X = speed * sin(angle)
    // Y = speed * -cos(angle)

    // Check for near-zero magnitude to avoid weird float issues
    if (magnitude < 0.001) return { x: 0, y: 0 };

    const rad = deg2rad(angleDeg);
    return {
        x: magnitude * Math.sin(rad),
        y: magnitude * -Math.cos(rad)
    };
}

/**
 * Converts Cartesian vector to polar coordinates.
 * Returns angle in degrees [0, 360).
 */
export function cartesianToPolar(v: Vector2D): { magnitude: number; angle: number } {
    const magnitude = Math.sqrt(v.x * v.x + v.y * v.y);

    if (magnitude < 0.001) {
        return { magnitude: 0, angle: 0 };
    }

    // Standard atan2(y, x) gives angle from East CCW
    // We want North CW.
    // atan2(x, -y) achieves this (swapping axes logic)
    // x is easting, -y is northing (because y is down)

    const angleRad = Math.atan2(v.x, -v.y);
    let angleDeg = rad2deg(angleRad);

    // Normalize to 0-360
    if (angleDeg < 0) angleDeg += 360;

    return { magnitude, angle: angleDeg };
}

/**
 * Adds two vectors
 */
export function addVectors(v1: Vector2D, v2: Vector2D): Vector2D {
    return { x: v1.x + v2.x, y: v1.y + v2.y };
}

/**
 * Subtracts v2 from v1
 */
export function subtractVectors(v1: Vector2D, v2: Vector2D): Vector2D {
    return { x: v1.x - v2.x, y: v1.y - v2.y };
}
