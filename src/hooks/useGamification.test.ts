import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useGamification } from './useGamification';
import { useNotificationStore } from '@/lib/store/useNotificationStore';

// Mock store
vi.mock('@/lib/store/useNotificationStore', () => ({
    useNotificationStore: vi.fn()
}));

// Mock fetch
global.fetch = vi.fn();

describe('useGamification', () => {
    const mockAddNotification = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useNotificationStore as any).mockImplementation((selector: any) => selector({ addNotification: mockAddNotification }));
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('should fetch badges correctly', async () => {
        const mockBadges = [{ id: 'b1', slug: 'badge-1', nombre_es: 'Badge 1' }];
        (global.fetch as any).mockResolvedValue({
            ok: true,
            json: async () => mockBadges
        });

        const { result } = renderHook(() => useGamification());

        await act(async () => {
            await result.current.fetchBadges();
        });

        expect(result.current.badges).toEqual(mockBadges);
        expect(result.current.loading).toBe(false);
    });

    it('should handle fetchBadges error gracefully', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: false,
            status: 500
        });

        const { result } = renderHook(() => useGamification());

        await act(async () => {
            await result.current.fetchBadges();
        });

        expect(result.current.loading).toBe(false);
        expect(console.error).toHaveBeenCalled();
    });

    it('should handle fetchBadges network error', async () => {
        (global.fetch as any).mockRejectedValue(new Error('Network error'));

        const { result } = renderHook(() => useGamification());

        await act(async () => {
            await result.current.fetchBadges();
        });

        expect(result.current.loading).toBe(false);
        expect(console.error).toHaveBeenCalled();
    });

    it('should unlock badge and notify', async () => {
        const mockAchievement = { id: 'ach1', nombre: 'Winner!', puntos: 100 };
        (global.fetch as any).mockResolvedValue({
            ok: true,
            json: async () => ({ new: true, achievement: mockAchievement })
        });

        const { result } = renderHook(() => useGamification());

        await act(async () => {
            await result.current.unlockBadge('winner-slug');
        });

        expect(mockAddNotification).toHaveBeenCalledWith(expect.objectContaining({
            type: 'badge',
            title: 'Winner!',
            icon: '🏆'
        }));
    });

    it('should handle unlockBadge error gracefully', async () => {
        (global.fetch as any).mockRejectedValue(new Error('Network error'));

        const { result } = renderHook(() => useGamification());

        await act(async () => {
            await result.current.unlockBadge('winner-slug');
        });

        expect(console.error).toHaveBeenCalled();
    });

    it('should handle unlockBadge malformed response', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: true,
            json: async () => { throw new Error('JSON error'); }
        });

        const { result } = renderHook(() => useGamification());

        await act(async () => {
            await result.current.unlockBadge('winner-slug');
        });

        expect(console.error).toHaveBeenCalled();
    });
});
