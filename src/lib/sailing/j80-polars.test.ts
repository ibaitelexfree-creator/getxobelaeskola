
import { describe, it, expect } from 'vitest';
import { calculateJ80Speed } from './j80-polars';

describe('calculateJ80Speed', () => {
    // Exact data points from the matrix
    it('should return exact speed for known matrix points', () => {
        // TWS 6, TWA 45 -> 4.5
        expect(calculateJ80Speed(45, 6)).toBe(4.5);
        // TWS 10, TWA 90 -> 7.6
        expect(calculateJ80Speed(90, 10)).toBe(7.6);
        // TWS 20, TWA 180 -> 10.5
        expect(calculateJ80Speed(180, 20)).toBe(10.5);
    });

    // Interpolation Tests
    it('should interpolate correctly between TWS values', () => {
        // TWA 90. TWS 9 (halfway between 8 and 10).
        // Speed at 8kts/90deg = 7.1
        // Speed at 10kts/90deg = 7.6
        // Expected: 7.35
        expect(calculateJ80Speed(90, 9)).toBe(7.35);
    });

    it('should interpolate correctly between TWA values', () => {
        // TWS 10. TWA 82.5 (halfway between 75 and 90).
        // Speed at 10kts/75deg = 7.2
        // Speed at 10kts/90deg = 7.6
        // Expected: 7.4
        expect(calculateJ80Speed(82.5, 10)).toBe(7.4);
    });

    it('should perform bilinear interpolation', () => {
        // TWS 9 (halfway between 8 and 10)
        // TWA 82.5 (halfway between 75 and 90)

        // At TWS 8:
        // 75deg -> 6.6
        // 90deg -> 7.1
        // Midpoint -> 6.85

        // At TWS 10:
        // 75deg -> 7.2
        // 90deg -> 7.6
        // Midpoint -> 7.4

        // Final midpoint between 6.85 and 7.4 -> 7.125
        // Function returns strictly 2 decimals, so 7.13? Or fixed string?
        // The implementation uses toFixed(2) then parseFloat.
        // 7.125 -> "7.13" -> 7.13
        expect(calculateJ80Speed(82.5, 9)).toBe(7.13);
    });

    // Boundary Tests
    it('should clamp TWS to minimum', () => {
        // TWS 2 (< 6). Should behave like 6.
        // TWA 45. Speed at 6kts = 4.5.
        expect(calculateJ80Speed(45, 2)).toBe(4.5);
    });

    it('should clamp TWS to maximum', () => {
        // TWS 30 (> 20). Should behave like 20.
        // TWA 180. Speed at 20kts = 10.5.
        expect(calculateJ80Speed(180, 30)).toBe(10.5);
    });

    it('should clamp TWA to minimum (upwind)', () => {
        // TWA 10 (< 45). Should behave like 45.
        // TWS 6. Speed at 45deg = 4.5.
        expect(calculateJ80Speed(10, 6)).toBe(4.5);
    });

    it('should clamp TWA to maximum (downwind)', () => {
        // TWA 190 (> 180). Should behave like 180.
        // TWS 20. Speed at 180deg = 10.5.
        expect(calculateJ80Speed(190, 20)).toBe(10.5);
    });

    // Symmetry
    it('should handle negative TWA symmetrically', () => {
        // TWA -90 should equal TWA 90
        // TWS 10. Speed at 90deg = 7.6.
        expect(calculateJ80Speed(-90, 10)).toBe(7.6);
    });
});
