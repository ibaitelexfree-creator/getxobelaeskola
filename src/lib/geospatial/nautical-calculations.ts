export function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function toDeg(radians: number): number {
  return (radians * 180) / Math.PI;
}

/**
 * Calculates the distance between two coordinates in Nautical Miles.
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const dKm = R * c;
  return dKm / 1.852; // Convert km to Nautical Miles
}

/**
 * Calculates the initial bearing (forward azimuth) between two points.
 * Returns degrees (0-360).
 */
export function calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const startLat = toRad(lat1);
  const startLon = toRad(lon1);
  const endLat = toRad(lat2);
  const endLon = toRad(lon2);

  const dLon = endLon - startLon;

  const y = Math.sin(dLon) * Math.cos(endLat);
  const x =
    Math.cos(startLat) * Math.sin(endLat) -
    Math.sin(startLat) * Math.cos(endLat) * Math.cos(dLon);

  let bearing = toDeg(Math.atan2(y, x));
  bearing = (bearing + 360) % 360; // Normalize to 0-360
  return bearing;
}
