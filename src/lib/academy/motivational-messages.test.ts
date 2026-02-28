import { describe, it, expect } from 'vitest';
import { getMotivationalMessage, getStreakMessage, MOTIVATIONAL_MESSAGES } from './motivational-messages';

describe('getMotivationalMessage', () => {
    it('returns a message from unit_complete context', () => {
        const message = getMotivationalMessage('unit_complete');
        expect(MOTIVATIONAL_MESSAGES.unit_complete).toContain(message);
    });

    it('returns a message from quiz_passed context when score is low', () => {
        const message = getMotivationalMessage('quiz_passed', 70);
        expect(MOTIVATIONAL_MESSAGES.quiz_passed).toContain(message);
    });

    it('returns a message from high_score context when quiz_passed and score >= 90', () => {
        const message = getMotivationalMessage('quiz_passed', 90);
        expect(MOTIVATIONAL_MESSAGES.high_score).toContain(message);
    });

    it('returns a message from quiz_failed context', () => {
        const message = getMotivationalMessage('quiz_failed');
        expect(MOTIVATIONAL_MESSAGES.quiz_failed).toContain(message);
    });

    it('returns a message from level_unlocked context', () => {
        const message = getMotivationalMessage('level_unlocked');
        expect(MOTIVATIONAL_MESSAGES.level_unlocked).toContain(message);
    });

    it('returns empty string for streak context (not an array in getMotivationalMessage)', () => {
<<<<<<< HEAD
        const message = getMotivationalMessage('streak' as any);
=======
        // @ts-ignore: testing behavior with unexpected key that is not an array
        const message = getMotivationalMessage('streak');
>>>>>>> origin/jules/fix-lint-errors-17071256425989174302
        expect(message).toBe("");
    });
});

describe('getStreakMessage', () => {
    it('returns correct message for milestones', () => {
        expect(getStreakMessage(3)).toBe(MOTIVATIONAL_MESSAGES.streak[3]);
        expect(getStreakMessage(5)).toBe(MOTIVATIONAL_MESSAGES.streak[5]);
        expect(getStreakMessage(7)).toBe(MOTIVATIONAL_MESSAGES.streak[7]);
        expect(getStreakMessage(14)).toBe(MOTIVATIONAL_MESSAGES.streak[14]);
        expect(getStreakMessage(30)).toBe(MOTIVATIONAL_MESSAGES.streak[30]);
    });

    it('returns null for non-milestone days', () => {
        expect(getStreakMessage(1)).toBeNull();
        expect(getStreakMessage(4)).toBeNull();
        expect(getStreakMessage(10)).toBeNull();
    });
});
