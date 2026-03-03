import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useSmartTracker } from './useSmartTracker';
import { Geolocation } from '@capacitor/geolocation';
import { isPointInWater } from '@/lib/geospatial/water-check';
import { getDistance } from '@/lib/geospatial/utils';
import { useWindSpeed } from '@/hooks/useWindSpeed';

// Mocks
vi.mock('@capacitor/geolocation', () => ({
    Geolocation: {
        checkPermissions: vi.fn(),
        requestPermissions: vi.fn(),
        watchPosition: vi.fn(),
        clearWatch: vi.fn(),
    },
}));

vi.mock('@capacitor/core', () => ({
    Capacitor: {
        isNativePlatform: vi.fn().mockReturnValue(false),
    },
}));

vi.mock('@/lib/geospatial/water-check', () => ({
    isPointInWater: vi.fn(),
}));

vi.mock('@/lib/geospatial/utils', () => ({
    getDistance: vi.fn(),
}));

vi.mock('@/hooks/useWindSpeed', () => ({
    useWindSpeed: vi.fn().mockReturnValue(10),
}));

vi.mock('@/hooks/useNetworkMonitor', () => ({
    useNetworkMonitor: vi.fn(),
}));

describe('useSmartTracker', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (isPointInWater as any).mockReturnValue(true);
        (getDistance as any).mockReturnValue(1000); // 1km from school
    });

    it('should initialize with default state', () => {
        const { result } = renderHook(() => useSmartTracker());

        expect(result.current.isTracking).toBe(false);
        expect(result.current.points).toEqual([]);
        expect(result.current.statusMessage).toBe('Reposo');
    });

    it('should start tracking manually', async () => {
        const mockWatchId = 'watch-123';
        (Geolocation.watchPosition as any).mockResolvedValue(mockWatchId);

        const { result } = renderHook(() => useSmartTracker());

        await act(async () => {
            await result.current.startTracking(false);
        });

        expect(result.current.isTracking).toBe(true);
        expect(result.current.isAutoTracking).toBe(false);
        expect(result.current.statusMessage).toBe('Grabando...');
    });

    it('should handle speed exceeding car threshold', async () => {
        let watchCallback: any;
        (Geolocation.watchPosition as any).mockImplementation((options: any, callback: any) => {
            watchCallback = callback;
            return Promise.resolve('watch-456');
        });

        const { result } = renderHook(() => useSmartTracker());

        await act(async () => {
            await result.current.startTracking(false);
        });

        // Current threshold for wind speed 10 is BASE (15 knots ~ 7.7 m/s)
        act(() => {
            watchCallback({
                coords: { latitude: 0, longitude: 0, speed: 20 }, // 20 m/s > threshold
                timestamp: Date.now()
            }, null);
        });

        expect(result.current.isTracking).toBe(false);
        expect(result.current.statusMessage).toBe('Detección de Vehículo (Coche) - Abortando');
    });

    it('should detect geofence return to school', async () => {
        let watchCallback: any;
        (Geolocation.watchPosition as any).mockImplementation((options: any, callback: any) => {
            watchCallback = callback;
            return Promise.resolve('watch-789');
        });

        const { result } = renderHook(() => useSmartTracker());

        await act(async () => {
            await result.current.startTracking(false);
        });

        // First point far away
        (getDistance as any).mockReturnValue(600); // > 500m
        act(() => {
            watchCallback({
                coords: { latitude: 1, longitude: 1, speed: 2 },
                timestamp: Date.now()
            }, null);
        });

        // Second point back at school
        (getDistance as any).mockReturnValue(20); // < SCHOOL_RADIUS
        act(() => {
            watchCallback({
                coords: { latitude: 0.0001, longitude: 0.0001, speed: 1 },
                timestamp: Date.now() + 10000
            }, null);
        });

        expect(result.current.statusMessage).toBe('Regreso a Escuela - Travesía Completada');
        expect(result.current.journeyEnded).toBe(true);
        expect(result.current.isTracking).toBe(false);
    });

    it('should add points every 5 seconds', async () => {
        let watchCallback: any;
        (Geolocation.watchPosition as any).mockImplementation((options: any, callback: any) => {
            watchCallback = callback;
            return Promise.resolve('watch-111');
        });

        const { result } = renderHook(() => useSmartTracker());

        await act(async () => {
            await result.current.startTracking(false);
        });

        const now = Date.now();

        act(() => {
            watchCallback({ coords: { latitude: 0, longitude: 0, speed: 1 }, timestamp: now }, null);
        });
        expect(result.current.points).toHaveLength(1);

        act(() => {
            watchCallback({ coords: { latitude: 0.001, longitude: 0.001, speed: 1 }, timestamp: now + 2000 }, null);
        });
        expect(result.current.points).toHaveLength(1); // Not enough time

        act(() => {
            watchCallback({ coords: { latitude: 0.002, longitude: 0.002, speed: 1 }, timestamp: now + 6000 }, null);
        });
        expect(result.current.points).toHaveLength(2); // Enough time
    });

    it('should handle error when watchPosition fails to start', async () => {
        (Geolocation.watchPosition as any).mockRejectedValue(new Error('Failed to start watch'));

        const { result } = renderHook(() => useSmartTracker());

        await act(async () => {
            await result.current.startTracking(false);
        });

        expect(result.current.isTracking).toBe(false);
        expect(result.current.error).toBe('Failed to start watch');
    });

    it('should handle error in watchPosition callback', async () => {
        let watchCallback: any;
        (Geolocation.watchPosition as any).mockImplementation((options: any, callback: any) => {
            watchCallback = callback;
            return Promise.resolve('watch-error-123');
        });

        const { result } = renderHook(() => useSmartTracker());

        await act(async () => {
            await result.current.startTracking(false);
        });

        act(() => {
            watchCallback(null, new Error('Location error'));
        });

        expect(result.current.error).toBe('Location error');
    });
});
