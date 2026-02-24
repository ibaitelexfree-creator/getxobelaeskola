
import { describe, it, expect } from 'vitest';
import { calculateWindStats } from './utils';

describe('Wind Lab Calculations', () => {
  it('should identify No Go Zone (0-40 degrees)', () => {
    const stats = calculateWindStats(0, 10);
    expect(stats.pointOfSail).toBe('no_go');
    expect(stats.boatSpeed).toBe(0);
    expect(stats.vmg).toBe(0);

    const stats30 = calculateWindStats(30, 10);
    expect(stats30.pointOfSail).toBe('no_go');
    expect(stats30.boatSpeed).toBe(0);
  });

  it('should identify Close Hauled (45-60 degrees)', () => {
    const stats = calculateWindStats(50, 10);
    expect(stats.pointOfSail).toBe('close_hauled');
    expect(stats.boatSpeed).toBeGreaterThan(0);
    expect(stats.vmg).toBeGreaterThan(0); // Making progress upwind
  });

  it('should identify Beam Reach (80-100 degrees)', () => {
    const stats = calculateWindStats(90, 10);
    expect(stats.pointOfSail).toBe('beam_reach');
    // At 90 degrees, VMG to windward is 0 (cos(90)=0)
    expect(Math.abs(stats.vmg)).toBeLessThan(0.1);
    expect(stats.boatSpeed).toBeGreaterThan(5); // Should be fast
  });

  it('should identify Running (150-180 degrees)', () => {
    const stats = calculateWindStats(180, 10);
    expect(stats.pointOfSail).toBe('running');
    expect(stats.vmg).toBeLessThan(0); // Negative VMG means moving downwind efficiently
  });

  it('should handle negative angles or >360 correctly', () => {
    const statsNeg = calculateWindStats(-90, 10); // Equivalent to 270 (-90) -> 90 absolute
    expect(statsNeg.pointOfSail).toBe('beam_reach');

    const statsOver = calculateWindStats(450, 10); // 450 - 360 = 90
    expect(statsOver.pointOfSail).toBe('beam_reach');
  });

  it('should generate advice strings', () => {
    const stats = calculateWindStats(50, 10);
    expect(stats.trimAdvice.length).toBeGreaterThan(0);
    expect(stats.strategyAdvice).toBeTruthy();
  });
});
