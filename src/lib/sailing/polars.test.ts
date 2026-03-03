
import { describe, it, expect } from 'vitest';
import { calculateJ80Speed } from './polars';

describe('calculateJ80Speed', () => {
  it('should return exact values for points in the data table', () => {
    // TWS 6, TWA 45 -> 4.5
    expect(calculateJ80Speed(6, 45)).toBe(4.5);
    // TWS 20, TWA 150 -> 11.0
    expect(calculateJ80Speed(20, 150)).toBe(11.0);
    // TWS 0, TWA 90 -> 0
    expect(calculateJ80Speed(0, 90)).toBe(0.0);
  });

  it('should interpolate TWS correctly', () => {
    // TWS 7 (midpoint of 6 and 8), TWA 45
    // Speed at 6,45 is 4.5
    // Speed at 8,45 is 5.4
    // Expected: (4.5 + 5.4) / 2 = 4.95
    expect(calculateJ80Speed(7, 45)).toBe(4.95);
  });

  it('should interpolate TWA correctly', () => {
    // TWS 6, TWA 48.5 (midpoint of 45 and 52)
    // Speed at 6,45 is 4.5
    // Speed at 6,52 is 5.0
    // Expected: (4.5 + 5.0) / 2 = 4.75
    expect(calculateJ80Speed(6, 48.5)).toBe(4.75);
  });

  it('should perform bilinear interpolation', () => {
    // TWS 7 (mid 6-8), TWA 48.5 (mid 45-52)
    // TWS 6, 45: 4.5
    // TWS 6, 52: 5.0
    // TWS 8, 45: 5.4
    // TWS 8, 52: 5.8

    // Interpolated along TWS first:
    // TWS 7, 45: 4.95
    // TWS 7, 52: 5.4

    // Interpolated along TWA:
    // TWS 7, 48.5: (4.95 + 5.4) / 2 = 5.175 -> round to 2 decimals -> 5.17 (standard JS rounding behavior for .175)
    expect(calculateJ80Speed(7, 48.5)).toBe(5.17);
  });

  it('should handle negative TWA by taking absolute value', () => {
    // TWA -90 should be same as TWA 90
    const speed90 = calculateJ80Speed(10, 90);
    expect(calculateJ80Speed(10, -90)).toBe(speed90);
  });

  it('should handle TWA > 180 by mirroring', () => {
    // TWA 270 should be same as TWA 90 (360 - 270 = 90)
    const speed90 = calculateJ80Speed(10, 90);
    expect(calculateJ80Speed(10, 270)).toBe(speed90);

    // TWA 350 should be same as TWA 10
    const speed10 = calculateJ80Speed(10, 10);
    expect(calculateJ80Speed(10, 350)).toBe(speed10);
  });

  it('should clamp TWS to the maximum available value', () => {
    const maxTws = 25;
    const speedAtMax = calculateJ80Speed(maxTws, 90);
    // TWS 30 should yield same speed as TWS 25
    expect(calculateJ80Speed(30, 90)).toBe(speedAtMax);
  });

  it('should clamp TWS to 0 for negative values', () => {
    expect(calculateJ80Speed(-5, 90)).toBe(0);
  });

  it('should handle TWA 0 correctly', () => {
    expect(calculateJ80Speed(10, 0)).toBe(0);
  });

  it('should handle TWA 180 correctly', () => {
      // TWS 10, TWA 180 -> 5.5
      expect(calculateJ80Speed(10, 180)).toBe(5.5);
  });
});
