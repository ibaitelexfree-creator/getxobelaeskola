import { Vector3, MathUtils } from 'three';
import { ApparentWind } from './WindManager';

export interface BoatState {
    position: Vector3;
    velocity: Vector3;
    heading: number;
    angularVelocity: number;
    liftCoeff: number;
    dragCoeff: number;
    efficiency: number; // 0 to 1
    aoa: number; // Angle of Attack in radians
    tack: number; // 1 for Starboard, -1 for Port
    heel: number; // Heeling angle in radians
    speed: number; // Knots
    speedKmh: number; // km/h
}

export class BoatPhysics {
    public state: BoatState = {
        position: new Vector3(),
        velocity: new Vector3(),
        heading: 0,
        angularVelocity: 0,
        liftCoeff: 0,
        dragCoeff: 0,
        efficiency: 0,
        aoa: 0,
        tack: 1,
        heel: 0,
        speed: 0,
        speedKmh: 0
    };

    // Constants
    private readonly MASS = 1000;
    private readonly MOMENT_OF_INERTIA = 1500; // Lowered from 5000 for agility
    private readonly HULL_DRAG_COEFF = 35.0; // Reduced for 25% more speed
    private readonly LATERAL_DRAG_COEFF = 500.0;
    private readonly SAIL_AREA = 20.0;
    private readonly RUDDER_COEFF = 1000.0; // Reduced from 4000 for smoother turning

    // Pool of reusable vectors to avoid allocation at 60fps
    private readonly _v1 = new Vector3();
    private readonly _v2 = new Vector3();
    private readonly _forward = new Vector3();

    constructor() { }

    /**
     * Calculates the target boat speed in knots based on True Wind Angle and Speed.
     * Implements a realistic Polar Curve.
     * @param twaRadians True Wind Angle in radians (0 to PI)
     * @param twsKnots True Wind Speed in knots
     */
    public getPolarSpeed(twaRadians: number, twsKnots: number): number {
        const twaDeg = MathUtils.radToDeg(Math.abs(twaRadians));
        let polarRefSpeed = 0;

        // Reference Polar Curve for ~12 knots wind
        // Angles: 0, 30, 45, 90, 135, 180
        // Speeds: 0, 0,  6,  8.5, 7.5, 6.0

        if (twaDeg < 30) {
            // No Go Zone
            polarRefSpeed = 0;
        } else if (twaDeg < 45) {
            // Transition from Irons to Close Haul
            // Ramp 0 to 6.0
            const t = (twaDeg - 30) / (45 - 30);
            polarRefSpeed = t * 6.0;
        } else if (twaDeg < 90) {
            // Close Haul (6.0) to Beam Reach (8.5)
            const t = (twaDeg - 45) / (90 - 45);
            polarRefSpeed = 6.0 + t * (8.5 - 6.0);
        } else if (twaDeg < 135) {
            // Beam Reach (8.5) to Broad Reach (7.5)
            const t = (twaDeg - 90) / (135 - 90);
            polarRefSpeed = 8.5 + t * (7.5 - 8.5);
        } else {
            // Broad Reach (7.5) to Run (6.0)
            const t = (twaDeg - 135) / (180 - 135);
            polarRefSpeed = 7.5 + t * (6.0 - 7.5);
        }

        // Scale by wind speed (normalized to 12 knots)
        // Using a square root factor for realistic drag scaling would be better,
        // but linear scaling with a cap works well for game feel.
        // Actually, hull speed limit is hard.
        // Let's assume linear power up to a point, then diminishing returns.

        const windRatio = twsKnots / 12.0;

        // Simple scaling
        let targetSpeedKnots = polarRefSpeed * windRatio;

        // Cap at ~18 knots (planing dinghy speeds)
        if (targetSpeedKnots > 18) targetSpeedKnots = 18;

        return targetSpeedKnots;
    }

    public update(
        dt: number,
        apparentWind: ApparentWind,
        trueWindSpeed: number, // m/s
        trueWindAngle: number, // radians (0..PI relative to bow)
        sailAngle: number,
        rudderAngle: number
    ) {
        // --- REALISTIC PHYSICS V3 (Polar Based) ---

        // 1. Wind Analysis
        // Apparent wind is used for Sail Trim (AWA)
        let windAngleRelBow = apparentWind.angleToBoat;
        if (windAngleRelBow > Math.PI) windAngleRelBow -= Math.PI * 2;
        windAngleRelBow = Math.abs(windAngleRelBow); // 0 = Head, PI = Stern

        // 2. Sail Trim Logic (The "Bisector" Rule)
        const idealSailAngle = Math.min(Math.PI / 2, windAngleRelBow / 2);

        // Calculate Trim Efficiency (How close is user to ideal?)
        const sailError = Math.abs(Math.abs(sailAngle) - idealSailAngle);
        const tolerance = 0.3;

        let trimEfficiency = 1.0 - (sailError / tolerance);
        trimEfficiency = Math.max(0, Math.min(1.0, trimEfficiency));

        // 3. No-Go Zone (Irons)
        // Also reduce efficiency if AWA is too close (physically impossible to fill sails)
        const ironsThreshold = 0.52; // 30 deg
        const smoothingRange = 0.15;
        const ironsFactor = MathUtils.smoothstep(windAngleRelBow, ironsThreshold - smoothingRange, ironsThreshold);
        trimEfficiency *= ironsFactor;

        this.state.efficiency = trimEfficiency;
        this.state.tack = Math.sign(sailAngle);

        // 4. Force Calculation (Polar Based)

        // Calculate Target Speed from Polar using True Wind
        const twsKnots = trueWindSpeed * 1.94384;
        const targetSpeedKnots = this.getPolarSpeed(trueWindAngle, twsKnots);
        const targetSpeedMps = targetSpeedKnots / 1.94384;

        // Calculate required Drive Force to maintain this speed against Hull Drag
        // F_drag = C_drag * v^2
        // So required F_drive = C_drag * v_target^2
        let targetDriveForce = (targetSpeedMps * targetSpeedMps) * this.HULL_DRAG_COEFF;

        // If we are stopped, we need some initial force to start moving.
        // The v^2 formula works for steady state, but if v=0, Force=0? No.
        // The Polar speed implies "potential speed".
        // The force should be enough to accelerate to that speed.
        // Actually, if we use the same Drag Coeff for driving force calc, it works out.
        // But we must apply Trim Efficiency.

        let driveForce = targetDriveForce * trimEfficiency;

        // Backwind / Irons handling
        if (trueWindAngle < MathUtils.degToRad(30)) {
            // Drag forces dominate, no forward drive
            driveForce = 0;
        }

        // Heel Force (Tipping Boat) - Based on Apparent Wind Pressure
        const windSpeed = apparentWind.speed;
        const windPressure = windSpeed * windSpeed;
        const sideComp = Math.sin(windAngleRelBow);
        // Reduced heel factor slightly to compensate for potential high pressures
        const heelForce = windPressure * trimEfficiency * sideComp * 40.0;

        // 5. Linear Dynamics
        // Propulsion Direction
        const forwardDir = this._forward.set(
            -Math.sin(this.state.heading),
            0,
            -Math.cos(this.state.heading)
        );

        // Hull Drag (Water Resistance)
        const currentSpeed = this.state.velocity.dot(forwardDir);
        // Drag always opposes motion
        const hullDrag = currentSpeed * Math.abs(currentSpeed) * this.HULL_DRAG_COEFF;

        // Linear Acceleration
        // Mass = 1000kg
        // Net Force = Drive - Drag
        // If Drive is calculated as (TargetSpeed^2 * DragCoeff), then at TargetSpeed, Net Force = 0.
        const fNet = driveForce - hullDrag;
        const accel = fNet / this.MASS;

        // Apply Speed Change
        let newSpeed = currentSpeed + accel * dt;

        // Prevent negative speed accumulation unless explicitly handled (drifting back)
        if (newSpeed < -0.5) newSpeed = -0.5;

        // Apply Velocity
        this.state.velocity.copy(forwardDir).multiplyScalar(newSpeed);

        // 6. Angular Dynamics (Turn)
        // Turning adds drag (Cornering speed loss)
        if (Math.abs(rudderAngle) > 0.1) {
            this.state.velocity.multiplyScalar(0.999);
        }

        const effectiveSpeed = Math.max(3.0, Math.abs(newSpeed)); // Steerage way
        const torque = -rudderAngle * effectiveSpeed * this.RUDDER_COEFF;
        const angAccel = torque / this.MOMENT_OF_INERTIA;

        this.state.angularVelocity += angAccel * dt;
        this.state.angularVelocity *= 0.95; // Water Damping
        this.state.heading += this.state.angularVelocity * dt;

        // 7. Heel Physics
        const sailSignSmooth = MathUtils.clamp(sailAngle * 5.0, -1.0, 1.0);
        const targetHeel = -(heelForce / 2000.0) * sailSignSmooth;

        this.state.heel += (targetHeel - this.state.heel) * dt * 1.5;
        this.state.heel = Math.max(-0.6, Math.min(0.6, this.state.heel));

        // 8. Update Position
        this.state.position.addScaledVector(this.state.velocity, dt);

        // 9. Update State Scalars
        const speedMagnitude = this.state.velocity.length();
        this.state.speed = speedMagnitude * 1.94384;
        this.state.speedKmh = speedMagnitude * 3.6;

        this.state.liftCoeff = driveForce;
        this.state.aoa = idealSailAngle;
    }

    // Facade getters for legacy support
    get position() { return this.state.position; }
    get velocity() { return this.state.velocity; }
    get heading() { return this.state.heading; }
}
