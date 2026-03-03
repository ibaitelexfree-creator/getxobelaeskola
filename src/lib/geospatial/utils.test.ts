import { describe, it, expect } from 'vitest';
import { getDistance, msToKnots } from './utils';

describe('Geospatial Utils', () => {
  describe('getDistance', () => {
    it('should return 0 for same coordinates', () => {
      expect(getDistance(0, 0, 0, 0)).toBe(0);
    });

    it('should calculate distance correctly for 1 degree latitude offset', () => {
      // (1 * Math.PI / 180) * 6371e3 = 111194.92664455874
      const expected = (1 * Math.PI / 180) * 6371e3;
      expect(getDistance(0, 0, 1, 0)).toBeCloseTo(expected, 1);
    });

    it('should calculate distance correctly for 1 degree longitude offset at equator', () => {
      const expected = (1 * Math.PI / 180) * 6371e3;
      expect(getDistance(0, 0, 0, 1)).toBeCloseTo(expected, 1);
    });
  });

  describe('msToKnots', () => {
    it('should return 0 for 0 m/s', () => {
      expect(msToKnots(0)).toBe(0);
    });

    it('should return 1.94384 for 1 m/s', () => {
      expect(msToKnots(1)).toBe(1.94384);
    });

    it('should return 19.4384 for 10 m/s', () => {
      expect(msToKnots(10)).toBe(19.4384);
    });
  });
});
