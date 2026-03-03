import { deg2rad } from "./angleUtils";
import { PHYSICS_CONSTANTS } from "./constants";

/**
 * Calculates the Lift Coefficient (Cl) based on Angle of Attack (AoA).
 * AoA is in degrees.
 * Cl is dimensionless (typically 0.0 - 2.0).
 */
export function getLiftCoefficient(aoa: number): number {
	const absAoa = Math.abs(aoa);

	// 1. Luffing Zone (0 - 5 degrees)
	// Sail is flapping, no meaningful lift.
	if (absAoa < 5) return 0;

	// 2. Stall Zone (> 25 degrees)
	// Flow separation, lift drops dramatically.
	if (absAoa > PHYSICS_CONSTANTS.STALL_START_AOA) {
		// Simple linear decay for stall (could be more complex)
		// Drops to 0.5 flat plate lift
		return 0.5;
	}

	// 3. Linear / Power Zone (5 - 25 degrees)
	// Peak at OPTIMAL_AOA (15)
	// We use sin(2 * alpha) approximation scaled by MAX_LIFT
	// This gives a nice curve that peaks around 22 degrees in pure math,
	// but we clamp/shape it to peak at 15-20.

	// Normalized input 0..1 for the range 0..30
	const normalized = absAoa / 30;

	// Sin(PI * normalized) peaks at 0.5 (15 degrees)
	return Math.sin(normalized * Math.PI) * PHYSICS_CONSTANTS.MAX_LIFT_COEFF;
}

/**
 * Calculates the Drag Coefficient (Cd) based on AoA and Cl.
 * Drag = Parasitic + Induced.
 */
export function getDragCoefficient(aoa: number, cl: number): number {
	const absAoa = Math.abs(aoa);

	// 1. Stalled Drag
	if (absAoa > PHYSICS_CONSTANTS.STALL_START_AOA) {
		return PHYSICS_CONSTANTS.STALL_DRAG_COEFF;
	}

	// 2. Induced Drag formula: Cd = Cd0 + (Cl^2 / (PI * AR * e))
	// Use simplified game constant.
	const inducedDrag = cl * cl * 0.1;

	return PHYSICS_CONSTANTS.MIN_DRAG_COEFF + inducedDrag;
}

export function detectLuffing(aoa: number): boolean {
	return Math.abs(aoa) < 5;
}

export function detectStall(aoa: number): boolean {
	return Math.abs(aoa) > PHYSICS_CONSTANTS.STALL_START_AOA;
}
