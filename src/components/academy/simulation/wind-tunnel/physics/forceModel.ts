import { deg2rad } from "./angleUtils";

/**
 * Resolves the Lift and Drag forces into Drive (Forward) and Heel (Side) components.
 *
 * Coordinate System:
 * - AWA: 0 degrees = Forward. positive = right (starboard).
 * - Lift: Perpendicular to AWA (L - 90).
 * - Drag: Parallel to AWA.
 */
export function resolveForces(
	cl: number,
	cd: number,
	awa: number,
	apparentWindSpeed: number,
): { driveForce: number; heelForce: number } {
	// 1. Dynamic Pressure (q) = 0.5 * rho * v^2 * Area
	// We assume density and area are constants managed externally or scaled here.
	// For simplicity, we return "Force Coefficients" scaled by AWS^2.
	// The consumer (physicsStep) will apply the constants.

	// AWS is in knots. It MUST be converted to m/s? Or we keep units generic "Game Units".
	// For AAA feel, let's keep it somewhat proportional to knots^2.
	const dynamicPressure = apparentWindSpeed * apparentWindSpeed;

	// 2. Trigonometry
	// Drive = L * sin(AWA) - D * cos(AWA)
	// Heel  = L * cos(AWA) + D * sin(AWA)

	// Note: AWA is [-180, 180].
	// sin(-x) = -sin(x). cos(-x) = cos(x).

	const awaRad = deg2rad(Math.abs(awa));
	const sinA = Math.sin(awaRad);
	const cosA = Math.cos(awaRad);

	// Lift is perpendicular to wind.
	// Drag is parallel to wind.
	// Projecting onto Boat Heading (0 degrees relative):

	// Forward Component:
	// Lift contributes positively (pulling forward)
	// Drag contributes negatively (pushing backward)
	const drive = cl * sinA - cd * cosA;

	// Side Component:
	// both push sideways
	const heel = cl * cosA + cd * sinA;

	return {
		driveForce: drive * dynamicPressure,
		heelForce: heel * dynamicPressure,
	};
}
