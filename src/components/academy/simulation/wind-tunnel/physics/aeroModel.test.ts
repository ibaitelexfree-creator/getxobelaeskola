import { describe, it, expect } from 'vitest';
import {
    getLiftCoefficient,
    getDragCoefficient,
    detectLuffing,
    detectStall
} from './aeroModel';
import { PHYSICS_CONSTANTS } from './constants';

describe('aeroModel', () => {
    describe('getLiftCoefficient', () => {
        it('should return 0 in the luffing zone (0 - 5 degrees)', () => {
            expect(getLiftCoefficient(0)).toBe(0);
            expect(getLiftCoefficient(2.5)).toBe(0);
            expect(getLiftCoefficient(4.9)).toBe(0);
            expect(getLiftCoefficient(-3)).toBe(0);
        });

        it('should return 0.5 in the stall zone (> STALL_START_AOA)', () => {
            expect(getLiftCoefficient(PHYSICS_CONSTANTS.STALL_START_AOA + 0.1)).toBe(0.5);
            expect(getLiftCoefficient(30)).toBe(0.5);
            expect(getLiftCoefficient(90)).toBe(0.5);
            expect(getLiftCoefficient(-45)).toBe(0.5);
        });

        it('should return a curve in the linear/power zone', () => {
            // Peak lift should be around 15 degrees
            const peakLift = Math.sin((15 / 30) * Math.PI) * PHYSICS_CONSTANTS.MAX_LIFT_COEFF;
            expect(getLiftCoefficient(15)).toBeCloseTo(peakLift, 5);
            expect(getLiftCoefficient(-15)).toBeCloseTo(peakLift, 5);

            // Verify a point in between
            const lift10 = Math.sin((10 / 30) * Math.PI) * PHYSICS_CONSTANTS.MAX_LIFT_COEFF;
            expect(getLiftCoefficient(10)).toBeCloseTo(lift10, 5);

            // Boundary values (at 5 and 25)
            const lift5 = Math.sin((5 / 30) * Math.PI) * PHYSICS_CONSTANTS.MAX_LIFT_COEFF;
            expect(getLiftCoefficient(5)).toBeCloseTo(lift5, 5);
            const lift25 = Math.sin((25 / 30) * Math.PI) * PHYSICS_CONSTANTS.MAX_LIFT_COEFF;
            expect(getLiftCoefficient(25)).toBeCloseTo(lift25, 5);
        });
    });

    describe('getDragCoefficient', () => {
        it('should return stalled drag in the stall zone', () => {
            expect(getDragCoefficient(PHYSICS_CONSTANTS.STALL_START_AOA + 1, 0.5)).toBe(PHYSICS_CONSTANTS.STALL_DRAG_COEFF);
            expect(getDragCoefficient(45, 0.5)).toBe(PHYSICS_CONSTANTS.STALL_DRAG_COEFF);
            expect(getDragCoefficient(-30, 0.5)).toBe(PHYSICS_CONSTANTS.STALL_DRAG_COEFF);
        });

        it('should return base drag plus induced drag below stall zone', () => {
            const cl = 1.0;
            const expectedDrag = PHYSICS_CONSTANTS.MIN_DRAG_COEFF + (cl * cl * 0.1);
            expect(getDragCoefficient(15, cl)).toBe(expectedDrag);
            expect(getDragCoefficient(5, cl)).toBe(expectedDrag);
            expect(getDragCoefficient(-10, cl)).toBe(expectedDrag);
        });

        it('should handle zero lift coefficient', () => {
            expect(getDragCoefficient(10, 0)).toBe(PHYSICS_CONSTANTS.MIN_DRAG_COEFF);
        });
    });

    describe('detectLuffing', () => {
        it('should return true for AoA < 5 degrees', () => {
            expect(detectLuffing(0)).toBe(true);
            expect(detectLuffing(4.9)).toBe(true);
            expect(detectLuffing(-4.9)).toBe(true);
        });

        it('should return false for AoA >= 5 degrees', () => {
            expect(detectLuffing(5)).toBe(false);
            expect(detectLuffing(10)).toBe(false);
            expect(detectLuffing(-5)).toBe(false);
            expect(detectLuffing(-10)).toBe(false);
        });
    });

    describe('detectStall', () => {
        it('should return true for AoA > STALL_START_AOA', () => {
            expect(detectStall(PHYSICS_CONSTANTS.STALL_START_AOA + 0.1)).toBe(true);
            expect(detectStall(45)).toBe(true);
            expect(detectStall(-45)).toBe(true);
        });

        it('should return false for AoA <= STALL_START_AOA', () => {
            expect(detectStall(PHYSICS_CONSTANTS.STALL_START_AOA)).toBe(false);
            expect(detectStall(15)).toBe(false);
            expect(detectStall(-15)).toBe(false);
            expect(detectStall(0)).toBe(false);
        });
    });
});
