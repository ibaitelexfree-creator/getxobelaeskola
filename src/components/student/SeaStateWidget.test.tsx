import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import SeaStateWidget from './SeaStateWidget';

// Mock framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, className, initial, animate }: any) => (
            <div className={className} data-initial={JSON.stringify(initial)} data-animate={JSON.stringify(animate)}>
                {children}
            </div>
        ),
    },
}));

describe('SeaStateWidget', () => {
    const mockData = {
        wave_height: 1.5,
        wave_period: 8,
        water_temp: 15.5,
        wind_speed: 12,
        wind_direction: 315,
        timestamp: new Date().toISOString()
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal('fetch', vi.fn());
    });

    it('should show loading state initially', async () => {
        (global.fetch as any).mockReturnValue(new Promise(() => { }));

        render(<SeaStateWidget />);
        expect(screen.getByText('Estado del Mar...')).toBeDefined();
    });

    it('should render sea state data on success', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue(mockData)
        });

        render(<SeaStateWidget />);

        await waitFor(() => {
            expect(screen.getByText('1.5')).toBeDefined();
            expect(screen.getByText('8')).toBeDefined();
            expect(screen.getByText('15.5')).toBeDefined();
            expect(screen.getByText('12')).toBeDefined();
        });

        expect(screen.queryByText('Estado del Mar...')).toBeNull();
    });

    it('should render nothing (null) on API error (non-ok response)', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: false,
            status: 500
        });

        const { container } = render(<SeaStateWidget />);

        await waitFor(() => {
            expect(screen.queryByText('Estado del Mar...')).toBeNull();
        });

        expect(container.firstChild).toBeNull();
    });

    it('should render nothing (null) on network error (fetch throws)', async () => {
        (global.fetch as any).mockRejectedValue(new Error('Network error'));

        const { container } = render(<SeaStateWidget />);

        await waitFor(() => {
            expect(screen.queryByText('Estado del Mar...')).toBeNull();
        });

        expect(container.firstChild).toBeNull();
    });

    it('should refresh data when clicking refresh button', async () => {
        const firstData = { ...mockData, wave_height: 1.5 };
        const secondData = { ...mockData, wave_height: 2.1 }; // Changed to 2.1 to be distinct

        (global.fetch as any)
            .mockResolvedValueOnce({
                ok: true,
                json: vi.fn().mockResolvedValue(firstData)
            })
            .mockResolvedValueOnce({
                ok: true,
                json: vi.fn().mockResolvedValue(secondData)
            });

        render(<SeaStateWidget />);

        await waitFor(() => expect(screen.getByText('1.5')).toBeDefined());

        const refreshButton = screen.getByRole('button');

        // Use a more robust way to click and wait
        await act(async () => {
            fireEvent.click(refreshButton);
        });

        await waitFor(() => {
            // Check for the new value
            const elements = screen.queryAllByText('2.1');
            expect(elements.length).toBeGreaterThan(0);
        }, { timeout: 3000 });

        expect(global.fetch).toHaveBeenCalledTimes(2);
    });
});
