import { describe, it, expect } from 'vitest';
import { getTidePredictions, getTideLevel, getTideState } from './puertos-del-estado';

describe('Puertos del Estado Simulation', () => {
    it('should return tide predictions for a given day', () => {
        const date = new Date('2024-01-01T12:00:00Z');
        const predictions = getTidePredictions(date);

        expect(predictions.length).toBeGreaterThan(0);
        predictions.forEach(p => {
            expect(p).toHaveProperty('time');
            expect(p).toHaveProperty('height');
            expect(p).toHaveProperty('type');
        });
    });

    it('should calculate tide level within reasonable range', () => {
        const date = new Date();
        const level = getTideLevel(date.getTime());
        // Mean is 2.5, Amplitude is 1.5. Range [1.0, 4.0]
        expect(level).toBeGreaterThanOrEqual(0.0);
        expect(level).toBeLessThanOrEqual(5.0);
    });

    it('should determine tide state', () => {
        const level = 2.5;
        const state = getTideState(level);
        expect(['HIGH', 'LOW', 'MID']).toContain(state);
    });
});
