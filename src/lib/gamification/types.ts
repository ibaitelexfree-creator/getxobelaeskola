
export interface GamificationConfig {
  pointsPerLesson: number;
  pointsPerStreakDay: number; // Bonus per day of current streak
  pointsPerPerfectTest: number; // Bonus on top of test score
  pointsPerTestBase: number; // Base points for completing a test
}

export type GamificationEventType = 'lesson_completed' | 'test_completed';

export interface GamificationEvent {
  type: GamificationEventType;
  data: {
    lessonId?: string;
    testScore?: number; // Normalized 0.0 to 1.0 or 0-100, let's assume 0-100 for clarity in UI, but engine can handle check
  };
}

export interface StreakState {
  currentStreak: number;
  lastActivityDate?: string | Date; // ISO string or Date object
}

export interface GamificationResult {
  xpEarned: number;
  breakdown: {
    base: number;
    streakBonus: number;
    perfectBonus: number;
  };
  message?: string; // Optional message for UI toast
}
