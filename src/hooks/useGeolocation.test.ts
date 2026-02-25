import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGeolocation } from './useGeolocation';
import { Geolocation } from '@capacitor/geolocation';

// Mock @capacitor/geolocation
vi.mock('@capacitor/geolocation', () => ({
  Geolocation: {
    checkPermissions: vi.fn(),
    requestPermissions: vi.fn(),
    watchPosition: vi.fn(),
    clearWatch: vi.fn()
  }
}));

// Mock @capacitor/core
// Since it's dynamically imported, we can mock it like this or rely on vi.mock hoisting
vi.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: vi.fn(),
  }
}));

describe('useGeolocation', () => {
  let watchCallback: (position: any, err?: any) => void;

  beforeEach(() => {
    vi.resetAllMocks();

    // Default mock implementation for watchPosition to capture the callback
    (Geolocation.watchPosition as Mock).mockImplementation((options, callback) => {
      watchCallback = callback;
      return Promise.resolve('watch-id-123');
    });

    // Default mock for checkPermissions (granted)
    (Geolocation.checkPermissions as Mock).mockResolvedValue({ location: 'granted' });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useGeolocation());

    expect(result.current.isTracking).toBe(false);
    expect(result.current.points).toEqual([]);
    expect(result.current.currentPosition).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should start tracking successfully on native platform with permissions granted', async () => {
    const { Capacitor } = await import('@capacitor/core');
    (Capacitor.isNativePlatform as Mock).mockReturnValue(true);

    const { result } = renderHook(() => useGeolocation());

    await act(async () => {
      await result.current.startTracking();
    });

    expect(Capacitor.isNativePlatform).toHaveBeenCalled();
    expect(Geolocation.checkPermissions).toHaveBeenCalled();
    expect(Geolocation.requestPermissions).not.toHaveBeenCalled();
    expect(Geolocation.watchPosition).toHaveBeenCalledWith(
      expect.objectContaining({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }),
      expect.any(Function)
    );
    expect(result.current.isTracking).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should request permissions if not granted initially on native platform', async () => {
    const { Capacitor } = await import('@capacitor/core');
    (Capacitor.isNativePlatform as Mock).mockReturnValue(true);
    (Geolocation.checkPermissions as Mock).mockResolvedValue({ location: 'prompt' });
    (Geolocation.requestPermissions as Mock).mockResolvedValue({ location: 'granted' });

    const { result } = renderHook(() => useGeolocation());

    await act(async () => {
      await result.current.startTracking();
    });

    expect(Geolocation.checkPermissions).toHaveBeenCalled();
    expect(Geolocation.requestPermissions).toHaveBeenCalled();
    expect(Geolocation.watchPosition).toHaveBeenCalled();
    expect(result.current.isTracking).toBe(true);
  });

  it('should handle permission denied error', async () => {
    const { Capacitor } = await import('@capacitor/core');
    (Capacitor.isNativePlatform as Mock).mockReturnValue(true);
    (Geolocation.checkPermissions as Mock).mockResolvedValue({ location: 'prompt' });
    (Geolocation.requestPermissions as Mock).mockResolvedValue({ location: 'denied' });

    const { result } = renderHook(() => useGeolocation());

    await act(async () => {
      await result.current.startTracking();
    });

    expect(Geolocation.requestPermissions).toHaveBeenCalled();
    expect(Geolocation.watchPosition).not.toHaveBeenCalled();
    expect(result.current.isTracking).toBe(false);
    expect(result.current.error).toBe('Permiso de ubicación denegado');
  });

  it('should handle watchPosition error callback', async () => {
    const { Capacitor } = await import('@capacitor/core');
    (Capacitor.isNativePlatform as Mock).mockReturnValue(true);

    const { result } = renderHook(() => useGeolocation());

    await act(async () => {
      await result.current.startTracking();
    });

    // Simulate error callback
    act(() => {
      if (watchCallback) {
        watchCallback(null, { message: 'GPS signal lost' });
      }
    });

    expect(result.current.error).toBe('GPS signal lost');
  });

  it('should update position and accumulate points correctly (throttling)', async () => {
    const { Capacitor } = await import('@capacitor/core');
    (Capacitor.isNativePlatform as Mock).mockReturnValue(true);

    const { result } = renderHook(() => useGeolocation());

    await act(async () => {
      await result.current.startTracking();
    });

    const now = Date.now();
    const position1 = {
      coords: { latitude: 10, longitude: 20, speed: 5 },
      timestamp: now
    };

    // First update
    act(() => {
      watchCallback(position1, undefined);
    });

    expect(result.current.currentPosition).toEqual({
      lat: 10,
      lng: 20,
      timestamp: now,
      speed: 5
    });
    expect(result.current.points).toHaveLength(1);

    // Second update: 3 seconds later (should be ignored by points list, but currentPosition updates)
    const position2 = {
      coords: { latitude: 10.0001, longitude: 20.0001, speed: 6 },
      timestamp: now + 3000
    };

    act(() => {
      watchCallback(position2, undefined);
    });

    expect(result.current.currentPosition?.timestamp).toBe(now + 3000);
    expect(result.current.points).toHaveLength(1); // Still 1

    // Third update: 6 seconds later (should be added)
    const position3 = {
      coords: { latitude: 10.0002, longitude: 20.0002, speed: 7 },
      timestamp: now + 6000
    };

    act(() => {
      watchCallback(position3, undefined);
    });

    expect(result.current.currentPosition?.timestamp).toBe(now + 6000);
    expect(result.current.points).toHaveLength(2);
    expect(result.current.points[1].timestamp).toBe(now + 6000);
  });

  it('should stop tracking and clear watch', async () => {
    const { Capacitor } = await import('@capacitor/core');
    (Capacitor.isNativePlatform as Mock).mockReturnValue(true);

    const { result } = renderHook(() => useGeolocation());

    await act(async () => {
      await result.current.startTracking();
    });

    expect(result.current.isTracking).toBe(true);

    act(() => {
      result.current.stopTracking();
    });

    expect(Geolocation.clearWatch).toHaveBeenCalledWith({ id: 'watch-id-123' });
    expect(result.current.isTracking).toBe(false);
  });

  it('should clear watch on unmount', async () => {
    const { Capacitor } = await import('@capacitor/core');
    (Capacitor.isNativePlatform as Mock).mockReturnValue(true);

    const { result, unmount } = renderHook(() => useGeolocation());

    await act(async () => {
      await result.current.startTracking();
    });

    unmount();

    expect(Geolocation.clearWatch).toHaveBeenCalledWith({ id: 'watch-id-123' });
  });

  it('should clear points', async () => {
    const { result } = renderHook(() => useGeolocation());

    // Simulate adding points manually (or just state manipulation if exposed, but it's internal)
    // We'll use startTracking to add a point
    const { Capacitor } = await import('@capacitor/core');
    (Capacitor.isNativePlatform as Mock).mockReturnValue(true);

    await act(async () => {
      await result.current.startTracking();
    });

    const position = {
      coords: { latitude: 10, longitude: 20, speed: 5 },
      timestamp: Date.now()
    };

    act(() => {
      watchCallback(position, undefined);
    });

    expect(result.current.points).toHaveLength(1);

    act(() => {
      result.current.clearPoints();
    });

    expect(result.current.points).toHaveLength(0);
  });
});
