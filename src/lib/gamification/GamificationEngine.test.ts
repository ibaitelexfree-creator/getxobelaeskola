import { describe, it, expect } from 'vitest';
import { GamificationEngine, DEFAULT_CONFIG } from './GamificationEngine';
import { GamificationEvent, StreakState } from './types';

describe('GamificationEngine', () => {
  const engine = new GamificationEngine();

  it('calculates base points for lesson completion (no streak)', () => {
    const event: GamificationEvent = { type: 'lesson_completed', data: {} };
    const streak: StreakState = { currentStreak: 0 };

    const result = engine.processEvent(event, streak);

    expect(result.xpEarned).toBe(DEFAULT_CONFIG.pointsPerLesson);
    expect(result.breakdown.streakBonus).toBe(0);
  });

  it('calculates streak bonus for lesson completion', () => {
    const event: GamificationEvent = { type: 'lesson_completed', data: {} };
    const streak: StreakState = { currentStreak: 3 };

    const result = engine.processEvent(event, streak);

    const expectedBonus = 3 * DEFAULT_CONFIG.pointsPerStreakDay;
    expect(result.xpEarned).toBe(DEFAULT_CONFIG.pointsPerLesson + expectedBonus);
    expect(result.breakdown.streakBonus).toBe(expectedBonus);
  });

  it('calculates base points for test completion (no perfect, no streak)', () => {
    const event: GamificationEvent = { type: 'test_completed', data: { testScore: 80 } };
    const streak: StreakState = { currentStreak: 0 };

    const result = engine.processEvent(event, streak);

    expect(result.xpEarned).toBe(DEFAULT_CONFIG.pointsPerTestBase);
    expect(result.breakdown.perfectBonus).toBe(0);
  });

  it('awards perfect score bonus for test (100 score)', () => {
    const event: GamificationEvent = { type: 'test_completed', data: { testScore: 100 } };
    const streak: StreakState = { currentStreak: 0 };

    const result = engine.processEvent(event, streak);

    expect(result.xpEarned).toBe(DEFAULT_CONFIG.pointsPerTestBase + DEFAULT_CONFIG.pointsPerPerfectTest);
    expect(result.breakdown.perfectBonus).toBe(DEFAULT_CONFIG.pointsPerPerfectTest);
  });

  it('awards perfect score bonus for test (1.0 score)', () => {
    const event: GamificationEvent = { type: 'test_completed', data: { testScore: 1.0 } };
    const streak: StreakState = { currentStreak: 0 };

    const result = engine.processEvent(event, streak);

    expect(result.xpEarned).toBe(DEFAULT_CONFIG.pointsPerTestBase + DEFAULT_CONFIG.pointsPerPerfectTest);
  });

  it('combines streak and perfect bonus', () => {
    const event: GamificationEvent = { type: 'test_completed', data: { testScore: 100 } };
    const streak: StreakState = { currentStreak: 2 };

    const result = engine.processEvent(event, streak);

    const streakBonus = 2 * DEFAULT_CONFIG.pointsPerStreakDay;
    const expectedTotal = DEFAULT_CONFIG.pointsPerTestBase + streakBonus + DEFAULT_CONFIG.pointsPerPerfectTest;

    expect(result.xpEarned).toBe(expectedTotal);
    expect(result.breakdown.streakBonus).toBe(streakBonus);
    expect(result.breakdown.perfectBonus).toBe(DEFAULT_CONFIG.pointsPerPerfectTest);
  });

  it('allows custom configuration', () => {
    const customEngine = new GamificationEngine({
        pointsPerLesson: 50,
        pointsPerStreakDay: 1
    });

    const event: GamificationEvent = { type: 'lesson_completed', data: {} };
    const streak: StreakState = { currentStreak: 10 };

    const result = customEngine.processEvent(event, streak);

    // 50 (base) + 10 * 1 (streak) = 60
    expect(result.xpEarned).toBe(60);
  });

  it('returns zero for unknown event types', () => {
    const event = { type: 'unknown_event', data: {} } as any;
    const streak: StreakState = { currentStreak: 5 };

    const result = engine.processEvent(event, streak);

    expect(result.xpEarned).toBe(0);
  });
});
