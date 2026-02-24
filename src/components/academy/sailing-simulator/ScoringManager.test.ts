import { describe, it, expect, beforeEach } from 'vitest';
import { ScoringManager } from './ScoringManager';

describe('ScoringManager', () => {
    let scoring: ScoringManager;

    beforeEach(() => {
        scoring = new ScoringManager();
    });

    it('should initialize with zero score and buoys collected', () => {
        expect(scoring.totalScore).toBe(0);
        expect(scoring.buoysCollected).toBe(0);
    });

    it('should accumulate time in update() and calculate score correctly', () => {
        // Simulate 10 seconds passing
        scoring.update(5);
        scoring.update(5);

        // Score: 1000 - timeTaken * 8
        // 1000 - 10 * 8 = 920
        const points = scoring.addObjectiveBonus();

        expect(points).toBe(920);
        expect(scoring.totalScore).toBe(920);
        expect(scoring.buoysCollected).toBe(1);
    });

    it('should reset accumulated time after scoring a buoy', () => {
        // Buoy 1: 10 seconds
        scoring.update(10);
        scoring.addObjectiveBonus();

        // Buoy 2: 5 seconds
        scoring.update(5);
        const points = scoring.addObjectiveBonus();

        // 1000 - 5 * 8 = 960
        expect(points).toBe(960);
        expect(scoring.totalScore).toBe(920 + 960);
        expect(scoring.buoysCollected).toBe(2);
    });

    it('should enforce minimum score of 10 points', () => {
        // Simulate very long time (e.g. 200 seconds)
        // 1000 - 200 * 8 = -600 -> min 10
        scoring.update(200);
        const points = scoring.addObjectiveBonus();

        expect(points).toBe(10);
        expect(scoring.totalScore).toBe(10);
    });

    it('should stop scoring after MAX_BUOYS', () => {
        // Collect MAX_BUOYS (5)
        for (let i = 0; i < 5; i++) {
            scoring.update(1);
            scoring.addObjectiveBonus();
        }

        expect(scoring.buoysCollected).toBe(5);
        expect(scoring.isGameOver()).toBe(true);

        // Try to collect 6th
        scoring.update(1);
        const points = scoring.addObjectiveBonus();

        expect(points).toBe(0);
        expect(scoring.buoysCollected).toBe(5);
    });
});
