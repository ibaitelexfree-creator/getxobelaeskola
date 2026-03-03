export const PHYSICS_CONSTANTS = {
    AIR_DENSITY: 1.225, // kg/m3 (Standard Sea Level)
    SAIL_AREA: 20,      // m^2 (Typical 30ft cruiser mainsail)
    HULL_DRAG_COEFF: 2.5, // Simplified drag factor
    BOAT_MASS: 1000,    // kg

    // Aerodynamics
    OPTIMAL_AOA: 15,    // Degrees
    STALL_START_AOA: 25, // Degrees
    MAX_LIFT_COEFF: 1.5,
    MIN_DRAG_COEFF: 0.05,
    STALL_DRAG_COEFF: 1.2, // Flat plate drag

    // Simulation
    DT: 1 / 60,         // Fixed time step (16.6ms)
    MIN_WIND_SPEED: 0.1, // Knots (avoid div/0)
    MAX_SPEED: 20       // Knots (safety cap)
};

export const PHYSICS_TOLERANCE = 0.001;
