import { describe, it, expect } from 'vitest';
import { calculateXP, calculateStreak, checkContextBonuses, checkLevelUp } from './gamificationEngine';
import { Bonus } from './types';
import { XP_VALUES } from './constants';

describe('Gamification Engine', () => {
    describe('calculateXP', () => {
        it('should return base XP for an action', () => {
            const result = calculateXP('LESSON_COMPLETE');
            expect(result.totalXP).toBe(XP_VALUES.LESSON_COMPLETE);
            expect(result.bonusXP).toBe(0);
            expect(result.baseXP).toBe(XP_VALUES.LESSON_COMPLETE);
        });

        it('should apply multiplier bonus', () => {
            const bonus: Bonus = {
                id: 'test_mult',
                type: 'MULTIPLIER',
                value: 2,
                description: 'Double XP'
            };
            const result = calculateXP('LESSON_COMPLETE', [bonus]);
            expect(result.totalXP).toBe(XP_VALUES.LESSON_COMPLETE * 2);
            expect(result.bonusXP).toBe(XP_VALUES.LESSON_COMPLETE);
        });

        it('should apply flat bonus', () => {
             const bonus: Bonus = {
                id: 'test_flat',
                type: 'FLAT',
                value: 50,
                description: 'Bonus 50 XP'
            };
            const result = calculateXP('LESSON_COMPLETE', [bonus]);
            expect(result.totalXP).toBe(XP_VALUES.LESSON_COMPLETE + 50);
            expect(result.bonusXP).toBe(50);
        });

        it('should ignore expired bonuses', () => {
            const expiredBonus: Bonus = {
                id: 'expired',
                type: 'MULTIPLIER',
                value: 2,
                description: 'Expired',
                expires_at: new Date('2020-01-01').toISOString()
            };
            const result = calculateXP('LESSON_COMPLETE', [expiredBonus]);
            expect(result.totalXP).toBe(XP_VALUES.LESSON_COMPLETE);
        });
    });

    describe('calculateStreak', () => {
        // Mock dates (UTC)
        const today = new Date('2023-10-27T10:00:00Z');
        const yesterday = new Date('2023-10-26T10:00:00Z');
        const twoDaysAgo = new Date('2023-10-25T10:00:00Z');

        it('should start a new streak if no history', () => {
            const result = calculateStreak(null, 0, today);
            expect(result.currentStreak).toBe(1);
            expect(result.isNewStreak).toBe(true);
            expect(result.streakReset).toBe(false);
        });

        it('should increment streak if last activity was yesterday', () => {
            const result = calculateStreak(yesterday.toISOString(), 5, today);
            expect(result.currentStreak).toBe(6);
            expect(result.isNewStreak).toBe(true);
            expect(result.streakReset).toBe(false);
        });

        it('should maintain streak if last activity was today', () => {
            const result = calculateStreak(today.toISOString(), 5, today);
            expect(result.currentStreak).toBe(5);
            expect(result.isNewStreak).toBe(false);
            expect(result.streakReset).toBe(false);
            // Ensure lastActivityDate is updated to "today"
            expect(result.lastActivityDate).toBe(today.toISOString());
        });

        it('should reset streak if last activity was 2 days ago', () => {
            const result = calculateStreak(twoDaysAgo.toISOString(), 5, today);
            expect(result.currentStreak).toBe(1);
            expect(result.streakReset).toBe(true);
            expect(result.isNewStreak).toBe(true);
        });
    });

    describe('checkContextBonuses', () => {
        it('should return weekend bonus on Saturday', () => {
            const saturday = new Date('2023-10-28T10:00:00Z'); // A Saturday
            const bonuses = checkContextBonuses(saturday);
            expect(bonuses).toHaveLength(1);
            expect(bonuses[0].id).toBe('weekend_warrior');
        });

        it('should return no bonus on Wednesday', () => {
            const wednesday = new Date('2023-10-25T10:00:00Z'); // A Wednesday
            const bonuses = checkContextBonuses(wednesday);
            expect(bonuses).toHaveLength(0);
        });
    });

    describe('checkLevelUp', () => {
        // Based on RANKS in ranks.ts: Grumete (0), Marinero (200), Timonel (800)

        it('should detect level up from Grumete to Marinero', () => {
            // 190 + 20 = 210 (>= 200)
            const result = checkLevelUp(190, 20);
            expect(result.leveledUp).toBe(true);
            expect(result.oldRank.id).toBe('grumete');
            expect(result.newRank.id).toBe('marinero');
            expect(result.newTotalXP).toBe(210);
        });

        it('should not detect level up if threshold not crossed', () => {
            // 100 + 50 = 150 (< 200)
            const result = checkLevelUp(100, 50);
            expect(result.leveledUp).toBe(false);
            expect(result.oldRank.id).toBe('grumete');
            expect(result.newRank.id).toBe('grumete');
        });

        it('should handle level up across multiple ranks (unlikely but possible)', () => {
            // 0 + 1000 = 1000 (>= 800 Timonel)
            const result = checkLevelUp(0, 1000);
            expect(result.leveledUp).toBe(true);
            expect(result.oldRank.id).toBe('grumete');
            expect(result.newRank.id).toBe('timonel');
        });
    });
});
