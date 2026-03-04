import { describe, it, expect } from 'vitest';
import { getTideLevel, getCurrents } from './tide-engine';

describe('Tide Engine', () => {
    // Reference High Tide is 2024-01-01T04:00:00Z
    const refHighTide = new Date('2024-01-01T04:00:00Z');
    const M2_PERIOD_HOURS = 12.4206;
    const MEAN_LEVEL = 2.5;
    const AMPLITUDE = 1.8;

    describe('getTideLevel', () => {
        it('calculates reference high tide correctly', () => {
            const tide = getTideLevel(refHighTide);
            expect(tide.height).toBeCloseTo(MEAN_LEVEL + AMPLITUDE, 2);
            expect(tide.percentage).toBeCloseTo(1, 2);
            // At exactly high tide, slope is 0, phase could be 'falling' or 'rising' depending on float precision
        });

        it('calculates low tide correctly', () => {
            const lowTideDate = new Date(refHighTide.getTime() + (M2_PERIOD_HOURS / 2) * 60 * 60 * 1000);
            const tide = getTideLevel(lowTideDate);
            expect(tide.height).toBeCloseTo(MEAN_LEVEL - AMPLITUDE, 2);
            expect(tide.percentage).toBeCloseTo(0, 2);
        });

        it('calculates mid-tide falling correctly', () => {
            const midTideFallingDate = new Date(refHighTide.getTime() + (M2_PERIOD_HOURS / 4) * 60 * 60 * 1000);
            const tide = getTideLevel(midTideFallingDate);
            expect(tide.height).toBeCloseTo(MEAN_LEVEL, 2);
            expect(tide.percentage).toBeCloseTo(0.5, 2);
            expect(tide.phase).toBe('falling');
        });

        it('calculates mid-tide rising correctly', () => {
            const midTideRisingDate = new Date(refHighTide.getTime() + (M2_PERIOD_HOURS * 3 / 4) * 60 * 60 * 1000);
            const tide = getTideLevel(midTideRisingDate);
            expect(tide.height).toBeCloseTo(MEAN_LEVEL, 2);
            expect(tide.percentage).toBeCloseTo(0.5, 2);
            expect(tide.phase).toBe('rising');
        });
    });

    describe('getCurrents', () => {
        it('returns currents for all grid points', () => {
            const currents = getCurrents(refHighTide);
            expect(currents.length).toBe(7); // CURRENT_POINTS length
        });

        it('calculates near-zero intensity at high tide', () => {
            const currents = getCurrents(refHighTide);
            expect(currents[0].intensity).toBeCloseTo(0, 2);
        });

        it('calculates near-zero intensity at low tide', () => {
            const lowTideDate = new Date(refHighTide.getTime() + (M2_PERIOD_HOURS / 2) * 60 * 60 * 1000);
            const currents = getCurrents(lowTideDate);
            expect(currents[0].intensity).toBeCloseTo(0, 2);
        });

        it('calculates max ebb current (falling tide)', () => {
            const midTideFallingDate = new Date(refHighTide.getTime() + (M2_PERIOD_HOURS / 4) * 60 * 60 * 1000);
            const currents = getCurrents(midTideFallingDate);
            expect(currents[0].intensity).toBeCloseTo(1, 2);
            expect(currents[0].rotation).toBe(315);
            expect(currents[0].directionLabel).toBe('NW');
        });

        it('calculates max flood current (rising tide)', () => {
            const midTideRisingDate = new Date(refHighTide.getTime() + (M2_PERIOD_HOURS * 3 / 4) * 60 * 60 * 1000);
            const currents = getCurrents(midTideRisingDate);
            expect(currents[0].intensity).toBeCloseTo(1, 2);
            expect(currents[0].rotation).toBe(135);
            expect(currents[0].directionLabel).toBe('SE');
        });
    });
});
