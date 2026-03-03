import { describe, it, expect } from 'vitest';
import { convertSpeed, convertDistance, convertTemperature, convertPressure } from './unit-converter';

describe('unit-converter', () => {
    describe('convertSpeed', () => {
        it('should return the same value when from and to units are the same', () => {
            expect(convertSpeed(10, 'knots', 'knots')).toBe(10);
            expect(convertSpeed(20, 'kmh', 'kmh')).toBe(20);
            expect(convertSpeed(30, 'ms', 'ms')).toBe(30);
        });

        it('should convert knots to kmh correctly', () => {
            expect(convertSpeed(1, 'knots', 'kmh')).toBeCloseTo(1.852);
            expect(convertSpeed(10, 'knots', 'kmh')).toBeCloseTo(18.52);
        });

        it('should convert kmh to knots correctly', () => {
            expect(convertSpeed(1.852, 'kmh', 'knots')).toBeCloseTo(1);
            expect(convertSpeed(18.52, 'kmh', 'knots')).toBeCloseTo(10);
        });

        it('should convert knots to ms correctly', () => {
            expect(convertSpeed(1, 'knots', 'ms')).toBeCloseTo(0.514444);
        });

        it('should convert ms to knots correctly', () => {
            expect(convertSpeed(0.514444, 'ms', 'knots')).toBeCloseTo(1);
        });

        it('should convert kmh to ms correctly', () => {
            // 1 kmh = 1/1.852 knots. 1 knot = 0.514444 ms.
            // 1 kmh = 0.514444 / 1.852 ms = 0.277777... ms
            expect(convertSpeed(1, 'kmh', 'ms')).toBeCloseTo(0.277777, 5);
        });
    });

    describe('convertDistance', () => {
        it('should return the same value when from and to units are the same', () => {
            expect(convertDistance(10, 'meters', 'meters')).toBe(10);
            expect(convertDistance(20, 'feet', 'feet')).toBe(20);
            expect(convertDistance(30, 'km', 'km')).toBe(30);
        });

        it('should convert feet to meters correctly', () => {
            expect(convertDistance(1, 'feet', 'meters')).toBeCloseTo(0.3048);
            expect(convertDistance(10, 'feet', 'meters')).toBeCloseTo(3.048);
        });

        it('should convert meters to feet correctly', () => {
            expect(convertDistance(0.3048, 'meters', 'feet')).toBeCloseTo(1);
            expect(convertDistance(3.048, 'meters', 'feet')).toBeCloseTo(10);
        });

        it('should convert nautical_miles to km correctly', () => {
            expect(convertDistance(1, 'nautical_miles', 'km')).toBeCloseTo(1.852);
        });

        it('should convert km to nautical_miles correctly', () => {
            expect(convertDistance(1.852, 'km', 'nautical_miles')).toBeCloseTo(1);
        });

        it('should convert fathoms to meters correctly', () => {
            expect(convertDistance(1, 'fathoms', 'meters')).toBeCloseTo(1.8288);
        });

        it('should convert meters to fathoms correctly', () => {
            expect(convertDistance(1.8288, 'meters', 'fathoms')).toBeCloseTo(1);
        });

        it('should convert km to meters correctly', () => {
            expect(convertDistance(1, 'km', 'meters')).toBe(1000);
        });
    });

    describe('convertTemperature', () => {
        it('should return the same value when from and to units are the same', () => {
            expect(convertTemperature(25, 'celsius', 'celsius')).toBe(25);
            expect(convertTemperature(77, 'fahrenheit', 'fahrenheit')).toBe(77);
        });

        it('should convert celsius to fahrenheit correctly', () => {
            expect(convertTemperature(0, 'celsius', 'fahrenheit')).toBe(32);
            expect(convertTemperature(100, 'celsius', 'fahrenheit')).toBe(212);
            expect(convertTemperature(-40, 'celsius', 'fahrenheit')).toBe(-40);
        });

        it('should convert fahrenheit to celsius correctly', () => {
            expect(convertTemperature(32, 'fahrenheit', 'celsius')).toBe(0);
            expect(convertTemperature(212, 'fahrenheit', 'celsius')).toBe(100);
            expect(convertTemperature(-40, 'fahrenheit', 'celsius')).toBe(-40);
        });
    });

    describe('convertPressure', () => {
        it('should return the same value when from and to units are the same', () => {
            expect(convertPressure(1013, 'hpa', 'hpa')).toBe(1013);
            expect(convertPressure(29.92, 'inhg', 'inhg')).toBe(29.92);
        });

        it('should treat hpa and mb as equivalent', () => {
            expect(convertPressure(1013, 'hpa', 'mb')).toBe(1013);
            expect(convertPressure(1013, 'mb', 'hpa')).toBe(1013);
        });

        it('should convert hpa to inhg correctly', () => {
            expect(convertPressure(1013.25, 'hpa', 'inhg')).toBeCloseTo(29.92, 2);
        });

        it('should convert inhg to hpa correctly', () => {
            expect(convertPressure(29.92, 'inhg', 'hpa')).toBeCloseTo(1013.25, 1);
        });

        it('should convert mb to inhg correctly', () => {
            expect(convertPressure(1013.25, 'mb', 'inhg')).toBeCloseTo(29.92, 2);
        });

        it('should convert inhg to mb correctly', () => {
            expect(convertPressure(29.92, 'inhg', 'mb')).toBeCloseTo(1013.25, 1);
        });
    });
});
