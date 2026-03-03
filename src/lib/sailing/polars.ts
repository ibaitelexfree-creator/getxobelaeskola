
/**
 * Interface representing Polar Diagram Data
 */
export interface PolarData {
  tws: number[]; // True Wind Speeds in knots
  twa: number[]; // True Wind Angles in degrees
  speeds: number[][]; // Boat speeds in knots [twsIndex][twaIndex]
}

/**
 * Approximate J80 Polar Data
 * Based on typical sportboat performance characteristics.
 * Note: These are estimated values for simulation purposes.
 */
export const J80_POLAR_DATA: PolarData = {
  tws: [0, 6, 8, 10, 12, 14, 16, 20, 25],
  twa: [0, 45, 52, 60, 75, 90, 110, 120, 135, 150, 180],
  speeds: [
    // TWS 0
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    // TWS 6
    [0.0, 4.5, 5.0, 5.5, 6.0, 6.2, 6.0, 5.5, 5.0, 4.2, 3.5],
    // TWS 8
    [0.0, 5.4, 5.8, 6.2, 6.8, 7.0, 6.8, 6.4, 6.0, 5.2, 4.5],
    // TWS 10
    [0.0, 5.8, 6.2, 6.6, 7.2, 7.5, 7.5, 7.2, 7.0, 6.2, 5.5],
    // TWS 12
    [0.0, 6.0, 6.5, 7.0, 7.8, 8.0, 8.2, 8.0, 7.8, 7.2, 6.5],
    // TWS 14 (Transition to planing downwind)
    [0.0, 6.1, 6.6, 7.2, 8.2, 8.5, 9.0, 9.5, 9.5, 8.5, 7.5],
    // TWS 16 (Planing)
    [0.0, 6.2, 6.7, 7.3, 8.5, 9.0, 10.5, 11.0, 10.5, 10.0, 8.5],
    // TWS 20
    [0.0, 6.3, 6.8, 7.4, 8.8, 10.0, 12.0, 13.0, 12.0, 11.0, 9.5],
    // TWS 25
    [0.0, 6.4, 6.9, 7.5, 9.0, 11.0, 14.0, 15.0, 14.0, 12.0, 10.5]
  ]
};

/**
 * Calculates the target boat speed for a J80 sailboat based on True Wind Speed (TWS) and True Wind Angle (TWA).
 * Uses bilinear interpolation on the J80_POLAR_DATA table.
 *
 * @param tws True Wind Speed in knots
 * @param twa True Wind Angle in degrees (0-360)
 * @returns Boat Speed (BSP) in knots
 */
export function calculateJ80Speed(tws: number, twa: number): number {
  // 1. Normalize TWA to 0-180 range
  let normTwa = Math.abs(twa) % 360;
  if (normTwa > 180) {
    normTwa = 360 - normTwa;
  }

  // 2. Handle edge cases / clamping
  // TWS clamping
  let effectiveTws = tws;
  if (effectiveTws < 0) effectiveTws = 0;
  const maxTws = J80_POLAR_DATA.tws[J80_POLAR_DATA.tws.length - 1];
  if (effectiveTws > maxTws) effectiveTws = maxTws;

  // 3. Find TWS indices
  // Find i such that tws[i] <= effectiveTws <= tws[i+1]
  let i = 0;
  while (i < J80_POLAR_DATA.tws.length - 2 && effectiveTws > J80_POLAR_DATA.tws[i + 1]) {
    i++;
  }
  // If effectiveTws is exactly the last element, i will be length-2, which is correct.
  // Actually, if effectiveTws > maxTws, we clamped it.

  const tws1 = J80_POLAR_DATA.tws[i];
  const tws2 = J80_POLAR_DATA.tws[i + 1];
  const t = (effectiveTws - tws1) / (tws2 - tws1); // Interpolation factor for TWS

  // 4. Find TWA indices
  // Find j such that twa[j] <= normTwa <= twa[j+1]
  let j = 0;
  // Handle case where normTwa is greater than max TWA in table (should be covered by 180 clamp if data goes to 180)
  // Our data goes to 180, so clamping shouldn't be strictly necessary if normTwa is 0-180.
  // But let's be safe.
  if (normTwa > 180) normTwa = 180; // Should be redundant due to step 1

  while (j < J80_POLAR_DATA.twa.length - 2 && normTwa > J80_POLAR_DATA.twa[j + 1]) {
    j++;
  }

  const twa1 = J80_POLAR_DATA.twa[j];
  const twa2 = J80_POLAR_DATA.twa[j + 1];
  const u = (normTwa - twa1) / (twa2 - twa1); // Interpolation factor for TWA

  // 5. Retrieve speeds for the 4 surrounding points
  const s11 = J80_POLAR_DATA.speeds[i][j];     // Speed at (tws1, twa1)
  const s12 = J80_POLAR_DATA.speeds[i][j + 1]; // Speed at (tws1, twa2)
  const s21 = J80_POLAR_DATA.speeds[i + 1][j]; // Speed at (tws2, twa1)
  const s22 = J80_POLAR_DATA.speeds[i + 1][j + 1]; // Speed at (tws2, twa2)

  // 6. Bilinear Interpolation
  // Interpolate along TWA for both TWS rows
  const speedAtTws1 = s11 + u * (s12 - s11);
  const speedAtTws2 = s21 + u * (s22 - s21);

  // Interpolate between the two TWS rows
  const finalSpeed = speedAtTws1 + t * (speedAtTws2 - speedAtTws1);

  return parseFloat(finalSpeed.toFixed(2));
}
