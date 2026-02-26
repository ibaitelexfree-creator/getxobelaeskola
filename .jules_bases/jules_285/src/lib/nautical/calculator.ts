import { distance, bearing } from '@turf/turf';
import type { Units } from '@turf/helpers';

export type DMS = {
  degrees: number;
  minutes: number;
  seconds: number;
  direction: 'N' | 'S' | 'E' | 'W';
};

export type Coordinate = {
  lat: number;
  lon: number;
};

export type Eta = {
  days: number;
  hours: number;
  minutes: number;
  totalHours: number;
};

/**
 * Converts DMS (Degrees, Minutes, Seconds) to Decimal Degrees.
 */
export function dmsToDecimal(dms: DMS): number {
  let decimal = dms.degrees + dms.minutes / 60 + dms.seconds / 3600;
  if (dms.direction === 'S' || dms.direction === 'W') {
    decimal = -decimal;
  }
  return Number(decimal.toFixed(6));
}

/**
 * Converts Decimal Degrees to DMS.
 */
export function decimalToDms(decimal: number, isLatitude: boolean): DMS {
  const absolute = Math.abs(decimal);
  const degrees = Math.floor(absolute);
  const minutesNotTruncated = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesNotTruncated);
  const seconds = Number(((minutesNotTruncated - minutes) * 60).toFixed(2));

  let direction: 'N' | 'S' | 'E' | 'W';
  if (isLatitude) {
    direction = decimal >= 0 ? 'N' : 'S';
  } else {
    direction = decimal >= 0 ? 'E' : 'W';
  }

  return {
    degrees,
    minutes,
    seconds,
    direction,
  };
}

/**
 * Calculates Great Circle Distance in Nautical Miles between two coordinates.
 */
export function calculateDistance(start: Coordinate, end: Coordinate): number {
  const from = [start.lon, start.lat];
  const to = [end.lon, end.lat];
  const options = { units: 'nauticalmiles' as Units };
  // turf.distance returns distance in specified units
  return Number(distance(from, to, options).toFixed(2));
}

/**
 * Calculates Initial Bearing (True) and Magnetic Bearing.
 * Declination: positive for East, negative for West.
 */
export function calculateBearing(start: Coordinate, end: Coordinate, declination: number = 0): { trueBearing: number; magneticBearing: number } {
  const from = [start.lon, start.lat];
  const to = [end.lon, end.lat];

  let trueBearing = bearing(from, to);

  // Normalize to 0-360
  if (trueBearing < 0) {
    trueBearing += 360;
  }

  // Magnetic Bearing = True Bearing - Variation
  let magneticBearing = trueBearing - declination;

  // Normalize to 0-360
  if (magneticBearing < 0) {
    magneticBearing += 360;
  } else if (magneticBearing >= 360) {
    magneticBearing -= 360;
  }

  return {
    trueBearing: Number(trueBearing.toFixed(1)),
    magneticBearing: Number(magneticBearing.toFixed(1)),
  };
}

/**
 * Calculates Estimated Time of Arrival based on distance and speed.
 */
export function calculateEta(distanceNm: number, speedKnots: number): Eta {
  if (speedKnots <= 0) {
    return { days: 0, hours: 0, minutes: 0, totalHours: 0 };
  }

  const totalHoursFloat = distanceNm / speedKnots;
  const totalMinutes = Math.round(totalHoursFloat * 60);

  const days = Math.floor(totalMinutes / (24 * 60));
  const remainingMinutes = totalMinutes % (24 * 60);
  const hours = Math.floor(remainingMinutes / 60);
  const minutes = remainingMinutes % 60;

  return {
    days,
    hours,
    minutes,
    totalHours: Number(totalHoursFloat.toFixed(2))
  };
}
