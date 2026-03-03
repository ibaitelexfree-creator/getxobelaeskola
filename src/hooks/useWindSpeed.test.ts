import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
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
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    it('should fetch wind speed on mount', async () => {
        (WeatherService.getGetxoWeather as any).mockResolvedValue({ windSpeed: 10 });

        const { result } = renderHook(() => useWindSpeed());

        await waitFor(() => expect(result.current).toBe(10));
        expect(WeatherService.getGetxoWeather).toHaveBeenCalledTimes(1);
    });

    it('should handle fetch errors gracefully', async () => {
        const error = new Error('Fatal error');
        (WeatherService.getGetxoWeather as any).mockRejectedValue(error);

        const { result } = renderHook(() => useWindSpeed());

        await waitFor(() => expect(WeatherService.getGetxoWeather).toHaveBeenCalled());
        expect(result.current).toBe(0);
        expect(console.error).toHaveBeenCalledWith('Weather fetch error in useWindSpeed', error);
    });

    it('should handle undefined windSpeed in response', async () => {
        (WeatherService.getGetxoWeather as any).mockResolvedValue({ windSpeed: undefined });

        const { result } = renderHook(() => useWindSpeed());

        await waitFor(() => expect(WeatherService.getGetxoWeather).toHaveBeenCalled());
        expect(result.current).toBe(0);
    });

    it('should refresh wind speed based on interval', async () => {
        (WeatherService.getGetxoWeather as any)
            .mockResolvedValueOnce({ windSpeed: 10 })
            .mockResolvedValueOnce({ windSpeed: 15 });

        const refreshInterval = 100; // Use a very short interval
        const { result } = renderHook(() => useWindSpeed(refreshInterval));

        // Initial fetch
        await waitFor(() => expect(result.current).toBe(10));
        expect(WeatherService.getGetxoWeather).toHaveBeenCalledTimes(1);

        // Wait for the next fetch triggered by the interval
        await waitFor(() => expect(result.current).toBe(15), { timeout: 2000 });
        expect(WeatherService.getGetxoWeather).toHaveBeenCalledTimes(2);
    });

    it('should clear interval on unmount', () => {
        const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
        const { unmount } = renderHook(() => useWindSpeed());

        unmount();

        expect(clearIntervalSpy).toHaveBeenCalled();
    });
});
