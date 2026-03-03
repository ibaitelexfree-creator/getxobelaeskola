import { calculateAcademyProgress } from './progress-calculator';
import { describe, it, expect } from 'vitest';

describe('calculateAcademyProgress', () => {
  it('returns 0 when schema is empty', () => {
    expect(calculateAcademyProgress(['1'], [])).toBe(0);
  });

  it('returns 0 when no modules completed', () => {
    expect(calculateAcademyProgress([], ['1', '2'])).toBe(0);
  });

  it('calculates 50% correctly', () => {
    expect(calculateAcademyProgress(['1'], ['1', '2'])).toBe(50);
  });

  it('ignores completed modules not in schema (deprecated modules)', () => {
    expect(calculateAcademyProgress(['1', '3'], ['1', '2'])).toBe(50);
  });

  it('calculates 100% correctly', () => {
    expect(calculateAcademyProgress(['1', '2'], ['1', '2'])).toBe(100);
  });

  it('handles Set input', () => {
    const completed = new Set(['1']);
    expect(calculateAcademyProgress(completed, ['1', '2'])).toBe(50);
  });
});
