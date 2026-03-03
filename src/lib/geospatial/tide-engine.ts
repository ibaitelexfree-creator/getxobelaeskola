export interface TideState {
    timestamp: Date;
    height: number;      // Meters above chart datum
    phase: 'rising' | 'falling'; // Flood or Ebb
    percentage: number;  // 0-100% of the current cycle (0=low, 100=high)
}

export interface CurrentVector {
    id: string;
    lat: number;
    lng: number;
    rotation: number;    // Degrees (0-360)
    intensity: number;   // 0-1 (normalized speed)
    directionLabel: 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';
}

// Bilbao / Abra Bay approximate constants
const M2_PERIOD_HOURS = 12.4206;
const MEAN_LEVEL = 2.5; // meters
const AMPLITUDE = 1.8;  // meters (Range ~3.6m)

// Reference High Tide: Random recent date for alignment
// e.g., Jan 1, 2024, 00:00 UTC was near a high tide or we just pick an arbitrary one for the simulation.
// To make it consistent day-to-day, we can anchor to a fixed point.
const REF_HIGH_TIDE = new Date('2024-01-01T04:00:00Z').getTime();

/**
 * Calculates the tide level for a given date using a simple harmonic model (M2 constituent only).
 * In a real app, this would query an API or use a full harmonic constituent database.
 */
export function getTideLevel(date: Date): TideState {
    const t = date.getTime();
    const hoursSinceRef = (t - REF_HIGH_TIDE) / (1000 * 60 * 60);

    // Calculate phase (0 to 2PI)
    // 2PI corresponds to M2_PERIOD_HOURS
    const phaseRad = (hoursSinceRef % M2_PERIOD_HOURS) / M2_PERIOD_HOURS * 2 * Math.PI;

    // Cosine wave: cos(0) = 1 (High), cos(PI) = -1 (Low)
    const rawCos = Math.cos(phaseRad);

    const height = MEAN_LEVEL + (AMPLITUDE * rawCos);

    // Determine if rising or falling
    // Derivative of cos is -sin.
    // If -sin(phase) > 0 => rising.
    // If -sin(phase) < 0 => falling.
    const slope = -Math.sin(phaseRad);

    const phase = slope > 0 ? 'rising' : 'falling';

    // Percentage (0 = Low water, 1 = High water)
    // rawCos goes from 1 to -1.
    // (rawCos + 1) / 2 goes from 1 to 0.
    const percentage = (rawCos + 1) / 2;

    return {
        timestamp: date,
        height,
        phase,
        percentage
    };
}

// Grid points in the Abra Bay for current visualization
const CURRENT_POINTS = [
    { id: 'p1', lat: 43.36, lng: -3.06, label: 'Outer Abra' },
    { id: 'p2', lat: 43.35, lng: -3.04, label: 'Mid Abra' },
    { id: 'p3', lat: 43.345, lng: -3.025, label: 'Inner Abra' },
    { id: 'p4', lat: 43.34, lng: -3.015, label: 'Channel Mouth' },
    { id: 'p5', lat: 43.335, lng: -3.01, label: 'River Channel' },
    // Side currents
    { id: 'p6', lat: 43.355, lng: -3.02, label: 'Getxo Coast' },
    { id: 'p7', lat: 43.35, lng: -3.07, label: 'Zierbena Coast' },
];

/**
 * Calculates current vectors based on tide state.
 * Flood (Rising) -> Flows INTO the estuary (approx SE, ~135deg).
 * Ebb (Falling) -> Flows OUT of the estuary (approx NW, ~315deg).
 * Intensity is proportional to the rate of change (slope of tide).
 * Max current at mid-tide (slope max), zero at high/low water.
 */
export function getCurrents(date: Date): CurrentVector[] {
    const t = date.getTime();
    const hoursSinceRef = (t - REF_HIGH_TIDE) / (1000 * 60 * 60);
    const phaseRad = (hoursSinceRef % M2_PERIOD_HOURS) / M2_PERIOD_HOURS * 2 * Math.PI;

    // Slope determines speed. abs(sin(phase)).
    // Max slope is 1 (at mid tide). Min is 0 (at high/low).
    const slope = -Math.sin(phaseRad);
    const intensity = Math.abs(slope); // 0 to 1

    // Direction
    // If slope > 0 (Rising/Flood) -> Flow IN (SE)
    // If slope < 0 (Falling/Ebb) -> Flow OUT (NW)

    // Base angles for the main channel (approximate)
    // In: 135 deg (SE)
    // Out: 315 deg (NW)
    const baseRotation = slope > 0 ? 135 : 315;

    // Adjust rotation slightly per point to simulate realistic flow?
    // For MVP, uniform flow direction along the channel axis is fine.

    return CURRENT_POINTS.map(p => {
        // Add slight variance based on location for realism if needed
        // e.g. Zierbena might be more East/West
        const rotation = baseRotation;

        return {
            id: p.id,
            lat: p.lat,
            lng: p.lng,
            rotation,
            intensity, // Scale: 0 to 1
            directionLabel: getDirectionLabel(rotation)
        };
    });
}

function getDirectionLabel(deg: number): 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW' {
    const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(((deg % 360) / 45)) % 8;
    return dirs[index] as any;
}
