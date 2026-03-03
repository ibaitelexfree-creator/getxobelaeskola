import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getTidePredictions, getTideLevel, getTideState, fetchSeaState } from './puertos-del-estado';

describe('Puertos del Estado Simulation', () => {
    it('should return tide predictions for a given day', () => {
        const date = new Date('2024-01-01T12:00:00Z');
        const predictions = getTidePredictions(date);

        expect(predictions.length).toBeGreaterThan(0);
        predictions.forEach((p: any) => {
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
    let mockFetch: any;

    beforeEach(() => {
        mockFetch = vi.fn();
        if (typeof global !== 'undefined') {
            (global as any).fetch = mockFetch;
        }
    });

    it('should parse real API response with Spanish keys correctly', async () => {
        const mockResponse = {
            "Altura de ola significante": "1.5",
            "Periodo de pico": "9.2",
            "Temperatura del agua": "16.5",
            "fecha": "2024-03-03T10:00:00Z"
        };

        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse,
        });

        const result = await fetchSeaState();

        expect(result.waveHeight).toBe(1.5);
        expect(result.period).toBe(9.2);
        expect(result.waterTemp).toBe(16.5);
        expect(result.isSimulated).toBe(false);
        expect(result.timestamp).toBe(mockResponse.fecha);
    });

    it('should parse real API response with short keys (Hs, Tp, T) correctly', async () => {
        const mockResponse = [{
            "Hs": "2.1",
            "Tp": "10.5",
            "T": "14.8",
            "Wv": "12.5",
            "Wd": "270"
        }];

        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse,
        });

        const result = await fetchSeaState();

        expect(result.waveHeight).toBe(2.1);
        expect(result.period).toBe(10.5);
        expect(result.waterTemp).toBe(14.8);
        expect(result.windSpeed).toBe(12.5);
        expect(result.windDirection).toBe(270);
        expect(result.isSimulated).toBe(false);
    });

    it('should fallback to simulation when API returns 503', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 503,
        });

        const result = await fetchSeaState();

        expect(result.isSimulated).toBe(true);
        expect(result.waveHeight).toBeDefined();
        expect(result.period).toBeDefined();
    });

    it('should fallback to simulation when fetch throws error', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Network error'));

        const result = await fetchSeaState();

        expect(result.isSimulated).toBe(true);
    });
});
