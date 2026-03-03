import { describe, it, expect } from 'vitest';
import { getTideLevel, getCurrents } from './tide-engine';

describe('Tide Engine', () => {
    const REF_HIGH_TIDE = new Date('2024-01-01T04:00:00Z');
    const M2_PERIOD_MS = 12.4206 * 60 * 60 * 1000;

    describe('getTideLevel', () => {
        it('should calculate high tide correctly', () => {
            const state = getTideLevel(REF_HIGH_TIDE);
            expect(state.height).toBeCloseTo(4.3, 1);
            expect(state.percentage).toBeCloseTo(1.0, 2);
            expect(state.phase).toBe('falling');
        });

        it('should calculate low tide correctly', () => {
            const lowTideTime = new Date(REF_HIGH_TIDE.getTime() + M2_PERIOD_MS / 2);
            const state = getTideLevel(lowTideTime);
            expect(state.height).toBeCloseTo(0.7, 1);
            expect(state.percentage).toBeCloseTo(0.0, 2);
            expect(state.phase).toBe('falling');
        });

        it('should calculate mid-tide falling correctly', () => {
            const midTideFalling = new Date(REF_HIGH_TIDE.getTime() + M2_PERIOD_MS / 4);
            const state = getTideLevel(midTideFalling);
            expect(state.height).toBeCloseTo(2.5, 1);
            expect(state.percentage).toBeCloseTo(0.5, 2);
            expect(state.phase).toBe('falling');
        });

        it('should calculate mid-tide rising correctly', () => {
            const midTideRising = new Date(REF_HIGH_TIDE.getTime() + (3 * M2_PERIOD_MS) / 4);
            const state = getTideLevel(midTideRising);
            expect(state.height).toBeCloseTo(2.5, 1);
            expect(state.percentage).toBeCloseTo(0.5, 2);
            expect(state.phase).toBe('rising');
        });
    });

    describe('getCurrents', () => {
        it('should have zero intensity at high tide', () => {
            const currents = getCurrents(REF_HIGH_TIDE);
            for (const c of currents) {
                expect(c.intensity).toBeCloseTo(0, 2);
            }
        });

        it('should have max intensity and ebb rotation at peak ebb', () => {
            const peakEbb = new Date(REF_HIGH_TIDE.getTime() + M2_PERIOD_MS / 4);
            const currents = getCurrents(peakEbb);
            expect(currents.length).toBe(7);
            for (const c of currents) {
                expect(c.intensity).toBeCloseTo(1.0, 2);
                expect(c.rotation).toBe(315);
                expect(c.directionLabel).toBe('NW');
            }
        });

        it('should have max intensity and flood rotation at peak flood', () => {
            const peakFlood = new Date(REF_HIGH_TIDE.getTime() + (3 * M2_PERIOD_MS) / 4);
            const currents = getCurrents(peakFlood);
            expect(currents.length).toBe(7);
            for (const c of currents) {
                expect(c.intensity).toBeCloseTo(1.0, 2);
                expect(c.rotation).toBe(135);
                expect(c.directionLabel).toBe('SE');
            }
        });

        it('should return all 7 current points with correct properties', () => {
            const currents = getCurrents(REF_HIGH_TIDE);
            expect(currents).toHaveLength(7);
            const ids = currents.map(c => c.id).sort();
            expect(ids).toEqual(['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7']);

            for (const c of currents) {
                expect(c).toHaveProperty('lat');
                expect(c).toHaveProperty('lng');
                expect(c).toHaveProperty('rotation');
                expect(c).toHaveProperty('intensity');
                expect(c).toHaveProperty('directionLabel');
            }
        });
    });
});
