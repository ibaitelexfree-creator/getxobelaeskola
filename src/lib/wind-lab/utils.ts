
export type PointOfSail =
  | 'no_go'
  | 'close_hauled'
  | 'close_reach'
  | 'beam_reach'
  | 'broad_reach'
  | 'running';

export interface WindStats {
  pointOfSail: PointOfSail;
  pointOfSailLabel: string;
  vmg: number; // Velocity Made Good to windward/leeward
  boatSpeed: number; // Theoretical boat speed
  heelAngle: number; // Theoretical heel angle
  trimAdvice: string[];
  strategyAdvice: string;
}

/**
 * Calculates navigation statistics based on wind angle relative to bow (0-360) and wind speed.
 * @param windAngleRelative Degrees relative to bow (0 = Head to wind, 90 = Starboard beam, etc.)
 * @param windSpeed Knots
 */
export function calculateWindStats(windAngleRelative: number, windSpeed: number): WindStats {
  // Normalize angle to 0-180 for symmetric calculations (Port/Starboard symmetry)
  const angle = (windAngleRelative + 360) % 360;
  const absAngle = angle > 180 ? 360 - angle : angle;

  // 1. Determine Point of Sail
  let pointOfSail: PointOfSail = 'no_go';
  let label = 'Proa al Viento (No Go Zone)';

  if (absAngle < 45) {
    pointOfSail = 'no_go';
    label = 'Proa al Viento / No Go';
  } else if (absAngle >= 45 && absAngle < 60) {
    pointOfSail = 'close_hauled';
    label = 'Ceñida (Close Hauled)';
  } else if (absAngle >= 60 && absAngle < 80) {
    pointOfSail = 'close_reach';
    label = 'Descuartelar (Close Reach)';
  } else if (absAngle >= 80 && absAngle < 100) {
    pointOfSail = 'beam_reach';
    label = 'Través (Beam Reach)';
  } else if (absAngle >= 100 && absAngle < 150) {
    pointOfSail = 'broad_reach';
    label = 'Largo (Broad Reach)';
  } else {
    pointOfSail = 'running';
    label = 'Empopada (Running)';
  }

  // 2. Theoretical Boat Speed (Polar Curve Approximation)
  // Base speed factor (0.0 to 1.0) based on angle
  // 0-40: 0 (No Go)
  // 45: 0.6
  // 90: 0.9
  // 110-140: 1.0 (Max speed usually at Broad Reach)
  // 180: 0.7 (Slower dead downwind)

  let speedFactor = 0;
  if (absAngle < 40) {
    speedFactor = 0; // Stalled
  } else if (absAngle < 45) {
    // Linear ramp from 40->45
    speedFactor = (absAngle - 40) / 5 * 0.6;
  } else if (absAngle < 90) {
    // 45->90 : 0.6 -> 0.9
    speedFactor = 0.6 + ((absAngle - 45) / 45) * 0.3;
  } else if (absAngle < 135) {
    // 90->135 : 0.9 -> 1.0
    speedFactor = 0.9 + ((absAngle - 90) / 45) * 0.1;
  } else {
    // 135->180 : 1.0 -> 0.7
    speedFactor = 1.0 - ((absAngle - 135) / 45) * 0.3;
  }

  // Theoretical max hull speed approx for a 24-30ft boat ~ 6-7 knots usually,
  // but let's say it scales with wind up to a limit.
  // Simple model: Boat Speed = Wind Speed * Factor, capped at Hull Speed (e.g. 8kn)
  const maxHullSpeed = 8.0;
  let theoreticalSpeed = Math.min(windSpeed * speedFactor, maxHullSpeed);

  // If wind is too low, speed is 0
  if (windSpeed < 1) theoreticalSpeed = 0;

  // 3. VMG Calculation (Velocity Made Good)
  // VMG = Speed * cos(True Wind Angle)
  // Upwind VMG is positive, Downwind VMG is negative (relative to wind origin).
  // Usually VMG is presented as "Speed towards destination".
  // For Upwind/Downwind optimization:
  // VMG to Windward = Speed * cos(radians(absAngle))
  const rads = (absAngle * Math.PI) / 180;
  const vmg = theoreticalSpeed * Math.cos(rads);

  // 4. Heel Angle Approximation
  // Max heel at beam reach/close reach, zero at run.
  // Logic: Max at 45-90, drops off after 90.
  let heel = 0;
  if (absAngle > 40 && absAngle < 160) {
    // Actually close hauled heels more due to lift/drag ratio.
    // Let's simplify: Max heel at 50-90.
    if (absAngle < 90) heel = 20 * (windSpeed / 15);
    else heel = 20 * (windSpeed / 15) * (1 - (absAngle - 90) / 90);
  }
  heel = Math.min(heel, 35); // Cap at 35 degrees

  // 5. Trim Advice & Strategy
  const trimAdvice: string[] = [];
  let strategy = "";

  switch (pointOfSail) {
    case 'no_go':
      trimAdvice.push("Velas flameando.");
      trimAdvice.push("Sin gobierno.");
      strategy = "Zona muerta. Abatirse para ganar velocidad.";
      break;
    case 'close_hauled':
      trimAdvice.push("Cazar Mayor al centro.");
      trimAdvice.push("Foque cazado a tope.");
      trimAdvice.push("Carro de mayor a barlovento.");
      strategy = "Máximo VMG a barlovento. Vigilar catavientos de proa.";
      break;
    case 'close_reach':
      trimAdvice.push("Largar escotas ligeramente.");
      trimAdvice.push("Carro de mayor centrado.");
      strategy = "Rumbo rápido y cómodo. Buen compromiso velocidad/rumbo.";
      break;
    case 'beam_reach':
      trimAdvice.push("Velas a 45 grados aproximadamente.");
      trimAdvice.push("Ajustar para flujo laminar en toda la vela.");
      strategy = "Rumbo más rápido. Aprovechar las rachas para orzar ligeramente.";
      break;
    case 'broad_reach':
      trimAdvice.push("Largar escotas bastante.");
      trimAdvice.push("Contra rígida (Vang) cazada para aplanar baluma.");
      strategy = "Máxima velocidad en planeo con viento fuerte.";
      break;
    case 'running':
      trimAdvice.push("Velas abiertas totalmente.");
      trimAdvice.push("Posible 'Orejas de Burro' (Amanar).");
      strategy = "Vigilar trasluchadas involuntarias. Rumbo inestable con ola.";
      break;
  }

  return {
    pointOfSail,
    pointOfSailLabel: label,
    vmg: parseFloat(vmg.toFixed(2)),
    boatSpeed: parseFloat(theoreticalSpeed.toFixed(2)),
    heelAngle: parseFloat(heel.toFixed(1)),
    trimAdvice,
    strategyAdvice: strategy
  };
}
