import { describe, it, expect } from 'vitest';
import {
    deg2rad,
    rad2deg,
    normalizeAngle360,
    normalizeAngle180,
    angleDifference
} from './angleUtils';

describe('angleUtils', () => {
    describe('deg2rad', () => {
        it('converts 0 degrees to 0 radians', () => {
            expect(deg2rad(0)).toBe(0);
        });

        it('converts 90 degrees to PI/2 radians', () => {
            expect(deg2rad(90)).toBeCloseTo(Math.PI / 2);
        });

        it('converts 180 degrees to PI radians', () => {
            expect(deg2rad(180)).toBeCloseTo(Math.PI);
        });

        it('converts 270 degrees to 1.5 * PI radians', () => {
            expect(deg2rad(270)).toBeCloseTo(1.5 * Math.PI);
        });

        it('converts 360 degrees to 2 * PI radians', () => {
            expect(deg2rad(360)).toBeCloseTo(2 * Math.PI);
        });

        it('handles negative angles', () => {
            expect(deg2rad(-90)).toBeCloseTo(-Math.PI / 2);
            expect(deg2rad(-180)).toBeCloseTo(-Math.PI);
        });
    });

    describe('rad2deg', () => {
        it('converts 0 radians to 0 degrees', () => {
            expect(rad2deg(0)).toBe(0);
        });

        it('converts PI/2 radians to 90 degrees', () => {
            expect(rad2deg(Math.PI / 2)).toBeCloseTo(90);
        });

        it('converts PI radians to 180 degrees', () => {
            expect(rad2deg(Math.PI)).toBeCloseTo(180);
        });

        it('converts 1.5 * PI radians to 270 degrees', () => {
            expect(rad2deg(1.5 * Math.PI)).toBeCloseTo(270);
        });

        it('converts 2 * PI radians to 360 degrees', () => {
            expect(rad2deg(2 * Math.PI)).toBeCloseTo(360);
        });

        it('handles negative angles', () => {
            expect(rad2deg(-Math.PI / 2)).toBeCloseTo(-90);
            expect(rad2deg(-Math.PI)).toBeCloseTo(-180);
        });
    });

    describe('normalizeAngle360', () => {
        it('keeps angles in [0, 360) unchanged', () => {
            expect(normalizeAngle360(0)).toBe(0);
            expect(normalizeAngle360(90)).toBe(90);
            expect(normalizeAngle360(180)).toBe(180);
            expect(normalizeAngle360(359.9)).toBeCloseTo(359.9);
        });

        it('wraps angles >= 360', () => {
            expect(normalizeAngle360(360)).toBe(0);
            expect(normalizeAngle360(450)).toBe(90);
            expect(normalizeAngle360(720)).toBe(0);
        });

        it('wraps negative angles', () => {
            expect(normalizeAngle360(-90)).toBe(270);
            expect(normalizeAngle360(-180)).toBe(180);
            expect(normalizeAngle360(-360)).toBe(0);
            expect(normalizeAngle360(-450)).toBe(270);
        });
    });

    describe('normalizeAngle180', () => {
        it('keeps angles in [-180, 180] unchanged', () => {
            expect(normalizeAngle180(0)).toBe(0);
            expect(normalizeAngle180(90)).toBe(90);
            expect(normalizeAngle180(180)).toBe(180);
            expect(normalizeAngle180(-90)).toBe(-90);
        });

        it('wraps angles > 180', () => {
            expect(normalizeAngle180(181)).toBe(-179);
            expect(normalizeAngle180(270)).toBe(-90);
            expect(normalizeAngle180(360)).toBe(0);
            expect(normalizeAngle180(450)).toBe(90);
        });

        it('wraps angles < -180', () => {
            expect(normalizeAngle180(-181)).toBe(179);
            expect(normalizeAngle180(-270)).toBe(90);
            expect(normalizeAngle180(-360)).toBe(0);
            expect(normalizeAngle180(-450)).toBe(-90);
        });
    });

    describe('angleDifference', () => {
        it('calculates difference between positive angles', () => {
            expect(angleDifference(90, 0)).toBe(90);
            expect(angleDifference(0, 90)).toBe(-90);
            expect(angleDifference(180, 90)).toBe(90);
            expect(angleDifference(90, 180)).toBe(-90);
        });

        it('handles wrapping across 360/0 boundary', () => {
            expect(angleDifference(10, 350)).toBe(20);
            expect(angleDifference(350, 10)).toBe(-20);
            expect(angleDifference(0, 270)).toBe(90);
            expect(angleDifference(270, 0)).toBe(-90);
        });

        it('handles negative angles', () => {
            expect(angleDifference(-10, 10)).toBe(-20);
            expect(angleDifference(10, -10)).toBe(20);
            expect(angleDifference(-170, 170)).toBe(20);
            expect(angleDifference(170, -170)).toBe(-20);
        });

        it('handles large angles', () => {
            expect(angleDifference(730, 0)).toBe(10);
            expect(angleDifference(0, 730)).toBe(-10);
            expect(angleDifference(-730, 0)).toBe(-10);
            expect(angleDifference(0, -730)).toBe(10);
        });
    });
});
