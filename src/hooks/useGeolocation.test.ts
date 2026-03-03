import { renderHook, act, waitFor } from '@testing-library/react';
import { useGeolocation } from './useGeolocation';
import { Geolocation } from '@capacitor/geolocation';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mocks
vi.mock('@capacitor/geolocation', () => ({
    Geolocation: {
        checkPermissions: vi.fn(),
        requestPermissions: vi.fn(),
        watchPosition: vi.fn(),
        clearWatch: vi.fn(),
    },
}));

// Mock @capacitor/core
const mockIsNativePlatform = vi.fn();
vi.mock('@capacitor/core', () => ({
    Capacitor: {
        isNativePlatform: () => mockIsNativePlatform(),
    },
}));

describe('useGeolocation Hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockIsNativePlatform.mockReturnValue(false); // Default to web
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should initialize with default state', () => {
        const { result } = renderHook(() => useGeolocation());

        expect(result.current.isTracking).toBe(false);
        expect(result.current.points).toEqual([]);
        expect(result.current.currentPosition).toBeNull();
        expect(result.current.error).toBeNull();
    });

    it('should start tracking on Web (no permissions check)', async () => {
        const mockWatchId = 'watch-id-123';
        (Geolocation.watchPosition as any).mockResolvedValue(mockWatchId);

        const { result } = renderHook(() => useGeolocation());

        await act(async () => {
            await result.current.startTracking();
        });

        expect(result.current.isTracking).toBe(true);
        expect(result.current.error).toBeNull();
        expect(Geolocation.checkPermissions).not.toHaveBeenCalled();
        expect(Geolocation.requestPermissions).not.toHaveBeenCalled();
        expect(Geolocation.watchPosition).toHaveBeenCalledWith(
            expect.objectContaining({
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }),
            expect.any(Function)
        );
    });

    it('should start tracking on Native and check permissions', async () => {
        mockIsNativePlatform.mockReturnValue(true);
        (Geolocation.checkPermissions as any).mockResolvedValue({ location: 'granted' });
        const mockWatchId = 'watch-id-native';
        (Geolocation.watchPosition as any).mockResolvedValue(mockWatchId);

        const { result } = renderHook(() => useGeolocation());

        await act(async () => {
            await result.current.startTracking();
        });

        expect(Geolocation.checkPermissions).toHaveBeenCalled();
        expect(result.current.isTracking).toBe(true);
    });

    it('should request permissions on Native if not granted initially', async () => {
        mockIsNativePlatform.mockReturnValue(true);
        (Geolocation.checkPermissions as any).mockResolvedValue({ location: 'prompt' });
        (Geolocation.requestPermissions as any).mockResolvedValue({ location: 'granted' });
        const mockWatchId = 'watch-id-native-req';
        (Geolocation.watchPosition as any).mockResolvedValue(mockWatchId);

        const { result } = renderHook(() => useGeolocation());

        await act(async () => {
            await result.current.startTracking();
        });

        expect(Geolocation.checkPermissions).toHaveBeenCalled();
        expect(Geolocation.requestPermissions).toHaveBeenCalled();
        expect(result.current.isTracking).toBe(true);
    });

    it('should handle permission denied on Native', async () => {
        mockIsNativePlatform.mockReturnValue(true);
        (Geolocation.checkPermissions as any).mockResolvedValue({ location: 'prompt' });
        (Geolocation.requestPermissions as any).mockResolvedValue({ location: 'denied' });

        const { result } = renderHook(() => useGeolocation());

        await act(async () => {
            await result.current.startTracking();
        });

        expect(result.current.isTracking).toBe(false);
        expect(result.current.error).toBe('Permiso de ubicación denegado');
        expect(Geolocation.watchPosition).not.toHaveBeenCalled();
    });

    it('should update currentPosition when watch callback is triggered', async () => {
        const mockWatchId = 'watch-id-updates';
        let watchCallback: any;
        (Geolocation.watchPosition as any).mockImplementation((options: any, callback: any) => {
            watchCallback = callback;
            return Promise.resolve(mockWatchId);
        });

        const { result } = renderHook(() => useGeolocation());

        await act(async () => {
            await result.current.startTracking();
        });

        const mockPosition = {
            coords: {
                latitude: 40.7128,
                longitude: -74.0060,
                speed: 10,
                accuracy: 5,
                altitude: 0,
                heading: 0,
            },
            timestamp: 1000,
        };

        act(() => {
            if (watchCallback) {
                watchCallback(mockPosition, null);
            }
        });

        expect(result.current.currentPosition).toEqual({
            lat: 40.7128,
            lng: -74.0060,
            timestamp: 1000,
            speed: 10,
        });
    });

    it('should accumulate points based on time interval (5000ms)', async () => {
        // NOTE: The implementation uses 5000ms as the threshold, contrary to a code comment stating 10s.
        // We are testing for the implemented behavior (5000ms).

        const mockWatchId = 'watch-id-accumulate';
        let watchCallback: any;
        (Geolocation.watchPosition as any).mockImplementation((options: any, callback: any) => {
            watchCallback = callback;
            return Promise.resolve(mockWatchId);
        });

        const { result } = renderHook(() => useGeolocation());

        await act(async () => {
            await result.current.startTracking();
        });

        const basePosition = {
            coords: {
                latitude: 40.7128,
                longitude: -74.0060,
                speed: 10,
            },
        };

        // First point (timestamp: 1000)
        act(() => {
            watchCallback({ ...basePosition, timestamp: 1000 }, null);
        });

        expect(result.current.points).toHaveLength(1);

        // Second point (timestamp: 3000) - diff is 2000ms < 5000ms
        // Should NOT be added to points array, but currentPosition should update
        act(() => {
            watchCallback({ ...basePosition, timestamp: 3000 }, null);
        });

        expect(result.current.points).toHaveLength(1);
        expect(result.current.currentPosition?.timestamp).toBe(3000);

        // Third point (timestamp: 7000) - diff from last added point (1000) is 6000ms > 5000ms
        // Should be added
        act(() => {
            watchCallback({ ...basePosition, timestamp: 7000 }, null);
        });

        expect(result.current.points).toHaveLength(2);
        expect(result.current.points[1].timestamp).toBe(7000);
    });

    it('should stop tracking and clear watch', async () => {
        const mockWatchId = 'watch-id-stop';
        (Geolocation.watchPosition as any).mockResolvedValue(mockWatchId);

        const { result } = renderHook(() => useGeolocation());

        await act(async () => {
            await result.current.startTracking();
        });

        expect(result.current.isTracking).toBe(true);

        await act(async () => {
            result.current.stopTracking();
        });

        expect(result.current.isTracking).toBe(false);
        expect(Geolocation.clearWatch).toHaveBeenCalledWith({ id: mockWatchId });
    });

    it('should clear watch on unmount', async () => {
        const mockWatchId = 'watch-id-unmount';
        (Geolocation.watchPosition as any).mockResolvedValue(mockWatchId);

        const { result, unmount } = renderHook(() => useGeolocation());

        await act(async () => {
            await result.current.startTracking();
        });

        unmount();

        expect(Geolocation.clearWatch).toHaveBeenCalledWith({ id: mockWatchId });
    });

    it('should handle watch errors', async () => {
        let watchCallback: any;
        (Geolocation.watchPosition as any).mockImplementation((options: any, callback: any) => {
            watchCallback = callback;
            return Promise.resolve('watch-id-error');
        });

        const { result } = renderHook(() => useGeolocation());

        await act(async () => {
            await result.current.startTracking();
        });

        act(() => {
            watchCallback(null, { message: 'GPS signal lost' });
        });

        expect(result.current.error).toBe('GPS signal lost');
    });

    it('should clear points', async () => {
        const { result } = renderHook(() => useGeolocation());

        // Manually set some state if possible or simulate adding points
        // Since we can't easily inject state into the hook without simulating tracking,
        // we'll simulate tracking to add points.

        const mockWatchId = 'watch-id-clear';
        let watchCallback: any;
        (Geolocation.watchPosition as any).mockImplementation((options: any, callback: any) => {
            watchCallback = callback;
            return Promise.resolve(mockWatchId);
        });

        await act(async () => {
            await result.current.startTracking();
        });

        act(() => {
            watchCallback({
                coords: { latitude: 0, longitude: 0, speed: 0 },
                timestamp: 1000
            }, null);
        });

        expect(result.current.points).toHaveLength(1);

        act(() => {
            result.current.clearPoints();
        });

        expect(result.current.points).toEqual([]);
    });
});
