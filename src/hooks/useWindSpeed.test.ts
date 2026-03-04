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

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should fetch wind speed on mount', async () => {
        (WeatherService.getGetxoWeather as any).mockResolvedValue({ windSpeed: 10 });

        const { result } = renderHook(() => useWindSpeed());

        await waitFor(() => expect(result.current).toBe(10));
        expect(WeatherService.getGetxoWeather).toHaveBeenCalledTimes(1);
    });

    it('should handle fetch errors gracefully', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        (WeatherService.getGetxoWeather as any).mockRejectedValue(new Error('Fatal error'));

        const { result } = renderHook(() => useWindSpeed());

        await waitFor(() => expect(WeatherService.getGetxoWeather).toHaveBeenCalled());
        expect(result.current).toBe(0);
        consoleSpy.mockRestore();
    });

    it('should refresh wind speed periodically', async () => {
        (WeatherService.getGetxoWeather as any)
            .mockResolvedValueOnce({ windSpeed: 10 })
            .mockResolvedValueOnce({ windSpeed: 15 });

        // Use a small interval for the test
        const interval = 100;
        const { result } = renderHook(() => useWindSpeed(interval));

        // Initial fetch
        await waitFor(() => expect(result.current).toBe(10));

        // Wait for next fetch
        await waitFor(() => expect(result.current).toBe(15), { timeout: 1000 });
        expect(WeatherService.getGetxoWeather).toHaveBeenCalledTimes(2);
    });

    it('should clear interval on unmount', async () => {
        const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
        (WeatherService.getGetxoWeather as any).mockResolvedValue({ windSpeed: 10 });

        const { unmount } = renderHook(() => useWindSpeed());

        await waitFor(() => expect(WeatherService.getGetxoWeather).toHaveBeenCalled());

        unmount();
        expect(clearIntervalSpy).toHaveBeenCalled();
        clearIntervalSpy.mockRestore();
    });

    it('should update interval when refreshIntervalMs changes', async () => {
        (WeatherService.getGetxoWeather as any).mockResolvedValue({ windSpeed: 10 });

        const { rerender } = renderHook(({ interval }) => useWindSpeed(interval), {
            initialProps: { interval: 100 }
        });

        await waitFor(() => expect(WeatherService.getGetxoWeather).toHaveBeenCalledTimes(1));

        // Change interval
        rerender({ interval: 200 });

        // Should fetch again because dependency refreshIntervalMs changed
        await waitFor(() => expect(WeatherService.getGetxoWeather).toHaveBeenCalledTimes(2));

        // Verify it still refreshes
        await waitFor(() => expect(WeatherService.getGetxoWeather).toHaveBeenCalledTimes(3), { timeout: 1000 });
    });

    it('should not update state if windSpeed is missing in response', async () => {
        (WeatherService.getGetxoWeather as any)
            .mockResolvedValueOnce({ windSpeed: 10 })
            .mockResolvedValueOnce({ windSpeed: undefined });

        const interval = 100;
        const { result } = renderHook(() => useWindSpeed(interval));

        await waitFor(() => expect(result.current).toBe(10));

        // Wait for second call
        await waitFor(() => expect(WeatherService.getGetxoWeather).toHaveBeenCalledTimes(2));

        // Ensure state remains 10 after a bit
        await new Promise(resolve => setTimeout(resolve, 50));
        expect(result.current).toBe(10);
    });
});
