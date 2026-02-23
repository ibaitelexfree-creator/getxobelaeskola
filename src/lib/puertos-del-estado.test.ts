import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchSeaState } from './puertos-del-estado';

import { getTidePredictions, getTideLevel, getTideState } from './puertos-del-estado';

describe('Puertos del Estado Simulation', () => {
    it('should return tide predictions for a given day', () => {
        const date = new Date('2024-01-01T12:00:00Z');
        const predictions = getTidePredictions(date);

        // Should have at least one high and one low tide
        expect(predictions.length).toBeGreaterThanOrEqual(2);

        predictions.forEach(p => {
            expect(p).toHaveProperty('time');
            expect(p).toHaveProperty('height');
            expect(p).toHaveProperty('type');
        });
    });

    it('should calculate tide level within reasonable range', () => {
        const date = new Date();
        const level = getTideLevel(date);
        // Mean is 2.5, Amplitude is 1.5. Range [1.0, 4.0]
        expect(level).toBeGreaterThanOrEqual(1.0);
        expect(level).toBeLessThanOrEqual(4.0);
    });

    it('should determine tide state', () => {
        const date = new Date();
        const state = getTideState(date);

        expect(state).toHaveProperty('height');
        expect(state).toHaveProperty('trend');
        expect(state).toHaveProperty('percentage');
        expect(state.percentage).toBeGreaterThanOrEqual(0);
        expect(state.percentage).toBeLessThanOrEqual(1);
    });
});

describe('fetchSeaState', () => {
    beforeEach(() => {
        global.fetch = vi.fn();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should fetch and parse real data correctly', async () => {
        const mockResponse = {
            fecha: "2026-02-23 14:00:00.0",
            datos: [
                { paramEseoo: "WindSpeed", valor: "23", factor: 100.0, averia: false }, // 0.23 m/s
                { paramEseoo: "WindDir", valor: "208", factor: 1.0, averia: false },
                { paramEseoo: "Tm02", valor: "391", factor: 100.0, averia: false }, // 3.91 s
                { paramEseoo: "Hm0", valor: "23", factor: 100.0, averia: false }, // 0.23 m
                { paramEseoo: "WaterTemp", valor: "1430", factor: 100.0, averia: false } // 14.3 C
            ]
        };

        (global.fetch as any).mockResolvedValue({
            ok: true,
            json: async () => mockResponse
        });

        const data = await fetchSeaState();

        expect(data.isSimulated).toBe(false);
        expect(data.waveHeight).toBe(0.23);
        expect(data.period).toBe(3.91);
        expect(data.waterTemp).toBe(14.3);
        // 0.23 m/s * 1.94384 = 0.447... -> 0.4
        expect(data.windSpeed).toBe(0.4);
        expect(data.windDirection).toBe(208);
        expect(data.timestamp).toBe("2026-02-23T14:00:00.0Z");
    });

    it('should fallback to simulation on API error', async () => {
        (global.fetch as any).mockRejectedValue(new Error('Network error'));

        const data = await fetchSeaState();

        expect(data.isSimulated).toBe(true);
        expect(data.timestamp).toBeDefined();
    });

    it('should fallback to simulation on missing data', async () => {
        const mockResponse = {
            fecha: "2026-02-23 14:00:00.0",
            datos: [] // Empty
        };

        (global.fetch as any).mockResolvedValue({
            ok: true,
            json: async () => mockResponse
        });

        const data = await fetchSeaState();

        expect(data.isSimulated).toBe(true);
    });
});
