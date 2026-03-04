import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import MicroLeccionesWidget from './MicroLeccionesWidget';
import React from 'react';

// Mock next/image
vi.mock('next/image', () => ({
    __esModule: true,
    default: (props: any) => {
        // eslint-disable-next-line @next/next/no-img-element
        return <img {...props} />;
    },
}));

// Mock next/dynamic
vi.mock('next/dynamic', () => ({
    __esModule: true,
    default: (importFunc: any) => {
        const MockPlayer = ({ onClose }: any) => (
            <div data-testid="mock-player">
                Mock Player
                <button onClick={onClose} type="button">Close</button>
            </div>
        );
        return MockPlayer;
    },
}));

// Mock @/lib/platform
vi.mock('@/lib/platform', () => ({
    getApiUrl: vi.fn((path) => path),
}));

describe('MicroLeccionesWidget', () => {
    const mockTranslations = {
        title: 'Micro-Lecciones'
    };

    const mockLessons = [
        {
            id: '1',
            titulo_es: 'Lección 1',
            titulo_eu: 'Ikasgaia 1',
            descripcion_es: 'Desc 1',
            descripcion_eu: 'Desk 1',
            video_url: 'v1',
            thumbnail_url: 't1',
            duracion_segundos: 60,
            categoria: 'cat1'
        },
        {
            id: '2',
            titulo_es: 'Lección 2',
            titulo_eu: 'Ikasgaia 2',
            descripcion_es: 'Desc 2',
            descripcion_eu: 'Desk 2',
            video_url: 'v2',
            thumbnail_url: 't2',
            duracion_segundos: 125,
            categoria: 'cat2'
        }
    ];

    beforeEach(() => {
        vi.resetAllMocks();
        global.fetch = vi.fn();
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterAll(() => {
        vi.restoreAllMocks();
    });

    it('renders pulse loader initially when no preloaded lessons', () => {
        (global.fetch as any).mockReturnValue(new Promise(() => {}));
        const { container } = render(<MicroLeccionesWidget locale="es" translations={mockTranslations} />);
        expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
    });

    it('fetches and renders lessons successfully (Happy Path)', async () => {
        (global.fetch as any).mockResolvedValue({
            json: async () => mockLessons,
        });

        render(<MicroLeccionesWidget locale="es" translations={mockTranslations} />);

        await waitFor(() => {
            expect(screen.getByText('Lección 1')).toBeInTheDocument();
            expect(screen.getByText('Lección 2')).toBeInTheDocument();
        });

        expect(screen.getByText('1:00')).toBeInTheDocument();
        expect(screen.getByText('2:05')).toBeInTheDocument();
    });

    it('uses preloaded lessons and does not fetch', () => {
        render(<MicroLeccionesWidget locale="es" translations={mockTranslations} preloadedLessons={mockLessons} />);

        expect(screen.getByText('Lección 1')).toBeInTheDocument();
        expect(screen.getByText('Lección 2')).toBeInTheDocument();
        expect(global.fetch).not.toHaveBeenCalled();
    });

    it('handles fetch error gracefully (Error Path)', async () => {
        (global.fetch as any).mockRejectedValue(new Error('Fetch failed'));

        const { container } = render(<MicroLeccionesWidget locale="es" translations={mockTranslations} />);

        await waitFor(() => {
            expect(container.querySelector('.animate-pulse')).not.toBeInTheDocument();
        });

        expect(console.error).toHaveBeenCalledWith('Error fetching micro-lessons:', expect.any(Error));
        expect(screen.queryByText('Micro-Lecciones')).not.toBeInTheDocument();
        expect(container.firstChild).toBeNull();
    });

    it('handles non-array response gracefully', async () => {
        (global.fetch as any).mockResolvedValue({
            json: async () => ({ error: 'not an array' }),
        });

        const { container } = render(<MicroLeccionesWidget locale="es" translations={mockTranslations} />);

        await waitFor(() => {
            expect(container.querySelector('.animate-pulse')).not.toBeInTheDocument();
        });

        expect(container.firstChild).toBeNull();
    });

    it('opens player when a lesson is clicked', async () => {
        render(<MicroLeccionesWidget locale="es" translations={mockTranslations} preloadedLessons={mockLessons} />);

        fireEvent.click(screen.getByText('Lección 1'));

        expect(screen.getByTestId('mock-player')).toBeInTheDocument();

        fireEvent.click(screen.getByText('Close'));
        expect(screen.queryByTestId('mock-player')).not.toBeInTheDocument();
    });

    it('renders Basque titles when locale is eu', () => {
        render(<MicroLeccionesWidget locale="eu" translations={mockTranslations} preloadedLessons={mockLessons} />);
        expect(screen.getByText('Ikasgaia 1')).toBeInTheDocument();
    });
});
