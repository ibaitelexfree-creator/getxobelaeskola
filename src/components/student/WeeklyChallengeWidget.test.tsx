import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import WeeklyChallengeWidget from './WeeklyChallengeWidget';
import confetti from 'canvas-confetti';

// Mocks
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, className, initial, animate }: any) => (
            <div className={className} data-initial={JSON.stringify(initial)} data-animate={JSON.stringify(animate)}>
                {children}
            </div>
        ),
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
}));

vi.mock('canvas-confetti', () => ({
    default: vi.fn(),
}));

// Mock fetch
global.fetch = vi.fn();

describe('WeeklyChallengeWidget', () => {
    const mockChallenge = {
        id: 'challenge-1',
        start_date: '2023-10-01T00:00:00Z',
        end_date: '2023-10-07T23:59:59Z',
        template: {
            type: 'quiz_score',
            target_count: 10,
            description_es: 'Consigue 10 puntos en cuestionarios',
            description_eu: 'Lortu 10 puntu galdetegietan',
            xp_reward: 100,
        },
    };

    const mockProgress = {
        id: 'progress-1',
        current_value: 5,
        completed: false,
        reward_claimed: false,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('should show loading state initially', () => {
        (global.fetch as any).mockReturnValue(new Promise(() => {})); // Never resolves
        const { container } = render(<WeeklyChallengeWidget locale="es" />);
        expect(container.querySelector('.animate-pulse')).not.toBeNull();
    });

    it('should render challenge data on success', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: true,
            json: async () => ({ challenge: mockChallenge, progress: mockProgress }),
        });

        render(<WeeklyChallengeWidget locale="es" />);

        await waitFor(() => {
            expect(screen.getByText('Consigue 10 puntos en cuestionarios')).toBeDefined();
            expect(screen.getByText('5 / 10')).toBeDefined();
            expect(screen.getByText('+100 XP')).toBeDefined();
        });
    });

    it('should handle fetch error gracefully', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: false,
            status: 500,
        });

        const { container } = render(<WeeklyChallengeWidget locale="es" />);

        await waitFor(() => {
            expect(container.firstChild).toBeNull();
        });

        expect(console.error).toHaveBeenCalled();
    });

    it('should trigger celebration when completed and not claimed', async () => {
        const completedProgress = { ...mockProgress, completed: true, reward_claimed: false };
        (global.fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ challenge: mockChallenge, progress: completedProgress }),
        });

        // Mock the claim call
        (global.fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ success: true }),
        });

        render(<WeeklyChallengeWidget locale="es" />);

        await waitFor(() => {
            expect(confetti).toHaveBeenCalled();
            expect(global.fetch).toHaveBeenCalledWith('/api/student/weekly-challenge/claim', expect.anything());
        });
    });

    it('should use correct locale', async () => {
         (global.fetch as any).mockResolvedValue({
            ok: true,
            json: async () => ({ challenge: mockChallenge, progress: mockProgress }),
        });

        render(<WeeklyChallengeWidget locale="eu" />);

        await waitFor(() => {
            expect(screen.getByText('Lortu 10 puntu galdetegietan')).toBeDefined();
            expect(screen.getByText('Saria:')).toBeDefined();
        });
    });
});
