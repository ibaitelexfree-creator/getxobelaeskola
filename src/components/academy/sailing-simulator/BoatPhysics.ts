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
     * Calculates the target boat speed in knots based on TWS and TWA.
     * Uses a polar diagram approximation.
     * @param twsKnots True Wind Speed in Knots
     * @param twaDeg True Wind Angle in Degrees (0 to 180)
     */
    public getPolarTargetSpeed(twsKnots: number, twaDeg: number): number {
        // Polar Diagram Interpolation Points (Angle -> Factor of TWS)
        // Adjusted for a realistic 30-40ft performance cruiser
        // TWA 0-30: No Go Zone (Factor 0)
        // TWA 45: Close Haul (Factor ~0.6)
        // TWA 90: Beam Reach (Factor ~0.8 - Max Hull Speed often reached here)
        // TWA 135: Broad Reach (Factor ~0.75)
        // TWA 180: Run (Factor ~0.6)

        const polarData = [
            { angle: 0, factor: 0 },
            { angle: 30, factor: 0 },       // Entering No-Go
            { angle: 40, factor: 0.55 },    // Pinching
            { angle: 52, factor: 0.70 },    // Optimal Upwind
            { angle: 90, factor: 0.85 },    // Beam Reach (Fastest displacement)
            { angle: 110, factor: 0.88 },   // Slightly deeper reach
            { angle: 140, factor: 0.75 },   // Broad Reach
            { angle: 180, factor: 0.60 }    // Dead Run
        ];

        // Find the interval
        let lower = polarData[0];
        let upper = polarData[polarData.length - 1];

        for (let i = 0; i < polarData.length - 1; i++) {
            if (twaDeg >= polarData[i].angle && twaDeg <= polarData[i + 1].angle) {
                lower = polarData[i];
                upper = polarData[i + 1];
                break;
            }
        }

        // Linear interpolation
        const range = upper.angle - lower.angle;
        const t = range === 0 ? 0 : (twaDeg - lower.angle) / range;
        const factor = lower.factor + t * (upper.factor - lower.factor);

        // Calculate base speed
        let targetSpeed = twsKnots * factor;

        // Apply Hull Speed Limit logic (Soft Cap)
        // Displacement hulls have a "limit" based on length.
        // Let's assume max displacement speed is around 8-9 knots.
        // Planing (surfing) happens at higher wind speeds/angles.
        const maxDisplacementSpeed = 9.0;

        if (targetSpeed > maxDisplacementSpeed) {
            // Logarithmic growth past hull speed (simulating drag wall)
            // Unless we are surfing (Broad Reach + High Wind)
            const isSurfing = (twaDeg > 100 && twaDeg < 160 && twsKnots > 15);

            if (isSurfing) {
                // Allow more speed
                targetSpeed = maxDisplacementSpeed + (targetSpeed - maxDisplacementSpeed) * 0.6;
            } else {
                // Harder cap
                targetSpeed = maxDisplacementSpeed + (targetSpeed - maxDisplacementSpeed) * 0.2;
            }
        }

        return targetSpeed;
    }

    public update(dt: number, apparentWind: ApparentWind, trueWindSpeed: number, trueWindAngle: number, sailAngle: number, rudderAngle: number) {
        // --- REALISTIC PHYSICS V3 (Polar Based) ---

        // 1. Wind Analysis
        // Apparent Wind Angle for Sail Trim
        let awa = apparentWind.angleToBoat;
        if (awa > Math.PI) awa -= Math.PI * 2;
        awa = Math.abs(awa); // 0 = Head, PI = Stern

        // True Wind for Polars
        const twaDeg = MathUtils.radToDeg(Math.abs(trueWindAngle));
        const twsKnots = trueWindSpeed * 1.94384; // m/s to knots

        // 2. Sail Trim Logic
        // Realistic sailing: Optimal sail angle is roughly half the wind angle.
        const idealSailAngle = Math.min(Math.PI / 2, awa / 2);

        // Calculate Trim Efficiency
        const sailError = Math.abs(Math.abs(sailAngle) - idealSailAngle);
        const tolerance = 0.3;

        let trimEfficiency = 1.0 - (sailError / tolerance);
        trimEfficiency = Math.max(0, Math.min(1.0, trimEfficiency));

        // Irons (No-Go) handling
        const ironsThreshold = 0.52; // ~30 deg
        const ironsFactor = MathUtils.smoothstep(awa, ironsThreshold - 0.1, ironsThreshold);
        trimEfficiency *= ironsFactor;

        this.state.efficiency = trimEfficiency;
        this.state.tack = Math.sign(sailAngle);

        // 3. Target Speed Calculation (Polar)
        const targetSpeedKnots = this.getPolarTargetSpeed(twsKnots, twaDeg);
        const targetSpeedMs = targetSpeedKnots * 0.514444; // Knots to m/s

        // 4. Force Calculation
        // Drive Force required to maintain the Target Speed against Hull Drag
        const maxDriveForce = this.HULL_DRAG_COEFF * (targetSpeedMs * targetSpeedMs);

        // Apply Trim Efficiency
        let driveForce = maxDriveForce * trimEfficiency;

        // If in Irons (Head to wind), apply backward drag
        if (twaDeg < 30) {
            driveForce = -500; // Push back
        }

        // Heel Force (Tipping Boat) - Based on Apparent Wind Pressure
        const windPressure = apparentWind.speed * apparentWind.speed;
        const sideComp = Math.sin(awa);
        const heelForce = windPressure * trimEfficiency * sideComp * 40.0;

        // 5. Linear Dynamics
        // Propulsion
        const forwardDir = this._forward.set(
            -Math.sin(this.state.heading),
            0,
            -Math.cos(this.state.heading)
        );

        // Hull Drag (Water Resistance)
        const currentSpeed = this.state.velocity.dot(forwardDir);
        const hullDrag = currentSpeed * Math.abs(currentSpeed) * this.HULL_DRAG_COEFF;

        // Linear Acceleration
        // Mass = 1000kg
        const fNet = driveForce - hullDrag;
        const accel = fNet / this.MASS;

        // Apply Speed Change
        let newSpeed = currentSpeed + accel * dt;

        // Handling "Baking" (Negative Drive in Irons)
        if (newSpeed < -0.5) newSpeed = -0.5; // Cap reverse drift

        // Reconstruct Velocity
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

        // 7. Heel Physics (Visual + Feeling)
        // Smooth out the sign of the sail angle
        const sailSignSmooth = MathUtils.clamp(sailAngle * 5.0, -1.0, 1.0);
        // Boat heels AWAY from the wind
        const targetHeel = -(heelForce / 2000.0) * sailSignSmooth;

        // Smooth Damping
        this.state.heel += (targetHeel - this.state.heel) * dt * 1.5;
        this.state.heel = Math.max(-0.6, Math.min(0.6, this.state.heel));

        // 8. Update Position
        this.state.position.addScaledVector(this.state.velocity, dt);

        // 9. Pre-calculate scalar values for HUD
        const speedMagnitude = this.state.velocity.length();
        this.state.speed = speedMagnitude * 1.94384;
        this.state.speedKmh = speedMagnitude * 3.6;

        // Debug info
        this.state.liftCoeff = driveForce;
        this.state.aoa = idealSailAngle;
    }

    // Facade getters for legacy support in SailingSimulator.tsx
    get position() { return this.state.position; }
    get velocity() { return this.state.velocity; }
    get heading() { return this.state.heading; }
}
