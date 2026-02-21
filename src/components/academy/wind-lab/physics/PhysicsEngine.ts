export interface WindLabState {
    trueWindSpeed: number; // knots
    trueWindDirection: number; // degrees (0-360)
    boatHeading: number; // degrees (0-360)
    boatSpeed: number; // knots
    sailAngle: number; // degrees (Main Boom, relative to centerline, 0-90)
    jibAngle: number; // degrees (Jib Sheet, relative to centerline, 0-90)
    heelAngle: number; // degrees
    rudderAngle: number; // degrees (-45 to 45)
    angularVelocity: number; // degrees per second
}

export interface DerivedPhysics {
    apparentWindSpeed: number; // knots
    apparentWindAngle: number; // degrees relative to bow (0-180, usually signed -180 to 180)

    // Main Sail Stats
    mainAoA: number;
    mainLift: number;
    mainDrag: number;
    mainEfficiency: number;
    mainIsStalled: boolean;
    mainIsLuffing: boolean;

    // Jib Sail Stats
    jibAoA: number;
    jibLift: number;
    jibDrag: number;
    jibEfficiency: number;
    jibIsStalled: boolean;
    jibIsLuffing: boolean;

    driveForce: number; // Forward force
    heelForce: number; // Sideways force
    efficiency: number; // Combined efficiency (0-1) for audio/visual feedback
}

export class PhysicsEngine {

    private static readonly MAX_LIFT_AOA = 20; // Degrees where lift peaks
    private static readonly STALL_AOA = 25; // Degrees where stall begins, wider margin for game
    private static readonly DRAG_COEFF_BASE = 0.05;

    // Safety Limits
    private static readonly MAX_BOAT_SPEED = 50;
    private static readonly MAX_WIND_SPEED = 100;
    private static readonly MAX_FORCE = 500; // Reduced to reasonable game units

    public static calculatePhysics(state: WindLabState): DerivedPhysics {
        // 0. Safety Sanitization
        const boatSpeed = this.clamp(state.boatSpeed || 0, 0, this.MAX_BOAT_SPEED);
        const trueWindSpeed = this.clamp(state.trueWindSpeed || 0, 0, this.MAX_WIND_SPEED);
        const trueWindDirection = this.normalizeAngle(state.trueWindDirection || 0);
        const heading = this.normalizeAngle(state.boatHeading || 0);
        const mainAngle = this.clamp(Math.abs(state.sailAngle || 0), 0, 90);
        const jibAngle = this.clamp(Math.abs(state.jibAngle || 0), 0, 90);

        // 1. Calculate Apparent Wind
        const twdRad = (trueWindDirection * Math.PI) / 180;
        const headingRad = (heading * Math.PI) / 180;

        // True Wind Vector (Global)
        const vTwX = trueWindSpeed * Math.sin(twdRad);
        const vTwY = trueWindSpeed * Math.cos(twdRad);

        // Boat Velocity Vector (Global)
        const vBoatX = boatSpeed * Math.sin(headingRad);
        const vBoatY = boatSpeed * Math.cos(headingRad);

        // Apparent Wind Vector = True Wind - Boat Velocity
        const vAwX = vTwX - vBoatX;
        const vAwY = vTwY - vBoatY;

        const apparentWindSpeed = Math.sqrt(vAwX * vAwX + vAwY * vAwY);

        // Apparent Wind Angle relative to Heading
        // Calculate Global AW Angle
        const awDirGlobal = Math.atan2(vAwX, vAwY); // 0 is North (Y axis)

        // Relative Angle (0 = Bow, 180 = Stern)
        // Adjust for Heading
        let awaRad = awDirGlobal - headingRad;

        // Normalize to -PI to PI
        awaRad = Math.atan2(Math.sin(awaRad), Math.cos(awaRad));

        const apparentWindAngle = (awaRad * 180) / Math.PI;
        const absAwa = Math.abs(apparentWindAngle);

        // 2. Compute Foil Physics
        // Main Sail (Area size factor 1.0)
        // Note: computeFoil returns internal physics object
        const mainPhysics = this.computeFoil(absAwa, mainAngle, 1.0);

        // Jib Sail (Area size factor 0.6) - Jib is smaller but efficient
        const jibPhysics = this.computeFoil(absAwa, jibAngle, 0.6);

        // 3. Resolve Forces (Aero)
        // Thrust = Lift * sin(AWA) - Drag * cos(AWA)
        // Heel   = Lift * cos(AWA) + Drag * sin(AWA)
        // (Using absolute AWA for magnitude, direction handled by sign?)
        // Actually, easiest to just sum Lift/Drag magnitudes first if sails are same side.

        const totalLift = (mainPhysics.lift * 1.0 + jibPhysics.lift * 0.6) * apparentWindSpeed * apparentWindSpeed * 0.1;
        const totalDrag = (mainPhysics.drag * 1.0 + jibPhysics.drag * 0.6) * apparentWindSpeed * apparentWindSpeed * 0.1;

        // Projection
        // If wind from Starboard (AWA > 0), Lift pulls to Port.
        // Thrust component: L * sin(AWA) - D * cos(AWA)
        // If AWA=90 (Beam Reach): Thrust = L * 1 - D * 0 = L. Correct.
        // If AWA=0 (Irons): Thrust = L * 0 - D * 1 = -D. Correct.
        // If AWA=180 (Run): Thrust = L * 0 - D * (-1) = D. Correct. 

        const absAwaRad = Math.abs(awaRad);
        let driveForce = totalLift * Math.sin(absAwaRad) - totalDrag * Math.cos(absAwaRad);
        let heelForce = totalLift * Math.cos(absAwaRad) + totalDrag * Math.sin(absAwaRad);

        // Clamp Forces
        driveForce = this.clamp(driveForce, -this.MAX_FORCE, this.MAX_FORCE);
        heelForce = this.clamp(heelForce, 0, this.MAX_FORCE); // Heel is always positive (magnitude)

        // Efficiency metric (0-1)
        const combinedEfficiency = (mainPhysics.efficiency + jibPhysics.efficiency) / 2;

        return {
            apparentWindSpeed,
            apparentWindAngle,

            mainAoA: mainPhysics.aoa,
            mainLift: mainPhysics.lift,
            mainDrag: mainPhysics.drag,
            mainEfficiency: mainPhysics.efficiency,
            mainIsStalled: mainPhysics.isStalled,
            mainIsLuffing: mainPhysics.isLuffing,

            jibAoA: jibPhysics.aoa,
            jibLift: jibPhysics.lift,
            jibDrag: jibPhysics.drag,
            jibEfficiency: jibPhysics.efficiency,
            jibIsStalled: jibPhysics.isStalled,
            jibIsLuffing: jibPhysics.isLuffing,

            driveForce,
            heelForce,
            efficiency: combinedEfficiency
        };
    }

    private static computeFoil(absAwa: number, sailAngle: number, sizeFactor: number) {
        // AoA: Angle between Chord (Sail) and Wind
        // AWA is angle of wind to centerline. 
        // Sail Angle is angle of boom to centerline.
        // AoA = AWA - SailAngle.
        // If AWA = 45, Sail = 0 -> AoA = 45 (Stall)
        // If AWA = 45, Sail = 30 -> AoA = 15 (Good)
        // If AWA = 45, Sail = 45 -> AoA = 0 (Luffing)
        // If AWA = 45, Sail = 60 -> AoA = -15 (Backwinded)

        const aoa = absAwa - sailAngle;

        let cl = 0; // Coefficient of Lift
        let cd = this.DRAG_COEFF_BASE; // Coefficient of Drag
        let isStalled = false;
        let isLuffing = false;

        // Calculate Coefficients
        if (aoa < 0) {
            // Luffing / Backwinded
            isLuffing = true;
            cl = 0;
            cd = 0.1 + Math.abs(aoa) * 0.01; // Flapping drag
        } else if (aoa <= this.MAX_LIFT_AOA) {
            // Linear Lift Region
            // Cl rises linearly with AoA
            // Max Cl approx 1.5
            const t = aoa / this.MAX_LIFT_AOA;
            cl = t * 1.5;
            cd = this.DRAG_COEFF_BASE + (cl * cl) * 0.05; // Induced drag
        } else if (aoa <= this.STALL_AOA) {
            // Peak / Transition
            cl = 1.5;
            cd = 0.2;
        } else {
            // Stalled
            isStalled = true;
            // Lift drops, Drag increases
            // Simple model: Lift decays, Drag grows linearly
            const excess = aoa - this.STALL_AOA;
            cl = Math.max(0.5, 1.5 - excess * 0.05);
            cd = 0.5 + excess * 0.02;
        }

        // Efficiency (L/D ratio normalized for game feedback)
        // Ideal L/D ~ 10-15?
        // We normalize to 0-1 for UI bar
        // Ideal AoA is around 15.
        // If AoA is 15 -> Cl=1.5, Cd=0.15 -> Ratio 10.
        // Return normalized "goodness"
        let efficiency = 0;
        if (!isStalled && !isLuffing) {
            // Bell curve peaking at MAX_LIFT_AOA
            const dist = Math.abs(aoa - (this.MAX_LIFT_AOA - 5)); // Peak around 15
            efficiency = Math.max(0, 1 - (dist / 15));
        }

        return {
            aoa,
            lift: cl,
            drag: cd,
            efficiency,
            isStalled,
            isLuffing,
            sizeFactor
        };
    }

    public static getOptimalSailAngle(apparentWindAngle: number, offset: number = 0): number {
        const absAwa = Math.abs(apparentWindAngle);
        // Optimal AoA is roughly 15 degrees
        // SailAngle = AWA - OptimalAoA
        const target = absAwa - 15 - offset;
        return this.clamp(target, 0, 90);
    }

    private static clamp(val: number, min: number, max: number): number {
        if (!Number.isFinite(val)) return min;
        return Math.min(Math.max(val, min), max);
    }

    private static normalizeAngle(angle: number): number {
        if (!Number.isFinite(angle)) return 0;
        return ((angle % 360) + 360) % 360;
    }
}
