import { describe, it, expect } from 'vitest';
import { predictProbability, updateAbility, getRecommendation } from './montessori-ml';
import { MontessoriTopic } from '@/components/academy/montessori/types';

describe('Montessori ML Engine', () => {
    describe('predictProbability', () => {
        it('should return 0.5 when ability equals difficulty', () => {
            expect(predictProbability(0.5, 0.5)).toBeCloseTo(0.5);
        });

        it('should return > 0.5 when ability > difficulty', () => {
            expect(predictProbability(0.8, 0.5)).toBeGreaterThan(0.5);
        });

        it('should return < 0.5 when ability < difficulty', () => {
            expect(predictProbability(0.2, 0.5)).toBeLessThan(0.5);
        });
    });

    describe('updateAbility', () => {
        it('should increase ability on success', () => {
            const current = 0.5;
            const updated = updateAbility(current, 0.5, 'success');
            expect(updated).toBeGreaterThan(current);
        });

        it('should decrease ability on failure', () => {
            const current = 0.5;
            const updated = updateAbility(current, 0.5, 'failure');
            expect(updated).toBeLessThan(current);
        });

        it('should increase more for success on hard task than easy task', () => {
            const current = 0.5;
            // Success on hard task (difficulty 0.8) -> probability of success low -> (1 - prob) is large -> large increase
            const hardInc = updateAbility(current, 0.8, 'success') - current;
            // Success on easy task (difficulty 0.2) -> probability of success high -> (1 - prob) is small -> small increase
            const easyInc = updateAbility(current, 0.2, 'success') - current;

            expect(hardInc).toBeGreaterThan(easyInc);
        });
    });

    describe('getRecommendation', () => {
        const topics: MontessoriTopic[] = [
            { id: 'easy', difficulty: 0.2, type: 'boat-part', title: 'Easy', category: 'general', description: '', originalData: {} },
            { id: 'medium', difficulty: 0.5, type: 'boat-part', title: 'Medium', category: 'general', description: '', originalData: {} },
            { id: 'hard', difficulty: 0.8, type: 'boat-part', title: 'Hard', category: 'general', description: '', originalData: {} }
        ];

        it('should recommend topic closest to 0.7 probability', () => {
            // If ability is 0.5:
            // Easy (0.2): P(success) high (>0.8)
            // Medium (0.5): P(success) 0.5
            // Hard (0.8): P(success) low (<0.2)
            // Ideally we want P ~ 0.7.
            // Let's calculate P for each.
            // P(easy) = sigmoid(5 * (0.5 - 0.2)) = sigmoid(1.5) ≈ 0.81
            // P(medium) = sigmoid(5 * (0.5 - 0.5)) = sigmoid(0) = 0.5
            // P(hard) = sigmoid(5 * (0.5 - 0.8)) = sigmoid(-1.5) ≈ 0.18
            // |0.81 - 0.7| = 0.11
            // |0.5 - 0.7| = 0.2
            // |0.18 - 0.7| = 0.52
            // Should recommend Easy or maybe slightly harder.
            // Wait, 0.7 is "Optimal Success Probability".
            // If user has ability 0.5, they should tackle something slightly easier than their ability?
            // No, usually if success prob is 0.7, it means the task is slightly easier than their limit (which would be 0.5).
            // P(success) = 0.7 => 1 / (1 + exp(-5(a - d))) = 0.7
            // => exp(...) = 1/0.7 - 1 = 0.428
            // => -5(a - d) = ln(0.428) ≈ -0.85
            // => a - d = 0.17
            // => d = a - 0.17
            // So if ability is 0.5, optimal difficulty is 0.33.
            // Closest to 0.33 is 'easy' (0.2) or 'medium' (0.5).
            // |0.2 - 0.33| = 0.13
            // |0.5 - 0.33| = 0.17
            // So 'easy' should be recommended.

            const rec = getRecommendation(topics, [], 0.5);
            expect(rec?.id).toBe('easy');
        });

        it('should not recommend mastered topics', () => {
            const history = [{ topicId: 'easy', result: 'success', timestamp: Date.now() }];
            // @ts-expect-error: Mocking history with minimal fields
            const rec = getRecommendation(topics, history, 0.5);
            expect(rec?.id).not.toBe('easy');
        });
    });
});
