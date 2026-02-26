
/**
 * J80 Polar Data (Velocity Prediction Program)
 *
 * This data represents the theoretical boat speed in knots for a J80 sailboat
 * at various True Wind Speeds (TWS) and True Wind Angles (TWA).
 *
 * Data source: Standard J80 VPP tables (representative values).
 */
const J80_POLAR_DATA = {
    // True Wind Speeds in knots
    tws: [6, 8, 10, 12, 14, 16, 20],
    // True Wind Angles in degrees
    twa: [45, 60, 75, 90, 110, 135, 150, 180],
    // Speed matrix in knots [TWS_Index][TWA_Index]
    speed: [
        // 6 kts TWS
        [4.5, 5.2, 5.8, 6.2, 6.4, 5.8, 4.8, 3.8],
        // 8 kts TWS
        [5.2, 6.0, 6.6, 7.1, 7.3, 6.8, 5.9, 4.9],
        // 10 kts TWS
        [5.8, 6.5, 7.2, 7.6, 8.0, 7.6, 6.8, 5.8],
        // 12 kts TWS
        [6.0, 6.8, 7.5, 8.1, 8.5, 8.8, 7.9, 6.9],
        // 14 kts TWS
        [6.1, 7.0, 7.7, 8.4, 9.1, 9.8, 9.0, 7.8],
        // 16 kts TWS (Planing starts downwind)
        [6.2, 7.1, 7.9, 8.6, 9.8, 11.0, 10.5, 8.8],
        // 20 kts TWS
        [6.3, 7.2, 8.1, 9.0, 11.0, 13.5, 12.5, 10.5]
    ]
};

/**
 * Calculates the predicted boat speed for a J80 based on wind conditions.
 * Uses bilinear interpolation on the polar data matrix.
 *
 * @param twa True Wind Angle in degrees (0 to 180). Negative values are treated as absolute.
 * @param tws True Wind Speed in knots.
 * @returns Predicted boat speed in knots.
 */
export function calculateJ80Speed(twa: number, tws: number): number {
    // 1. Normalize Inputs
    const absTwa = Math.abs(twa);
    const clampedTws = Math.max(J80_POLAR_DATA.tws[0], Math.min(tws, J80_POLAR_DATA.tws[J80_POLAR_DATA.tws.length - 1]));

    // 2. Handle TWA out of bounds (0-180)
    // If TWA is less than the first data point (e.g., < 45), we clamp it to the first point (assume upwind limit)
    // or we could extrapolate to 0 speed at 0 degrees. For simplicity and sailing logic (in irons),
    // we'll clamp to the lowest TWA but in reality speed drops to 0.
    // Let's implement a simple drop-off to 0 at 0 degrees if needed, but for now clamping to 45 is safer for VPP logic unless we want "in irons" logic.
    // Given the prompt asks for interpolation on *polars*, usually VPPs stop at the beat angle.
    // We will clamp TWA to the range [min_twa, max_twa] to avoid index errors.
    const clampedTwa = Math.max(J80_POLAR_DATA.twa[0], Math.min(absTwa, J80_POLAR_DATA.twa[J80_POLAR_DATA.twa.length - 1]));

    // 3. Find Indices
    // Find i such that TWS[i] <= tws <= TWS[i+1]
    let i = 0;
    while (i < J80_POLAR_DATA.tws.length - 2 && tws > J80_POLAR_DATA.tws[i+1]) {
        i++;
    }

    // Find j such that TWA[j] <= twa <= TWA[j+1]
    let j = 0;
    while (j < J80_POLAR_DATA.twa.length - 2 && absTwa > J80_POLAR_DATA.twa[j+1]) {
        j++;
    }

    // 4. Calculate Interpolation Factors (0..1)
    const tws1 = J80_POLAR_DATA.tws[i];
    const tws2 = J80_POLAR_DATA.tws[i+1];
    const t = (clampedTws - tws1) / (tws2 - tws1);

    const twa1 = J80_POLAR_DATA.twa[j];
    const twa2 = J80_POLAR_DATA.twa[j+1];
    // Avoid division by zero if twa points are identical (unlikely in this data)
    const u = (clampedTwa - twa1) / (twa2 - twa1);

    // 5. Bilinear Interpolation
    // Get the four surrounding data points
    const s11 = J80_POLAR_DATA.speed[i][j];     // Speed at (tws1, twa1)
    const s12 = J80_POLAR_DATA.speed[i][j+1];   // Speed at (tws1, twa2)
    const s21 = J80_POLAR_DATA.speed[i+1][j];   // Speed at (tws2, twa1)
    const s22 = J80_POLAR_DATA.speed[i+1][j+1]; // Speed at (tws2, twa2)

    // Interpolate along TWA for both TWS rows
    const speedAtTws1 = s11 + (s12 - s11) * u;
    const speedAtTws2 = s21 + (s22 - s21) * u;

    // Interpolate between the two TWS results
    const finalSpeed = speedAtTws1 + (speedAtTws2 - speedAtTws1) * t;

    return parseFloat(finalSpeed.toFixed(2));
}
