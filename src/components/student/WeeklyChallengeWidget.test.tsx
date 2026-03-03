import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import WeeklyChallengeWidget from './WeeklyChallengeWidget';
import confetti from 'canvas-confetti';

// Mock canvas-confetti
vi.mock('canvas-confetti', () => ({
    default: vi.fn(),
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('WeeklyChallengeWidget', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        global.fetch = vi.fn();
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('renders null when challenge fetch fails (error path)', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: false,
            status: 500,
        });

        const { container } = render(<WeeklyChallengeWidget locale="es" />);

        await waitFor(() => {
            // Check that the fetch was attempted
            expect(global.fetch).toHaveBeenCalledWith('/api/student/weekly-challenge');
        });

        // Verify error was logged - this is the key check that should fail if we comment out the throw
        await waitFor(() => {
            expect(console.error).toHaveBeenCalledWith('Error fetching weekly challenge:', expect.any(Error));
        });

        // After loading is false and no challenge, it should render null
        await waitFor(() => {
            expect(container.firstChild).toBeNull();
        });
    });

    it('renders the challenge details on success', async () => {
        const mockData = {
            challenge: {
                id: 'challenge-123',
                start_date: '2023-10-01',
                end_date: '2023-10-07',
                template: {
                    type: 'quiz_count',
                    target_count: 5,
                    description_es: 'Completa 5 cuestionarios',
                    description_eu: '5 galdetegi osatu',
                    xp_reward: 100,
                },
            },
            progress: {
                id: 'progress-123',
                current_value: 2,
                completed: false,
                reward_claimed: false,
            },
        };

        (global.fetch as any).mockResolvedValue({
            ok: true,
            json: async () => mockData,
        });

        render(<WeeklyChallengeWidget locale="es" />);

        await waitFor(() => {
            expect(screen.getByText('Completa 5 cuestionarios')).toBeDefined();
            expect(screen.getByText('2 / 5')).toBeDefined();
            expect(screen.getByText('+100 XP')).toBeDefined();
        });
    });

    it('triggers celebration and claims reward when completed but not claimed', async () => {
        const mockData = {
            challenge: {
                id: 'challenge-123',
                start_date: '2023-10-01',
                end_date: '2023-10-07',
                template: {
                    type: 'quiz_count',
                    target_count: 5,
                    description_es: 'Completa 5 cuestionarios',
                    description_eu: '5 galdetegi osatu',
                    xp_reward: 100,
                },
            },
            progress: {
                id: 'progress-123',
                current_value: 5,
                completed: true,
                reward_claimed: false,
            },
        };

        (global.fetch as any).mockImplementation((url: string) => {
            if (url === '/api/student/weekly-challenge') {
                return Promise.resolve({
                    ok: true,
                    json: async () => mockData,
                });
            }
            if (url === '/api/student/weekly-challenge/claim') {
                return Promise.resolve({
                    ok: true,
                    json: async () => ({ success: true }),
                });
            }
            return Promise.reject(new Error('Not found'));
        });

        render(<WeeklyChallengeWidget locale="es" />);

        await waitFor(() => {
            expect(screen.getByText('Completa 5 cuestionarios')).toBeDefined();
        });

        // The celebration starts an interval that calls confetti every 250ms.
        // We wait for the first call.
        await waitFor(() => {
            expect(confetti).toHaveBeenCalled();
        }, { timeout: 5000 });

        expect(global.fetch).toHaveBeenCalledWith('/api/student/weekly-challenge/claim', expect.objectContaining({ method: 'POST' }));
    });

    it('renders the challenge in Basque correctly', async () => {
        const mockData = {
            challenge: {
                id: 'challenge-123',
                start_date: '2023-10-01',
                end_date: '2023-10-07',
                template: {
                    type: 'quiz_count',
                    target_count: 5,
                    description_es: 'Completa 5 cuestionarios',
                    description_eu: '5 galdetegi osatu',
                    xp_reward: 100,
                },
            },
            progress: {
                id: 'progress-123',
                current_value: 3,
                completed: false,
                reward_claimed: false,
            },
        };

        (global.fetch as any).mockResolvedValue({
            ok: true,
            json: async () => mockData,
        });

        render(<WeeklyChallengeWidget locale="eu" />);

        await waitFor(() => {
            expect(screen.getByText('5 galdetegi osatu')).toBeDefined();
            expect(screen.getByText('3 / 5')).toBeDefined();
            expect(screen.getByText('Saria:')).toBeDefined();
        });
    });
});
