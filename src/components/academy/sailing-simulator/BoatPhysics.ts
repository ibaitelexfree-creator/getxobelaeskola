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

    public update(dt: number, apparentWind: ApparentWind, sailAngle: number, rudderAngle: number) {
        // --- REALISTIC PHYSICS V2 ---

        // 1. Wind Analysis
        // Normalize Wind Angle to 0..PI relative to Bow
        let windAngleRelBow = apparentWind.angleToBoat;
        if (windAngleRelBow > Math.PI) windAngleRelBow -= Math.PI * 2;
        windAngleRelBow = Math.abs(windAngleRelBow); // 0 = Head, PI = Stern

        // 2. Sail Trim Logic (The "Bisector" Rule)
        // Realistic sailing: Optimal sail angle is roughly half the wind angle.
        // - Close Haul (45deg wind) -> Sail at ~22deg
        // - Bean Reach (90deg wind) -> Sail at ~45deg
        // - Run (180deg wind) -> Sail at 90deg
        const idealSailAngle = Math.min(Math.PI / 2, windAngleRelBow / 2);

        // Calculate Trim Efficiency (How close is user to ideal?)
        // Allow a "sweet spot" tolerance of ~15 degrees (0.26 rad)
        const sailError = Math.abs(Math.abs(sailAngle) - idealSailAngle);
        const tolerance = 0.3;

        let trimEfficiency = 1.0 - (sailError / tolerance);
        trimEfficiency = Math.max(0, Math.min(1.0, trimEfficiency));

        // 3. No-Go Zone (Irons) with SMOOTH transition
        // Instead of a hard cutoff at 0.52 (30 deg), we fade out between 40 and 25 degrees.
        // This prevents "chatter" (vibration) at the edge of the zone.
        const ironsThreshold = 0.52; // 30 deg
        const smoothingRange = 0.15; // ~8 deg smoothing

        const ironsFactor = MathUtils.smoothstep(windAngleRelBow, ironsThreshold - smoothingRange, ironsThreshold);
        trimEfficiency *= ironsFactor;

        this.state.efficiency = trimEfficiency;
        this.state.tack = Math.sign(sailAngle);

        // 4. Force Calculation
        const windSpeed = apparentWind.speed;
        // Basic wind pressure (V^2)
        const windPressure = windSpeed * windSpeed;

        // Polar Power Curve (Approximation of Hull + Sail performance)
        // Ships are fastest at Beam Reach (90) to Broad Reach (135).
        // Slowest at Upwind.
        // We use a factor to modulate the drive force.
        let polarFactor = 0;
        if (windAngleRelBow < 0.52) polarFactor = -0.5; // Drag/Baking in Irons
        else if (windAngleRelBow < 1.0) polarFactor = 1.0; // Close Haul
        else if (windAngleRelBow < 2.0) polarFactor = 1.5; // Beam/Broad Reach (Fastest)
        else polarFactor = 1.3; // Run (slightly slower due to no apparent wind lift)

        // Drive Force (Pushing Boat Forward)
        // Force = Pressure * Efficiency * PolarFactor * AreaFactor
        let driveForce = windPressure * trimEfficiency * polarFactor * 25.0; // Tuning scalar

        // BOOSTS: 70% Downwind (1.35 * 1.25 approx), 15% Others
        // Popa (Stern) is windAngleRelBow near PI (3.14). 
        // Broad reach to Run starts around 2.5 rad.
        const speedBoost = windAngleRelBow > 2.5 ? 1.7 : 1.15;
        driveForce *= speedBoost;

        // Heel Force (Tipping Boat)
        // Max at Beam Reach (90), Zero at Run (180) and Head (0)
        // Sin curve is a good approx for side-force component
        const sideComp = Math.sin(windAngleRelBow);
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

        // Handling "Baking" (Negative Drive in Irons) - allow stopping, slow reverse?
        // Drag shouldn't accelerate you backwards indefinitely, just stop you.
        if (newSpeed < -0.5) newSpeed = -0.5; // Cap reverse drift

        // Reconstruct Velocity (Pure forward model + leeway later?)
        // For 'Realista' feel, let's keep lateral drift low for now (Keel works).
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
        // Smooth out the sign of the sail angle to prevent jumping when crossing center
        const sailSignSmooth = MathUtils.clamp(sailAngle * 5.0, -1.0, 1.0);
        // Invert sign so the boat heels AWAY from the wind (Leeward)
        // If sail is at + (Starboard), wind is from Port, boat should heel to Starboard
        const targetHeel = (heelForce / 2000.0) * sailSignSmooth;

        // Smooth Damping (Slightly slower to prevent rapid oscillations)
        this.state.heel += (targetHeel - this.state.heel) * dt * 1.5;
        this.state.heel = Math.max(-0.6, Math.min(0.6, this.state.heel));

        // 8. Update Position
        this.state.position.addScaledVector(this.state.velocity, dt);

        // 9. Pre-calculate scalar values for HUD (to avoid method calls on serialized objects)
        const speedMagnitude = this.state.velocity.length();
        this.state.speed = speedMagnitude * 1.94384;
        this.state.speedKmh = speedMagnitude * 3.6;

        // Debug info relative to user request
        this.state.liftCoeff = driveForce; // Hack to show Drive in debug UI if needed
        this.state.aoa = idealSailAngle; // Show ideal angle in debug
    }

    // Facade getters for legacy support in SailingSimulator.tsx
    get position() { return this.state.position; }
    get velocity() { return this.state.velocity; }
    get heading() { return this.state.heading; }
}
