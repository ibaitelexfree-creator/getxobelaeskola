import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useNetworkMonitor } from './useNetworkMonitor';
import { Network } from '@capacitor/network';

// Mock Capacitor Network
vi.mock('@capacitor/network', () => ({
    Network: {
        getStatus: vi.fn(),
        addListener: vi.fn()
    }
}));

describe('useNetworkMonitor', () => {
    const mockOnWifiDisconnect = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        vi.restoreAllMocks();
    });

    it('should setup network listener on mount', async () => {
        (Network.getStatus as any).mockResolvedValue({ connected: true, connectionType: 'wifi' });
        (Network.addListener as any).mockResolvedValue({ remove: vi.fn() });

        renderHook(() => useNetworkMonitor(mockOnWifiDisconnect));

        await waitFor(() => expect(Network.getStatus).toHaveBeenCalled());
        expect(Network.addListener).toHaveBeenCalledWith('networkStatusChange', expect.any(Function));
    });

    it('should trigger callback when transitioning from wifi to cellular', async () => {
        let statusChangeHandler: (status: any) => void = () => { };
        (Network.getStatus as any).mockResolvedValue({ connected: true, connectionType: 'wifi' });
        (Network.addListener as any).mockImplementation((event, handler) => {
            statusChangeHandler = handler;
            return { remove: vi.fn() };
        });

        renderHook(() => useNetworkMonitor(mockOnWifiDisconnect));

        await waitFor(() => expect(Network.getStatus).toHaveBeenCalled());

        // Trigger change
        act(() => {
            statusChangeHandler({ connected: true, connectionType: 'cellular' });
        });

        expect(mockOnWifiDisconnect).toHaveBeenCalled();
    });

    it('should NOT trigger callback when transitioning from cellular to wifi', async () => {
        let statusChangeHandler: (status: any) => void = () => { };
        (Network.getStatus as any).mockResolvedValue({ connected: true, connectionType: 'cellular' });
        (Network.addListener as any).mockImplementation((event, handler) => {
            statusChangeHandler = handler;
            return { remove: vi.fn() };
        });

        renderHook(() => useNetworkMonitor(mockOnWifiDisconnect));

        await waitFor(() => expect(Network.getStatus).toHaveBeenCalled());

        act(() => {
            statusChangeHandler({ connected: true, connectionType: 'wifi' });
        });

        expect(mockOnWifiDisconnect).not.toHaveBeenCalled();
    });

    it('should log error when Network.getStatus fails', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
        const testError = new Error('getStatus failed');
        (Network.getStatus as any).mockRejectedValue(testError);

        renderHook(() => useNetworkMonitor(mockOnWifiDisconnect));

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith('Error setting up network listener:', testError);
        });
    });

    it('should log error when Network.addListener fails', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
        const testError = new Error('addListener failed');
        (Network.getStatus as any).mockResolvedValue({ connected: true, connectionType: 'wifi' });
        (Network.addListener as any).mockRejectedValue(testError);

        renderHook(() => useNetworkMonitor(mockOnWifiDisconnect));

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith('Error setting up network listener:', testError);
        });
    });
});
