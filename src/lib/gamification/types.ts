export type GamificationAction =
    | 'LOGIN'
    | 'LESSON_COMPLETE'
    | 'QUIZ_PASS'
    | 'MODULE_COMPLETE'
    | 'COURSE_COMPLETE'
    | 'CHALLENGE_COMPLETE'
    | 'PERFECT_SCORE'
    | 'STREAK_BONUS';

export interface GamificationProfile {
    id: string;
    xp: number;
    current_streak: number;
    longest_streak: number;
    last_activity_date: string | null; // ISO 8601 UTC
}

export type BonusType = 'MULTIPLIER' | 'FLAT';

export interface Bonus {
    id: string;
    type: BonusType;
    value: number; // e.g., 1.5 for 1.5x multiplier, 50 for +50 XP
    description: string;
    expires_at?: string; // ISO 8601
}

export interface XPResult {
    baseXP: number;
    bonusXP: number;
    totalXP: number;
    appliedBonuses: Bonus[];
}

export interface StreakResult {
    currentStreak: number;
    isNewStreak: boolean; // True if incremented today
    streakReset: boolean; // True if reset to 1
    lastActivityDate: string; // New date to store
}
