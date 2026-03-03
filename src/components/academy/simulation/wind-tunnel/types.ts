export interface Vector2D {
    x: number;
    y: number;
}

export interface WindPhysicsState {
    // --- INPUTS (Environment & Controls) ---
    windSpeed: number;           // Knots (Standard: 0-40)
    windDirection: number;       // Degrees (0-360) (True Wind, 0=North, 90=East)

    sailAngle: number;           // Degrees (Relative to Centerline)
    // 0 = Centerline, 90 = Perpendicular

    boatHeading: number;         // Degrees (0-360) (0=North)

    // --- SIMULATION STATE (Integrator) ---
    boatSpeed: number;           // Knots (Forward velocity)

    // --- OUTPUTS (Derived Frame Physics) ---
    apparentWindSpeed: number;   // Knots
    apparentWindAngle: number;   // Degrees (Relative to Bow, -180 to 180)

    angleOfAttack: number;       // Degrees (Difference between Sail & Apparent Wind)

    liftCoefficient: number;     // 0.0 - 2.0 (approx)
    dragCoefficient: number;     // 0.0 - 1.0 (approx)

    forwardForce: number;        // Newton-equivalent units (Propulsion)
    sideForce: number;           // Newton-equivalent units (Heel/Leeway)

    heelAngle: number;           // Degrees (Visual feedback)
    efficiency: number;          // 0.0 - 1.0 (Gamification metric)

    isLuffing: boolean;          // Visual Flag: Sail is flapping (AoA too low)
    isStalled: boolean;          // Visual Flag: Flow separation (AoA too high)
}

export type PhysicsDifficulty = 'beginner' | 'advanced' | 'gamer';
