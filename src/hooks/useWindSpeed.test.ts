import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useWindSpeed } from './useWindSpeed';
import { WeatherService } from '@/lib/academy/weather-service';

// Mock WeatherService
vi.mock('@/lib/academy/weather-service', () => ({
    WeatherService: {
        getGetxoWeather: vi.fn()
    }
}));

describe('useWindSpeed', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should fetch wind speed on mount', async () => {
        (WeatherService.getGetxoWeather as any).mockResolvedValue({ windSpeed: 10 });

        const { result } = renderHook(() => useWindSpeed());

        await waitFor(() => expect(result.current).toBe(10));
        expect(WeatherService.getGetxoWeather).toHaveBeenCalledTimes(1);
    });

    it('should handle fetch errors gracefully and log to console', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const error = new Error('Fatal error');
        (WeatherService.getGetxoWeather as any).mockRejectedValue(error);

        const { result } = renderHook(() => useWindSpeed());

        await waitFor(() => expect(WeatherService.getGetxoWeather).toHaveBeenCalled());
        expect(result.current).toBe(0);
        expect(consoleSpy).toHaveBeenCalledWith('Weather fetch error in useWindSpeed', error);

        consoleSpy.mockRestore();
    });

    it('should not update wind speed if data is undefined', async () => {
        (WeatherService.getGetxoWeather as any).mockResolvedValue({ windSpeed: undefined });

        const { result } = renderHook(() => useWindSpeed());

        await waitFor(() => expect(WeatherService.getGetxoWeather).toHaveBeenCalled());
        expect(result.current).toBe(0);
    });

    describe('with fake timers', () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('should refresh wind speed based on interval', async () => {
            const interval = 1000;
            (WeatherService.getGetxoWeather as any)
                .mockResolvedValueOnce({ windSpeed: 10 })
                .mockResolvedValueOnce({ windSpeed: 15 });

            const { result } = renderHook(() => useWindSpeed(interval));

            // Initial fetch starts immediately in useEffect.
            // In Vitest with fake timers, we need to advance or run timers to let the async useEffect callback finish
            // if it uses anything that is affected by timers or just to yield.
            // Actually, fetch is async.

            await act(async () => {
                await vi.advanceTimersByTimeAsync(0);
            });

            expect(result.current).toBe(10);
            expect(WeatherService.getGetxoWeather).toHaveBeenCalledTimes(1);

            // Advance time to trigger interval
            await act(async () => {
                await vi.advanceTimersByTimeAsync(interval);
            });

            expect(result.current).toBe(15);
            expect(WeatherService.getGetxoWeather).toHaveBeenCalledTimes(2);
        });
    });
});
