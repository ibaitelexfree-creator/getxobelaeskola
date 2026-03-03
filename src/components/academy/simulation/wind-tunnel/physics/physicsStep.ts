import type { WindPhysicsState } from "../types";
import {
	detectLuffing,
	detectStall,
	getDragCoefficient,
	getLiftCoefficient,
} from "./aeroModel";
import { deg2rad, normalizeAngle180, rad2deg } from "./angleUtils";
import { PHYSICS_CONSTANTS } from "./constants";
import { resolveForces } from "./forceModel";
import {
	cartesianToPolar,
	polarToCartesian,
	subtractVectors,
} from "./vectorUtils";

/**
 * Executes one physics update step (typically 60fps).
 * Pure function: takes current state + dt, returns new state.
 */
export function stepPhysics(
	state: WindPhysicsState,
	dt: number = PHYSICS_CONSTANTS.DT,
): WindPhysicsState {
	// 1. Calculate Apparent Wind
	// ------------------------------------------------------------------
	// True Wind Vector (Environment)
	const trueWind = polarToCartesian(state.windSpeed, state.windDirection);

	// Boat Vector (Velocity)
	const boatVel = polarToCartesian(state.boatSpeed, state.boatHeading);

	// Apparent Wind = True Wind - Boat Velocity
	// (As felt on the face of the sailor)
	const apparentWindVec = subtractVectors(trueWind, boatVel);
	const apparent = cartesianToPolar(apparentWindVec);

	// Calculate AWA (Apparent Wind Angle relative to Boat Heading)
	// Positive = Starboard (Right), Negative = Port (Left)
	// Range: [-180, 180]
	const awa = normalizeAngle180(apparent.angle - state.boatHeading);

	// 2. Calculate Angle of Attack (AoA)
	// ------------------------------------------------------------------
	// AoA = Abs(AWA) - Abs(SailAngle)
	// We assume sail is always trimmed to the leeward side corresponding to AWA.
	// e.g., if Wind is from +45 (Starboard), Boom is at +20. AoA = 25.
	// If Wind is from -45 (Port), Boom is at -20. AoA = 25.

	// Note: User input `sailAngle` is typically 0 (center) to 90 (out).
	// It represents the boom angle relative to centerline.
	const absAwa = Math.abs(awa);
	// Clamp sail angle to physical limits
	const safeSailAngle = Math.max(0, Math.min(90, Math.abs(state.sailAngle)));

	// AoA is the difference between where the wind comes from and where the sail is.
	const aoa = absAwa - safeSailAngle;

	// Dealing with "Backwinding" (sail on wrong side)
	// If AWA is 45 (Starboard) and Sail is -20 (Port), AoA is 65 (huge).
	// For this simplified model, we just take the absolute difference magnitude.
	// But in a game context, usually we auto-swap the boom side or just use Abs.

	// We strictly define AoA as the aerodynamic angle.
	// If AoA is negative (Sail is 'outside' the wind? Luffing on the other side?), handle it.
	// e.g. Wind 30, Sail 45 -> AoA -15. Meaning wind is hitting the "lee" side?
	// In sailing, this causes the sail to collapse (luff).
	// Our curve handles calculating Cl for negative AoA symmetrically or we just take abs.
	// Let's use signed AoA for debug, but Abs for hydro.

	const signedAoa = aoa;

	// 3. Aerodynamics (Lift & Drag)
	// ------------------------------------------------------------------
	const cl = getLiftCoefficient(signedAoa);
	const cd = getDragCoefficient(signedAoa, cl);

	// 4. Force Resolution
	// ------------------------------------------------------------------
	// This returns forces "per unit of dynamic pressure" (approx)
	const { driveForce: driveCoeff, heelForce: heelCoeff } = resolveForces(
		cl,
		cd,
		awa,
		apparent.magnitude,
		// Note: we pass AWA signed to get correct Drive/Heel direction relative to boat?
		// Actually our simplified model projects assuming standard forward drive.
		// We'll trust the coefficients are positive magnitude for now.
	);

	const isLuffing = detectLuffing(signedAoa);
	const isStalled = detectStall(signedAoa);

	// Apply Density & Area
	// Force = Coeff * 0.5 * rho * v^2 * A
	// Note: resolveForces already factored v^2? No, we passed 'v' just for reference?
	// Wait, resolveForces in previous step did: drive * v^2.
	// Let's refine based on previous file implementation.
	// Checking forceModel.ts content...
	// It did: drive * dynamicPressure (where dynamicPressure = v^2).
	// So we just need 0.5 * rho * A scaling.

	const scaleFactor =
		0.5 * PHYSICS_CONSTANTS.AIR_DENSITY * PHYSICS_CONSTANTS.SAIL_AREA;
	const finalDriveForce = driveCoeff * scaleFactor;
	const finalHeelForce = heelCoeff * scaleFactor;

	// 5. Hydrodynamics & Integration
	// ------------------------------------------------------------------
	// Resistance (Hull Drag) ~ v^2
	const hullDrag =
		state.boatSpeed * state.boatSpeed * PHYSICS_CONSTANTS.HULL_DRAG_COEFF;

	const netForce = finalDriveForce - hullDrag;

	// Acceleration a = F / m
	const accel = netForce / PHYSICS_CONSTANTS.BOAT_MASS;

	// Integrate Speed
	let newSpeed = state.boatSpeed + accel * dt;

	// Clamp Speed (No negative speed from drag, no infinite speed)
	if (newSpeed < 0) newSpeed = 0;
	if (newSpeed > PHYSICS_CONSTANTS.MAX_SPEED)
		newSpeed = PHYSICS_CONSTANTS.MAX_SPEED;

	// 6. Efficiency Metric (0..1)
	// ------------------------------------------------------------------
	// Based on how close AoA is to OPTIMAL (15 deg)
	// 1.0 = Perfect. 0.0 = Terrible.
	const distToOptimal = Math.abs(
		Math.abs(signedAoa) - PHYSICS_CONSTANTS.OPTIMAL_AOA,
	);
	// Map bounds: 0 distance -> 1.0 efficiency. 15 distance (0 or 30 aoa) -> 0.0 efficiency.
	let eff = 1.0 - distToOptimal / 15;
	eff = Math.max(0, Math.min(1, eff));

	// If luffing or stalled, penalize hard
	if (isLuffing || isStalled) eff = eff * 0.5; // Visual penalty

	return {
		...state,

		// Simulation Integration
		boatSpeed: newSpeed, // Updated

		// Derived Physics (Outputs)
		apparentWindSpeed: apparent.magnitude,
		apparentWindAngle: awa,
		angleOfAttack: signedAoa,
		liftCoefficient: cl,
		dragCoefficient: cd,

		forwardForce: finalDriveForce,
		sideForce: finalHeelForce,
		heelAngle: finalHeelForce * 0.05, // Simple visual scaler for heel

		efficiency: eff,
		isLuffing,
		isStalled,
	};
}
