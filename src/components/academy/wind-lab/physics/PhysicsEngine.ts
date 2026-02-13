export interface WindLabState {
    trueWindSpeed: number; // knots
    trueWindDirection: number; // degrees (0-360)
    boatHeading: number; // degrees (0-360)
    boatSpeed: number; // knots
    sailAngle: number; // degrees (relative to centerline, 0-90) - this is boom angle
    heelAngle: number; // degrees
    rudderAngle: number; // degrees (-45 to 45)
    angularVelocity: number; // degrees per second
}

export interface DerivedPhysics {
    apparentWindSpeed: number; // knots
    apparentWindAngle: number; // degrees relative to bow (0-180, usually signed -180 to 180)
    angleOfAttack: number; // degrees (AoA)
    liftCoefficient: number;
    dragCoefficient: number;
    driveForce: number; // Forward force
    heelForce: number; // Sideways force
    efficiency: number; // 0-1 (For audio/visual feedback)
    isStalled: boolean;
    isLuffing: boolean;
}

export class PhysicsEngine {

    private static readonly MAX_LIFT_AOA = 15; // Degrees where lift peaks
    private static readonly STALL_AOA = 20; // Degrees where stall begins
    private static readonly DRAG_COEFF_BASE = 0.1;

    // Safety Limits
    private static readonly MAX_BOAT_SPEED = 50; // knots (Sanity limit)
    private static readonly MAX_WIND_SPEED = 100; // knots
    private static readonly MAX_FORCE = 10000; // Arbitrary unit limit to prevent explosion

    /**
     * Calculates the physics state based on current inputs.
     * returning derived physics values.
     */
    public static calculatePhysics(state: WindLabState): DerivedPhysics {
        // 0. Safety Sanitization
        const safeBoatSpeed = this.clamp(state.boatSpeed || 0, 0, this.MAX_BOAT_SPEED);
        const safeTrueWindSpeed = this.clamp(state.trueWindSpeed || 0, 0, this.MAX_WIND_SPEED);
        const safeTrueWindDirection = this.normalizeAngle(state.trueWindDirection || 0);
        const safeHeading = this.normalizeAngle(state.boatHeading || 0);
        const safeSailAngle = this.clamp(Math.abs(state.sailAngle || 0), 0, 90);

        // 1. Calculate Apparent Wind
        // Convert everything to radians for calculation
        const twdRad = (safeTrueWindDirection * Math.PI) / 180;
        const headingRad = (safeHeading * Math.PI) / 180;

        // True Wind Vector (Global coordinates) x=East, y=North
        const vTwX = safeTrueWindSpeed * Math.sin(twdRad);
        const vTwY = safeTrueWindSpeed * Math.cos(twdRad);

        // Boat Velocity Vector (Global coordinates)
        const vBoatX = safeBoatSpeed * Math.sin(headingRad);
        const vBoatY = safeBoatSpeed * Math.cos(headingRad);

        // Apparent Wind Vector = True Wind - Boat Velocity
        // Aw = Tw - Vb
        const vAwX = vTwX - vBoatX;
        const vAwY = vTwY - vBoatY;

        const rawApparentWindSpeed = Math.sqrt(vAwX * vAwX + vAwY * vAwY);
        // Clamp AWS to prevent compounding infinity
        const apparentWindSpeed = this.clamp(rawApparentWindSpeed, 0, this.MAX_WIND_SPEED * 1.5);

        // Apparent Wind Angle relative to North/Global
        let awDirGlobal = Math.atan2(vAwX, vAwY); // -PI to PI
        if (awDirGlobal < 0) awDirGlobal += 2 * Math.PI;

        // Apparent Wind Angle relative to Heading (0 is bow, 180 is stern)
        // We want the angle difference.
        let awaRad = awDirGlobal - headingRad;

        // Normalize to -PI to PI safely
        awaRad = Math.atan2(Math.sin(awaRad), Math.cos(awaRad));

        const apparentWindAngle = (awaRad * 180) / Math.PI;
        const absAwa = Math.abs(apparentWindAngle);

        // 2. Calculate Angle of Attack (AoA)
        // AoA is the difference between AWA and Sail Angle
        const angleOfAttack = absAwa - safeSailAngle;

        // 3. Calculate Lift and Drag Coefficients
        // Simple lift curve approximation: Linear until stall, then drops.
        let liftCoeff = 0;
        let dragCoeff = this.DRAG_COEFF_BASE;
        let isStalled = false;
        let isLuffing = false;

        if (angleOfAttack < 0) {
            // Luffing (Backwinding)
            isLuffing = true;
            // Lift is minimal/negative, drag increases due to flapping
            liftCoeff = Math.max(-0.5, angleOfAttack * 0.05);
            dragCoeff += Math.abs(angleOfAttack) * 0.01;
        } else if (angleOfAttack <= this.MAX_LIFT_AOA) {
            // Linear Lift (Ideal Laminar Flow)
            // CL = 2 * PI * alpha (roughly for thin airfoils, simplified here)
            // Let's say max CL is 1.5 at 15 degrees.
            liftCoeff = (angleOfAttack / this.MAX_LIFT_AOA) * 1.5;
            // Induced Drag
            dragCoeff += (liftCoeff * liftCoeff) * 0.05;
        } else if (angleOfAttack <= this.STALL_AOA) {
            // Pre-stall / Rounding off
            liftCoeff = 1.5 - ((angleOfAttack - this.MAX_LIFT_AOA) * 0.1);
            dragCoeff += 0.2;
        } else {
            // Stalled
            isStalled = true;
            // Lift drops drastically, Drag increases massivley
            liftCoeff = Math.max(0, 1.4 - ((angleOfAttack - this.STALL_AOA) * 0.1));
            dragCoeff += 0.5 + (angleOfAttack - this.STALL_AOA) * 0.05;
        }

        // 4. Calculate Forces
        // Force = 0.5 * rho * V^2 * Area * Coeff
        // We assume constant rho * Area = k
        const k = 1.0;
        const vSquared = apparentWindSpeed * apparentWindSpeed;

        const totalLiftVectorMag = k * vSquared * liftCoeff;
        const totalDragVectorMag = k * vSquared * dragCoeff;

        // Force Resolution Logic
        // AWA is angle FROM bow. (Wind COMES from AWA).
        // So Wind vector points towards AWA + 180.
        const windVectorAngle = awaRad + Math.PI;

        const dragForceForward = totalDragVectorMag * Math.cos(windVectorAngle); // Contribution to forward motion
        const dragForceSide = totalDragVectorMag * Math.sin(windVectorAngle);     // Contribution to heeling (leeway)

        // Lift vector: Perpendicular to Wind Vector.
        // If AWA > 0 (Wind Stbd), Lift points to Port (-90 relative to wind vector).
        // Standard Lift points "Upwind-ish" relative to Drag.
        const liftAngle = (awaRad > 0) ? (windVectorAngle - Math.PI / 2) : (windVectorAngle + Math.PI / 2);

        const liftForceForward = totalLiftVectorMag * Math.cos(liftAngle);
        const liftForceSide = totalLiftVectorMag * Math.sin(liftAngle);

        // Total Drive (Forward Force)
        let driveForce = liftForceForward + dragForceForward;

        // Total Heel (Sideways Force)
        let heelForce = liftForceSide + dragForceSide;

        // Final Safety Clamp on Forces
        driveForce = this.clamp(driveForce, -this.MAX_FORCE, this.MAX_FORCE);
        heelForce = this.clamp(heelForce, -this.MAX_FORCE, this.MAX_FORCE);

        // Efficiency metric: How close are we to max L/D forward drive?
        // Simplified heuristic
        const efficiency = (isStalled || isLuffing) ? 0 : (liftCoeff / 1.5) * Math.max(0, (1 - (dragCoeff * 2)));

        return {
            apparentWindSpeed,
            apparentWindAngle, // degrees
            angleOfAttack,
            liftCoefficient: isNaN(liftCoeff) ? 0 : liftCoeff,
            dragCoefficient: isNaN(dragCoeff) ? 0 : dragCoeff,
            driveForce: isNaN(driveForce) ? 0 : driveForce,
            heelForce: isNaN(heelForce) ? 0 : Math.abs(heelForce),
            efficiency: isNaN(efficiency) ? 0 : Math.max(0, Math.min(1, efficiency)),
            isStalled,
            isLuffing
        };
    }

    /**
     * Calculates the theoretical optimal sail angle for a given Apparent Wind Angle.
     * OSA = clamp(|AWA| - MAX_LIFT_AOA, 0, 90)
     */
    public static getOptimalSailAngle(apparentWindAngle: number): number {
        const absAwa = Math.abs(apparentWindAngle);
        const target = absAwa - this.MAX_LIFT_AOA;
        return this.clamp(target, 0, 90);
    }

    // --- Helpers ---

    private static clamp(val: number, min: number, max: number): number {
        if (!Number.isFinite(val)) return min;
        return Math.min(Math.max(val, min), max);
    }

    private static normalizeAngle(angle: number): number {
        if (!Number.isFinite(angle)) return 0;
        return ((angle % 360) + 360) % 360;
    }
}
