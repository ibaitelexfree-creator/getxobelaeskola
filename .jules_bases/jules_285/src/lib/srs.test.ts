import { describe, it, expect } from 'vitest';
import { calculateNextReview } from './srs';

describe('SRS Algorithm (SuperMemo-2)', () => {
  it('should set interval to 1 for first correct attempt', () => {
    const result = calculateNextReview(0, 2.5, true);
    expect(result.interval).toBe(1);
    expect(result.easeFactor).toBeGreaterThan(2.5); // increased ease
  });

  it('should set interval to 6 for second correct attempt (prev interval 1)', () => {
    const result = calculateNextReview(1, 2.6, true);
    expect(result.interval).toBe(6);
    expect(result.easeFactor).toBeGreaterThan(2.6);
  });

  it('should increase interval exponentially for subsequent correct attempts', () => {
    const prevInterval = 6;
    const prevEase = 2.7;
    const result = calculateNextReview(prevInterval, prevEase, true);

    // Expected: 6 * 2.7 = 16.2 -> 16
    expect(result.interval).toBe(16);
    expect(result.easeFactor).toBeGreaterThan(prevEase);
  });

  it('should reset interval to 1 and decrease ease on incorrect attempt', () => {
    const prevInterval = 20;
    const prevEase = 3.0;
    const result = calculateNextReview(prevInterval, prevEase, false);

    expect(result.interval).toBe(1);
    expect(result.easeFactor).toBeLessThan(prevEase); // decreased ease
    expect(result.easeFactor).toBeGreaterThanOrEqual(1.3); // min cap
  });

  it('should not decrease ease below 1.3', () => {
    const prevInterval = 10;
    const prevEase = 1.3;
    const result = calculateNextReview(prevInterval, prevEase, false);

    expect(result.easeFactor).toBe(1.3);
  });

  it('should calculate next review date correctly', () => {
    const result = calculateNextReview(0, 2.5, true);
    const now = new Date();
    const expectedDate = new Date(now.setDate(now.getDate() + 1));

    // Allow small time difference (execution time)
    const diff = Math.abs(result.nextReview.getTime() - expectedDate.getTime());
    expect(diff).toBeLessThan(1000); // less than 1 second diff
  });
});
