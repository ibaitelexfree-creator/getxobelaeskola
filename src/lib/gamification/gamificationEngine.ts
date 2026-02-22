import { differenceInCalendarDays, isWeekend, startOfDay, parseISO } from 'date-fns';
import { GamificationAction, Bonus, XPResult, StreakResult } from './types';
import { XP_VALUES } from './constants';
import { getRank } from './ranks';

/**
 * Calculates the XP awarded for a specific action, applying any active bonuses.
 *
 * @param action The action performed (e.g., 'LESSON_COMPLETE')
 * @param bonuses Array of active Bonus objects to apply
 * @returns XPResult object containing base, bonus, and total XP
 */
export function calculateXP(
    action: GamificationAction,
    bonuses: Bonus[] = []
): XPResult {
    const baseXP = XP_VALUES[action] || 0;

    let flatBonus = 0;
    let multiplier = 1;

    const appliedBonuses: Bonus[] = [];

    // Separate bonuses
    bonuses.forEach(bonus => {
        // Check expiration if present
        if (bonus.expires_at && new Date(bonus.expires_at) < new Date()) {
            return;
        }

        if (bonus.type === 'FLAT') {
            flatBonus += bonus.value;
            appliedBonuses.push(bonus);
        } else if (bonus.type === 'MULTIPLIER') {
            multiplier *= bonus.value;
            appliedBonuses.push(bonus);
        }
    });

    // Calculate total
    const totalXP = Math.round((baseXP + flatBonus) * multiplier);
    const bonusXP = totalXP - baseXP;

    return {
        baseXP,
        bonusXP,
        totalXP,
        appliedBonuses
    };
}

/**
 * Calculates the new streak status based on the last activity date.
 * Uses calendar days (local time logic usually preferred for streaks).
 *
 * @param lastActivityDate ISO string of the last activity date, or null if new user
 * @param currentStreak Current streak count
 * @param currentDate Date object for "now" (defaults to new Date())
 * @returns StreakResult object
 */
export function calculateStreak(
    lastActivityDate: string | null,
    currentStreak: number,
    currentDate: Date = new Date()
): StreakResult {
    // If no previous activity, start streak at 1
    if (!lastActivityDate) {
        return {
            currentStreak: 1,
            isNewStreak: true,
            streakReset: false,
            lastActivityDate: currentDate.toISOString()
        };
    }

    const last = parseISO(lastActivityDate);
    const now = currentDate;

    // Compare calendar days
    const diffDays = differenceInCalendarDays(now, last);

    if (diffDays === 0) {
        // Activity already recorded today, maintain streak but update last activity time
        return {
            currentStreak,
            isNewStreak: false,
            streakReset: false,
            lastActivityDate: currentDate.toISOString()
        };
    } else if (diffDays === 1) {
        // Activity was yesterday, increment streak
        return {
            currentStreak: currentStreak + 1,
            isNewStreak: true,
            streakReset: false,
            lastActivityDate: currentDate.toISOString()
        };
    } else {
        // Activity missed for a day or more, reset to 1
        return {
            currentStreak: 1,
            isNewStreak: true, // It's a new streak starting today
            streakReset: true,
            lastActivityDate: currentDate.toISOString()
        };
    }
}

/**
 * Checks for context-based bonuses (e.g., Weekend Warrior).
 *
 * @param date Date to check context against
 * @returns Array of applicable Bonus objects
 */
export function checkContextBonuses(date: Date = new Date()): Bonus[] {
    const bonuses: Bonus[] = [];

    if (isWeekend(date)) {
        bonuses.push({
            id: 'weekend_warrior',
            type: 'MULTIPLIER',
            value: 1.2,
            description: 'Weekend Warrior: +20% XP'
        });
    }

    return bonuses;
}

/**
 * Validates if a user levels up based on new total XP.
 *
 * @param currentXP Total XP before update
 * @param addedXP XP being added
 * @returns Object indicating if level up occurred and the new rank
 */
export function checkLevelUp(currentXP: number, addedXP: number) {
    const oldRank = getRank(currentXP);
    const newTotal = currentXP + addedXP;
    const newRank = getRank(newTotal);

    return {
        leveledUp: oldRank.id !== newRank.id,
        oldRank,
        newRank,
        newTotalXP: newTotal
    };
}
