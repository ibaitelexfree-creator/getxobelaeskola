import { describe, it, expect } from 'vitest';
import { isPointInWater, validateBoatPosition } from './water-check';

describe('water-check logic', () => {
    describe('isPointInWater', () => {
        it('should return true for points in water (Getxo area)', () => {
            // Points from water-geometry.json
            expect(isPointInWater(43.3776633, -3.0851083)).toBe(true);
            expect(isPointInWater(43.371291, -3.0944405)).toBe(true);
        });

        it('should return false for points on land (Getxo town)', () => {
            // Known land point
            expect(isPointInWater(43.35, -3.00)).toBe(false);
        });

        it('should return false for points far away', () => {
            expect(isPointInWater(0, 0)).toBe(false);
        });
    });

    describe('validateBoatPosition', () => {
        it('should return inWater: true for water points', () => {
            const result = validateBoatPosition(43.3776633, -3.0851083);
            expect(result.inWater).toBe(true);
            expect(result.message).toBeUndefined();
        });

        it('should return inWater: false and a warning message for land points', () => {
            const result = validateBoatPosition(43.35, -3.00);
            expect(result.inWater).toBe(false);
            expect(result.message).toBe('Warning: Boat is on land!');
        });
    });
});
