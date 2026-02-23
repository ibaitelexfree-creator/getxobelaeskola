import { render, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ActivityTracker from './ActivityTracker';
import { createClient } from '@/lib/supabase/client';
import { useNotificationStore } from '@/lib/store/useNotificationStore';

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
    createClient: vi.fn(),
}));

// Mock Notification Store
vi.mock('@/lib/store/useNotificationStore', () => ({
    useNotificationStore: vi.fn(),
}));

describe('ActivityTracker', () => {
    const mockRpc = vi.fn();
    const mockGetUser = vi.fn();
    const mockFrom = vi.fn();
    const mockAddNotification = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        // Setup default mocks
        (createClient as any).mockReturnValue({
            auth: {
                getUser: mockGetUser,
            },
            rpc: mockRpc,
            from: mockFrom,
        });

        // Mock useNotificationStore implementation
        (useNotificationStore as any).mockImplementation((selector: any) => selector({
            addNotification: mockAddNotification,
        }));

        mockGetUser.mockResolvedValue({ data: { user: { id: 'test-user-id' } }, error: null });
        mockRpc.mockResolvedValue({ error: null });
        mockFrom.mockReturnValue({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({ data: { current_streak: 5 }, error: null }),
                }),
            }),
        });

        // Clear localStorage
        if (typeof window !== 'undefined') {
            window.localStorage.clear();
        }
    });

    it('should call registrar_actividad_alumno on mount', async () => {
        render(<ActivityTracker />);

        await waitFor(() => {
            expect(mockRpc).toHaveBeenCalledWith('registrar_actividad_alumno', { p_alumno_id: 'test-user-id' });
        });
    });

    it('should NOT call RPC multiple times if mounted multiple times within an hour', async () => {
        const { unmount } = render(<ActivityTracker />);
        await waitFor(() => expect(mockRpc).toHaveBeenCalledTimes(1));

        unmount();

        render(<ActivityTracker />);
        // Wait a bit to make sure no more calls are made
        await new Promise(resolve => setTimeout(resolve, 100));
        expect(mockRpc).toHaveBeenCalledTimes(1);
    });

    it('should call RPC again if more than an hour has passed', async () => {
        const { unmount } = render(<ActivityTracker />);
        await waitFor(() => expect(mockRpc).toHaveBeenCalledTimes(1));
        unmount();

        // Simulate 1.1 hours passing
        const now = Date.now();
        vi.spyOn(Date, 'now').mockReturnValue(now + 3600000 + 60000);

        render(<ActivityTracker />);
        await waitFor(() => expect(mockRpc).toHaveBeenCalledTimes(2));

        vi.restoreAllMocks();
    });
});
