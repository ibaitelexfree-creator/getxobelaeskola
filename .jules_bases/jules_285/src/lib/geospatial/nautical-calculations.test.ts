import { describe, it, expect } from 'vitest';
import { calculateDistance, calculateBearing, toRad, toDeg } from './nautical-calculations';

describe('Nautical Calculations', () => {
  describe('calculateDistance', () => {
    it('should return 0 for same coordinates', () => {
      expect(calculateDistance(0, 0, 0, 0)).toBe(0);
    });

    it('should calculate distance correctly (approx 60NM per degree latitude)', () => {
      // 1 degree of latitude is roughly 60 NM
      const dist = calculateDistance(0, 0, 1, 0);
      expect(dist).toBeCloseTo(60, 0);
    });

    it('should handle negative coordinates', () => {
      const dist = calculateDistance(-1, -1, 0, 0);
      expect(dist).toBeGreaterThan(0);
    });
  });

  describe('calculateBearing', () => {
    it('should return 0 for due North', () => {
      expect(calculateBearing(0, 0, 1, 0)).toBe(0);
    });

    it('should return 90 for due East', () => {
      expect(calculateBearing(0, 0, 0, 1)).toBe(90);
    });

    it('should return 180 for due South', () => {
      expect(calculateBearing(0, 0, -1, 0)).toBe(180);
    });

    it('should return 270 for due West', () => {
      expect(calculateBearing(0, 0, 0, -1)).toBe(270);
    });
  });

  describe('Conversions', () => {
    it('toRad converts degrees to radians', () => {
      expect(toRad(180)).toBeCloseTo(Math.PI);
    });

    it('toDeg converts radians to degrees', () => {
      expect(toDeg(Math.PI)).toBeCloseTo(180);
    });
  });
});
