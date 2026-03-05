import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGamification } from '../useGamification';
import { useNotificationStore } from '@/lib/store/useNotificationStore';

// Mock store
vi.mock('@/lib/store/useNotificationStore', () => ({
    useNotificationStore: vi.fn()
}));

// Mock apiUrl
vi.mock('@/lib/api', () => ({
    apiUrl: (url: string) => `http://localhost${url}`
}));

// Mock fetch
global.fetch = vi.fn();

describe('useGamification hook', () => {
    const mockAddNotification = vi.fn();
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useNotificationStore).mockImplementation((selector: any) =>
            selector({ addNotification: mockAddNotification })
        );
    });

    it('should fetch badges on call', async () => {
        const mockBadges = [{ id: '1', slug: 'badge-1', nombre_es: 'Badge 1' }];
        vi.mocked(global.fetch).mockResolvedValue({
            ok: true,
            json: async () => mockBadges
        } as unknown as Response);

        const { result } = renderHook(() => useGamification());

        await act(async () => {
            await result.current.fetchBadges();
        });

        expect(result.current.badges).toEqual(mockBadges);
        expect(result.current.loading).toBe(false);
    });

    it('should handle fetch error (not ok response)', async () => {
        vi.mocked(global.fetch).mockResolvedValue({
            ok: false,
            status: 500,
            statusText: 'Internal Server Error'
        } as unknown as Response);

        const { result } = renderHook(() => useGamification());

        await act(async () => {
            await result.current.fetchBadges();
        });

        expect(result.current.badges).toEqual([]);
        expect(result.current.loading).toBe(false);
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Error loading badges:',
            expect.any(Error)
        );
    });

    it('should handle fetch rejection (network error)', async () => {
        vi.mocked(global.fetch).mockRejectedValue(new Error('Network failure'));

        const { result } = renderHook(() => useGamification());

        await act(async () => {
            await result.current.fetchBadges();
        });

        expect(result.current.badges).toEqual([]);
        expect(result.current.loading).toBe(false);
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Error loading badges:',
            expect.any(Error)
        );
    });

    it('should handle res.json() failure', async () => {
        vi.mocked(global.fetch).mockResolvedValue({
            ok: true,
            json: async () => { throw new Error('Invalid JSON'); }
        } as unknown as Response);

        const { result } = renderHook(() => useGamification());

        await act(async () => {
            await result.current.fetchBadges();
        });

        expect(result.current.badges).toEqual([]);
        expect(result.current.loading).toBe(false);
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Error loading badges:',
            expect.any(Error)
        );
    });

    it('should unlock badge and notify', async () => {
        const mockAchievement = { id: 'ach1', nombre: 'Winner!', puntos: 100 };
        vi.mocked(global.fetch).mockResolvedValue({
            ok: true,
            json: async () => ({ new: true, achievement: mockAchievement })
        } as unknown as Response);

        const { result } = renderHook(() => useGamification());

        await act(async () => {
            await result.current.unlockBadge('winner-slug');
        });

        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/api/achievements'),
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({ slug: 'winner-slug' })
            })
        );

        expect(mockAddNotification).toHaveBeenCalledWith(expect.objectContaining({
            type: 'badge',
            title: 'Winner!',
            icon: '🏆'
        }));
    });

    it('should handle unlockBadge fetch failure', async () => {
        vi.mocked(global.fetch).mockRejectedValue(new Error('Failed to unlock'));

        const { result } = renderHook(() => useGamification());

        await act(async () => {
            await result.current.unlockBadge('gold');
        });

        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Error unlocking badge:',
            expect.any(Error)
        );
    });

    it('should handle unlock badge error (not ok response)', async () => {
        vi.mocked(global.fetch).mockResolvedValue({
            ok: false,
            json: async () => ({ error: 'Unauthorized' })
        } as unknown as Response);

        const { result } = renderHook(() => useGamification());

        await act(async () => {
            await result.current.unlockBadge('gold');
        });

        expect(consoleErrorSpy).toHaveBeenCalledWith('Error unlocking badge:', expect.any(Error));
    });

    it('should handle unlock badge network error (rejection)', async () => {
        vi.mocked(global.fetch).mockRejectedValue(new Error('Network error'));

        const { result } = renderHook(() => useGamification());

        await act(async () => {
            await result.current.unlockBadge('gold');
        });

        expect(consoleErrorSpy).toHaveBeenCalledWith('Error unlocking badge:', expect.any(Error));
    });
});
