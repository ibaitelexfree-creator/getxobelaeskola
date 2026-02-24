import { describe, it, expect } from 'vitest';
import {
  dmsToDecimal,
  decimalToDms,
  calculateDistance,
  calculateBearing,
  calculateTime,
  calculateMagnetic,
  calculateTrue,
  DMS,
  Coordinate
} from './nautical-calculator';

describe('Nautical Calculator Utils', () => {
  describe('DMS <-> Decimal Conversion', () => {
    it('should convert DMS to Decimal correctly (N/E)', () => {
      const dms: DMS = { degrees: 43, minutes: 30, seconds: 0, direction: 'N' };
      const decimal = dmsToDecimal(dms);
      expect(decimal).toBe(43.5);
    });

    it('should convert DMS to Decimal correctly (S/W)', () => {
      const dms: DMS = { degrees: 2, minutes: 15, seconds: 30, direction: 'W' };
      const decimal = dmsToDecimal(dms);
      // 2 + 15/60 + 30/3600 = 2.258333... -> negative
      expect(decimal).toBeCloseTo(-2.258333, 5);
    });

    it('should convert Decimal to DMS correctly (Lat)', () => {
      const decimal = 43.5;
      const dms = decimalToDms(decimal, true);
      expect(dms).toEqual({ degrees: 43, minutes: 30, seconds: 0, direction: 'N' });
    });

    it('should convert Decimal to DMS correctly (Lon - Negative)', () => {
      const decimal = -2.258333;
      const dms = decimalToDms(decimal, false);
      expect(dms.degrees).toBe(2);
      expect(dms.minutes).toBe(15);
      expect(dms.seconds).toBeCloseTo(30, 1);
      expect(dms.direction).toBe('W');
    });
  });

  describe('Distance & Bearing', () => {
    // Bilbao (approx): 43.344 N, 3.03 W
    // Plymouth (approx): 50.375 N, 4.142 W
    const bilbao: Coordinate = { lat: 43.344, lon: -3.03 };
    const plymouth: Coordinate = { lat: 50.375, lon: -4.142 };

    it('should calculate distance roughly correctly', () => {
      const dist = calculateDistance(bilbao, plymouth);
      // Distance is roughly 420-430 NM
      expect(dist).toBeGreaterThan(400);
      expect(dist).toBeLessThan(450);
    });

    it('should calculate initial bearing roughly correctly', () => {
      const bearing = calculateBearing(bilbao, plymouth);
      // Bearing should be roughly North slightly West (350-360 degrees)
      expect(bearing).toBeGreaterThan(340);
      expect(bearing).toBeLessThan(360);
    });
  });

  describe('Time Calculation', () => {
    it('should calculate time correctly', () => {
      const time = calculateTime(100, 10); // 100 NM at 10 knots
      expect(time).toBe(10);
    });

    it('should handle zero speed', () => {
      const time = calculateTime(100, 0);
      expect(time).toBe(0);
    });
  });

  describe('Magnetic Variation', () => {
    it('should calculate magnetic heading (Variation East)', () => {
      // True 090, Var 5E (+5) -> Mag = 90 - 5 = 85
      expect(calculateMagnetic(90, 5)).toBe(85);
    });

    it('should calculate magnetic heading (Variation West)', () => {
      // True 090, Var 5W (-5) -> Mag = 90 - (-5) = 95
      expect(calculateMagnetic(90, -5)).toBe(95);
    });

    it('should calculate true heading (Variation East)', () => {
      // Mag 085, Var 5E -> True = 85 + 5 = 90
      expect(calculateTrue(85, 5)).toBe(90);
    });
  });
});
