import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import SeaStateWidget from './SeaStateWidget';

// Mock fetch
global.fetch = vi.fn();

const mockData = {
    wave_height: 1.5,
    wave_period: 8,
    water_temp: 18.5,
    wind_speed: 12,
    wind_direction: 45,
    timestamp: '2023-10-27T10:00:00Z'
};

describe('SeaStateWidget', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('shows loading state initially', async () => {
        (global.fetch as any).mockReturnValue(new Promise(() => {})); // Never resolves
        render(<SeaStateWidget />);
        expect(screen.getByText(/Estado del Mar.../i)).toBeInTheDocument();
    });

    it('renders sea state data on success', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: true,
            json: async () => mockData,
        });

        render(<SeaStateWidget />);

        await waitFor(() => {
            expect(screen.getByText('1.5')).toBeInTheDocument();
            expect(screen.getByText('8')).toBeInTheDocument();
            expect(screen.getByText('18.5')).toBeInTheDocument();
            expect(screen.getByText('12')).toBeInTheDocument();
        });

        expect(screen.getByText(/Altura Ola/i)).toBeInTheDocument();
        expect(screen.getByText(/Período/i)).toBeInTheDocument();
    });

    it('returns null when fetch fails (response not ok)', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: false,
        });

        const { container } = render(<SeaStateWidget />);

        // Wait for loading to finish
        await waitFor(() => {
            expect(screen.queryByText(/Estado del Mar.../i)).not.toBeInTheDocument();
        });

        expect(container.firstChild).toBeNull();
    });

    it('returns null when fetch throws an error', async () => {
        // Suppress console.error for this test as we expect an error
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        (global.fetch as any).mockRejectedValue(new Error('Network error'));

        const { container } = render(<SeaStateWidget />);

        await waitFor(() => {
            expect(screen.queryByText(/Estado del Mar.../i)).not.toBeInTheDocument();
        });

        expect(container.firstChild).toBeNull();
        consoleSpy.mockRestore();
    });

    it('refreshes data when refresh button is clicked', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: true,
            json: async () => mockData,
        });

        render(<SeaStateWidget />);

        await waitFor(() => {
            expect(screen.getByText('1.5')).toBeInTheDocument();
        });

        const refreshButton = screen.getByRole('button');

        // Mock a different value for refresh
        (global.fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ ...mockData, wave_height: 2.0 }),
        });

        fireEvent.click(refreshButton);

        await waitFor(() => {
            expect(screen.getByText('2')).toBeInTheDocument();
        });

        expect(global.fetch).toHaveBeenCalledTimes(2);
    });
});
