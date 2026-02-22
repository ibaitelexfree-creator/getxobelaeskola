import { GamificationAction, Bonus } from './types';

export const XP_VALUES: Record<GamificationAction, number> = {
    LOGIN: 10,
    LESSON_COMPLETE: 50,
    QUIZ_PASS: 100,
    MODULE_COMPLETE: 200,
    COURSE_COMPLETE: 500,
    CHALLENGE_COMPLETE: 300,
    PERFECT_SCORE: 50,
    STREAK_BONUS: 20,
};

export const STREAK_CONFIG = {
    DAILY_LOGIN_XP: 10,
    // Streak logic uses calendar days via date-fns
};

export const STANDARD_BONUSES = {
    WEEKEND_WARRIOR: {
        id: 'weekend_warrior',
        type: 'MULTIPLIER',
        value: 1.2,
        description: '20% XP Boost on Weekends'
    } as Bonus
};
