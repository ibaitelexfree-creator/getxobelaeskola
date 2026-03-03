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

    it('should handle fetch errors gracefully and log them', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const error = new Error('Fatal error');
        mockedWeatherService.getGetxoWeather.mockRejectedValue(error);

        const { result } = renderHook(() => useWindSpeed());

        await waitFor(() => expect(mockedWeatherService.getGetxoWeather).toHaveBeenCalled());
        expect(result.current).toBe(0);
        expect(consoleSpy).toHaveBeenCalledWith('Weather fetch error in useWindSpeed', error);
    });

    it('should retain the previous wind speed if a subsequent fetch fails', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});

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
    });

    it('should handle responses where windSpeed is undefined', async () => {
        // Mock a response without windSpeed
        mockedWeatherService.getGetxoWeather.mockResolvedValue({ someOtherData: true } as any);

        const { result } = renderHook(() => useWindSpeed());

        await waitFor(() => expect(mockedWeatherService.getGetxoWeather).toHaveBeenCalled());
        // Should remain default (0)
        expect(result.current).toBe(0);
    });

    it('should refresh wind speed at the specified interval', async () => {
        mockedWeatherService.getGetxoWeather
            .mockResolvedValueOnce({ windSpeed: 10 } as any)
            .mockResolvedValueOnce({ windSpeed: 20 } as any);

        const interval = 100;
        const { result } = renderHook(() => useWindSpeed(interval));

        await waitFor(() => expect(result.current).toBe(10));

        await waitFor(() => expect(result.current).toBe(20), { timeout: 2000 });
        expect(mockedWeatherService.getGetxoWeather).toHaveBeenCalledTimes(2);
    });
});
