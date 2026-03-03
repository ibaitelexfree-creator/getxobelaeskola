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
    const mockedWeatherService = vi.mocked(WeatherService);

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should fetch wind speed on mount', async () => {
        mockedWeatherService.getGetxoWeather.mockResolvedValue({ windSpeed: 10 } as any);

        const { result } = renderHook(() => useWindSpeed());

        await waitFor(() => expect(result.current).toBe(10));
        expect(mockedWeatherService.getGetxoWeather).toHaveBeenCalledTimes(1);
    });

    it('should handle fetch errors gracefully and log to console', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
        const error = new Error('Fatal error');
        mockedWeatherService.getGetxoWeather.mockRejectedValue(error);

        const { result } = renderHook(() => useWindSpeed());

        await waitFor(() => expect(mockedWeatherService.getGetxoWeather).toHaveBeenCalled());
        expect(result.current).toBe(0);
        expect(consoleSpy).toHaveBeenCalledWith('Weather fetch error in useWindSpeed', error);

        consoleSpy.mockRestore();
    });

    it('should not update wind speed if data is undefined', async () => {
        mockedWeatherService.getGetxoWeather.mockResolvedValue({ windSpeed: undefined } as any);

        const { result } = renderHook(() => useWindSpeed());

        await waitFor(() => expect(mockedWeatherService.getGetxoWeather).toHaveBeenCalledTimes(1));
        // Should remain default (0)
        expect(result.current).toBe(0);
    });

    it('should retain the previous wind speed if a subsequent fetch fails', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

        // First fetch succeeds
        mockedWeatherService.getGetxoWeather.mockResolvedValueOnce({ windSpeed: 15 } as any);

        const { result } = renderHook(() => useWindSpeed(100));

        await waitFor(() => expect(result.current).toBe(15));

        // Second fetch fails
        mockedWeatherService.getGetxoWeather.mockRejectedValueOnce(new Error('Update failed'));

        // Wait for interval
        await waitFor(() => expect(mockedWeatherService.getGetxoWeather).toHaveBeenCalledTimes(2), { timeout: 2000 });

        // Should still be 15
        expect(result.current).toBe(15);

        consoleSpy.mockRestore();
    });

    it('should handle responses where windSpeed is undefined', async () => {
        // Mock a response without windSpeed
        mockedWeatherService.getGetxoWeather.mockResolvedValue({ someOtherData: true } as any);

        const { result } = renderHook(() => useWindSpeed());

        await waitFor(() => expect(mockedWeatherService.getGetxoWeather).toHaveBeenCalled());
        // Should remain default (0)
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
            mockedWeatherService.getGetxoWeather
                .mockResolvedValueOnce({ windSpeed: 10 } as any)
                .mockResolvedValueOnce({ windSpeed: 15 } as any);

            const { result } = renderHook(() => useWindSpeed(interval));

            await act(async () => {
                await vi.advanceTimersByTimeAsync(0);
            });

            expect(result.current).toBe(10);
            expect(mockedWeatherService.getGetxoWeather).toHaveBeenCalledTimes(1);

            // Advance time to trigger interval
            await act(async () => {
                await vi.advanceTimersByTimeAsync(interval);
            });

            expect(result.current).toBe(15);
            expect(mockedWeatherService.getGetxoWeather).toHaveBeenCalledTimes(2);
        });
    });
});
