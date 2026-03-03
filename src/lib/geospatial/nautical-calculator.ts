export interface DMS {
  degrees: number;
  minutes: number;
  seconds: number;
  direction: 'N' | 'S' | 'E' | 'W';
}

export interface Coordinate {
  lat: number;
  lon: number;
}

/**
 * Converts Degrees, Minutes, Seconds to Decimal Degrees.
 */
export function dmsToDecimal(dms: DMS): number {
  let decimal = dms.degrees + dms.minutes / 60 + dms.seconds / 3600;
  if (dms.direction === 'S' || dms.direction === 'W') {
    decimal = -decimal;
  }
  return Number(decimal.toFixed(6));
}

/**
 * Converts Decimal Degrees to Degrees, Minutes, Seconds.
 */
export function decimalToDms(decimal: number, isLat: boolean): DMS {
  const absolute = Math.abs(decimal);
  const degrees = Math.floor(absolute);
  const minutesNotTruncated = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesNotTruncated);
  const seconds = Number(((minutesNotTruncated - minutes) * 60).toFixed(2));

  let direction: 'N' | 'S' | 'E' | 'W';
  if (isLat) {
    direction = decimal >= 0 ? 'N' : 'S';
  } else {
    direction = decimal >= 0 ? 'E' : 'W';
  }

  return { degrees, minutes, seconds, direction };
}

/**
 * Calculates the great-circle distance between two points using the Haversine formula.
 * Returns distance in Nautical Miles (NM).
 */
export function calculateDistance(start: Coordinate, end: Coordinate): number {
  const R = 3440.065; // Earth radius in Nautical Miles
  const dLat = toRad(end.lat - start.lat);
  const dLon = toRad(end.lon - start.lon);
  const lat1 = toRad(start.lat);
  const lat2 = toRad(end.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Number((R * c).toFixed(2));
}

/**
 * Calculates the initial bearing (forward azimuth) from start to end point.
 * Returns degrees (0-360).
 */
export function calculateBearing(start: Coordinate, end: Coordinate): number {
  const startLat = toRad(start.lat);
  const startLon = toRad(start.lon);
  const endLat = toRad(end.lat);
  const endLon = toRad(end.lon);

  const y = Math.sin(endLon - startLon) * Math.cos(endLat);
  const x =
    Math.cos(startLat) * Math.sin(endLat) -
    Math.sin(startLat) * Math.cos(endLat) * Math.cos(endLon - startLon);

  let bearing = toDeg(Math.atan2(y, x));
  bearing = (bearing + 360) % 360; // Normalize to 0-360

  return Number(bearing.toFixed(1));
}

/**
 * Calculates estimated travel time.
 * Returns time in decimal hours.
 */
export function calculateTime(distanceNM: number, speedKnots: number): number {
  if (speedKnots <= 0) return 0;
  return Number((distanceNM / speedKnots).toFixed(2));
}

/**
 * Formats decimal hours into HH:MM string.
 */
export function formatTime(decimalHours: number): string {
  const hours = Math.floor(decimalHours);
  const minutes = Math.round((decimalHours - hours) * 60);
  return `${hours}h ${minutes}m`;
}

/**
 * Calculates Magnetic Heading from True Heading given Variation.
 * Variation > 0 is East, Variation < 0 is West.
 * Rule: Variation East, Magnetic Least (Magnetic = True - Variation)
 *       Variation West, Magnetic Best (Magnetic = True - (-Variation) = True + Variation)
 * Wait, standard formula: True = Magnetic + Variation.
 * So Magnetic = True - Variation.
 */
export function calculateMagnetic(trueHeading: number, variation: number): number {
  let magnetic = trueHeading - variation;
  magnetic = (magnetic + 360) % 360;
  return Number(magnetic.toFixed(1));
}

/**
 * Calculates True Heading from Magnetic Heading given Variation.
 * True = Magnetic + Variation.
 */
export function calculateTrue(magneticHeading: number, variation: number): number {
  let trueH = magneticHeading + variation;
  trueH = (trueH + 360) % 360;
  return Number(trueH.toFixed(1));
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function toDeg(radians: number): number {
  return (radians * 180) / Math.PI;
}
