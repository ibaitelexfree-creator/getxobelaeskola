import { GamificationConfig, GamificationEvent, GamificationResult, StreakState } from './types';

export const DEFAULT_CONFIG: GamificationConfig = {
  pointsPerLesson: 10,
  pointsPerTestBase: 20,
  pointsPerPerfectTest: 50,
  pointsPerStreakDay: 5,
};

export class GamificationEngine {
  private config: GamificationConfig;

  constructor(config: Partial<GamificationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Calculates the XP earned for a given event and user's streak state.
   * @param event The gamification event (lesson, test, etc.)
   * @param streakState The user's current streak state
   * @returns GamificationResult with total XP and breakdown
   */
  processEvent(event: GamificationEvent, streakState: StreakState): GamificationResult {
    let base = 0;
    let streakBonus = 0;
    let perfectBonus = 0;

    const streak = streakState.currentStreak;

    switch (event.type) {
      case 'lesson_completed':
        base = this.config.pointsPerLesson;
        if (streak > 0) {
            streakBonus = streak * this.config.pointsPerStreakDay;
        }
        break;

      case 'test_completed':
        base = this.config.pointsPerTestBase;
        if (streak > 0) {
            streakBonus = streak * this.config.pointsPerStreakDay;
        }

        const score = event.data.testScore ?? 0;

        // Check for perfect score (handling both 0-1.0 and 0-100 scales)
        const isPerfect = score === 100 || score === 1.0;

        if (isPerfect) {
          perfectBonus = this.config.pointsPerPerfectTest;
        }
        break;

      default:
        console.warn(`Unknown gamification event type: ${event.type}`);
        return { xpEarned: 0, breakdown: { base: 0, streakBonus: 0, perfectBonus: 0 } };
    }

    const totalXP = base + streakBonus + perfectBonus;

    return {
      xpEarned: totalXP,
      breakdown: {
        base,
        streakBonus,
        perfectBonus
      }
    };
  }
}
