import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePushNotifications } from './usePushNotifications';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { createClient } from '@/lib/supabase/client';

// Mocks
vi.mock('@capacitor/push-notifications', () => ({
    PushNotifications: {
        checkPermissions: vi.fn(),
        requestPermissions: vi.fn(),
        register: vi.fn(),
        addListener: vi.fn().mockResolvedValue({ remove: vi.fn() }),
    },
}));

vi.mock('@capacitor/core', () => ({
    Capacitor: {
        isNativePlatform: vi.fn().mockReturnValue(false),
        getPlatform: vi.fn().mockReturnValue('web'),
    },
}));

vi.mock('@/lib/supabase/client', () => ({
    createClient: vi.fn(),
}));

describe('usePushNotifications', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should initialize with default state', () => {
        const { result } = renderHook(() => usePushNotifications());
        expect(result.current.permission).toBe('prompt');
        expect(result.current.isNative).toBe(false);
    });

    it('should check permissions on native platform', async () => {
        (Capacitor.isNativePlatform as any).mockReturnValue(true);
        (PushNotifications.checkPermissions as any).mockResolvedValue({ receive: 'granted' });

        const { result } = renderHook(() => usePushNotifications());

        await waitFor(() => expect(PushNotifications.checkPermissions).toHaveBeenCalled());
        await waitFor(() => expect(result.current.permission).toBe('granted'));
    });

    it('should request permissions and register if granted', async () => {
        (Capacitor.isNativePlatform as any).mockReturnValue(true);
        (PushNotifications.checkPermissions as any).mockResolvedValue({ receive: 'prompt' });
        (PushNotifications.requestPermissions as any).mockResolvedValue({ receive: 'granted' });
        (PushNotifications.register as any).mockResolvedValue(undefined);

        const { result } = renderHook(() => usePushNotifications());

        await act(async () => {
            await result.current.requestPermissions();
        });

        expect(PushNotifications.requestPermissions).toHaveBeenCalled();
        expect(PushNotifications.register).toHaveBeenCalled();
        expect(result.current.permission).toBe('granted');
    });

    it('should handle registration success and save token to Supabase', async () => {
        (Capacitor.isNativePlatform as any).mockReturnValue(true);
        let registrationCallback: any;
        (PushNotifications.addListener as any).mockImplementation((event, handler) => {
            if (event === 'registration') registrationCallback = handler;
            return Promise.resolve({ remove: vi.fn() });
        });

        const mockUpsert = vi.fn().mockResolvedValue({ error: null });
        const mockSupabase = {
            auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } } }) },
            from: vi.fn().mockReturnValue({ upsert: mockUpsert }),
        };
        (createClient as any).mockReturnValue(mockSupabase);

        renderHook(() => usePushNotifications());

        await waitFor(() => expect(registrationCallback).toBeDefined());

        await act(async () => {
            await registrationCallback({ value: 'token-abc' });
        });

        expect(mockUpsert).toHaveBeenCalledWith(
            expect.objectContaining({ fcm_token: 'token-abc', user_id: 'user-123' }),
            expect.any(Object)
        );
    });
});
