import { describe, it, expect, beforeEach } from 'vitest';
import { ScoringManager } from './ScoringManager';

describe('ScoringManager', () => {
    let scoring: ScoringManager;

    beforeEach(() => {
        scoring = new ScoringManager();
    });

    it('should initialize with zero score and buoys', () => {
        expect(scoring.totalScore).toBe(0);
        expect(scoring.buoysCollected).toBe(0);
        expect(scoring.isGameOver()).toBe(false);
    });

    it('should accumulate time via update(dt) and calculate score correctly', () => {
        // Simulate 10 seconds passing
        const dt = 0.1;
        for (let i = 0; i < 100; i++) {
            scoring.update(dt);
        }

        // Base points: 1000. Time penalty: 8 per second.
        // 10 seconds * 8 = 80 penalty.
        // Expected score: 1000 - 80 = 920.
        const points = scoring.addObjectiveBonus();

        expect(points).toBe(920);
        expect(scoring.totalScore).toBe(920);
        expect(scoring.buoysCollected).toBe(1);
    });

    it('should reset time accumulation after collecting a buoy', () => {
        // First buoy: 10 seconds
        for (let i = 0; i < 100; i++) {
            scoring.update(0.1);
        }

        scoring.addObjectiveBonus();

        // Second buoy: 5 seconds
        for (let i = 0; i < 50; i++) {
            scoring.update(0.1);
        }

        // 5 seconds * 8 = 40 penalty.
        // Expected score: 1000 - 40 = 960.
        const points = scoring.addObjectiveBonus();

        expect(points).toBe(960);
        expect(scoring.totalScore).toBe(920 + 960);
        expect(scoring.buoysCollected).toBe(2);
    });

    it('should enforce minimum score of 10 points', () => {
        // Simulate very long time (e.g. 200 seconds)
        // 200 * 8 = 1600 penalty. 1000 - 1600 < 10.
        // Should cap at 10.

        for (let i = 0; i < 2000; i++) {
            scoring.update(0.1);
        }

        const points = scoring.addObjectiveBonus();

        expect(points).toBe(10);
        expect(scoring.totalScore).toBe(10);
    });

    it('should detect game over condition', () => {
        // Max buoys is 5
        for (let i = 0; i < 5; i++) {
            expect(scoring.isGameOver()).toBe(false);
            scoring.addObjectiveBonus();
        }

        expect(scoring.buoysCollected).toBe(5);
        expect(scoring.isGameOver()).toBe(true);

        // Adding more should return 0 points
        const extraPoints = scoring.addObjectiveBonus();
        expect(extraPoints).toBe(0);
        expect(scoring.buoysCollected).toBe(5); // Should not increment
    });
});
