import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import UnitReaderMain from './UnitReaderMain';

// Mock useRouter
vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: vi.fn() })
}));

// Mock useTranslations
vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => key
}));

// Mock useAcademyFeedback
vi.mock('@/hooks/useAcademyFeedback', () => ({
    useAcademyFeedback: () => ({ showMessage: vi.fn(), checkForNewAchievements: vi.fn() })
}));

// Mock useNotificationStore
vi.mock('@/lib/store/useNotificationStore', () => ({
    useNotificationStore: () => ({ addNotification: vi.fn() })
}));

// Mock useUnitProgress
vi.mock('@/hooks/useUnitProgress', () => ({
    useUnitProgress: () => ({
        tiempoLectura: 0,
        seccionesVistas: [],
        registrarLectura: vi.fn(),
        puedeCompletar: true,
        mensajeRequisito: '',
        setSeccionesVistas: vi.fn()
    })
}));

// Mock useAcademyMode
vi.mock('@/lib/store/useAcademyMode', () => ({
    useAcademyMode: () => ({ mode: 'structured' })
}));

// Mock useMissionStore
vi.mock('@/components/academy/interactive-engine', () => ({
    useMissionStore: () => ({ isComplete: false }),
    InteractiveMission: () => <div>Mission</div>
}));

// Mock apiUrl
vi.mock('@/lib/api', () => ({
    apiUrl: (path: string) => path
}));

// Mock components
vi.mock('@/components/ui/Breadcrumbs', () => ({
    default: () => <div>Breadcrumbs</div>
}));
vi.mock('@/components/academy/UnlockStatusBadge', () => ({
    UnlockStatusBadge: () => <div>Status</div>
}));
vi.mock('@/components/academy/UnitSkeleton', () => ({
    default: () => <div>Loading...</div>
}));

describe('UnitReaderMain', () => {
    beforeEach(() => {
        global.fetch = vi.fn();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should fetch and render sanitized content', async () => {
        const mockUnidad = {
            id: '123',
            nombre_es: 'Test Unit',
            nombre_eu: 'Test Unit EU',
            orden: 1,
            objetivos_es: [],
            contenido_teorico_es: '<p>Safe Content</p><script>alert("xss")</script>',
            contenido_teorico_eu: '',
            contenido_practico_es: '',
            contenido_practico_eu: '',
            errores_comunes_es: [],
            recursos_json: {},
            duracion_estimada_min: 10,
            modulo: {
                id: 'mod1',
                nombre_es: 'Module 1',
                orden: 1,
                curso: {
                    id: 'course1',
                    slug: 'course-1',
                    nombre_es: 'Course 1',
                    nivel_formacion: { slug: 'level1', nombre_es: 'Level 1', orden: 1 }
                }
            }
        };

        const mockResponse = {
            unidad: mockUnidad,
            navegacion: { anterior: null, siguiente: null, total: 1, posicion: 1 },
            progreso: { estado: 'in_progress', porcentaje: 0 }
        };

        // Mock fetch implementation to handle different endpoints
        (global.fetch as any).mockImplementation((url: string) => {
             if (url.includes('/api/unlock-status')) {
                 return Promise.resolve({
                     json: async () => ({ '123': 'available' }),
                     ok: true
                 });
             }
             if (url.includes('/api/academy/unit/123')) {
                 return Promise.resolve({
                     json: async () => mockResponse,
                     ok: true
                 });
             }
             return Promise.reject(new Error(`Unknown URL: ${url}`));
        });

        render(<UnitReaderMain params={{ locale: 'es', id: '123' }} />);

        // Wait for content to load
        await waitFor(() => {
            expect(screen.getByText('Test Unit')).toBeInTheDocument();
        });

        // Verify "Safe Content" is present
        const safeContent = screen.getByText('Safe Content');
        expect(safeContent).toBeInTheDocument();

        // Check that dangerous script is removed from the parent container
        // The parent is the div with dangerouslySetInnerHTML
        const container = safeContent.closest('div');
        expect(container).toBeInTheDocument();
        expect(container?.innerHTML).toContain('<p>Safe Content</p>');
        expect(container?.innerHTML).not.toContain('<script>');
    });
});
