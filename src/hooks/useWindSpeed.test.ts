import { describe, it, expect, beforeEach, vi } from 'vitest';
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
    });

    it('should fetch wind speed on mount', async () => {
        (WeatherService.getGetxoWeather as any).mockResolvedValue({ windSpeed: 10 });

        const { result } = renderHook(() => useWindSpeed());

        await waitFor(() => expect(result.current).toBe(10), { timeout: 2000 });
        expect(WeatherService.getGetxoWeather).toHaveBeenCalled();
    });

    it('should handle fetch errors gracefully', async () => {
        (WeatherService.getGetxoWeather as any).mockRejectedValue(new Error('Fatal error'));

        const { result } = renderHook(() => useWindSpeed());

        await waitFor(() => expect(WeatherService.getGetxoWeather).toHaveBeenCalled());
        expect(result.current).toBe(0);
    });
});
