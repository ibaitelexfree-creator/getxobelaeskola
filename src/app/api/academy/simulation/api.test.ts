
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST as startPOST } from './start/route';
import { POST as submitPOST } from './submit/route';
import { NextResponse } from 'next/server';

// --- MOCKS ---

const { mockSupabaseClient, mockSupabaseAdmin, mockSelect } = vi.hoisted(() => {
    const mockSelect = vi.fn();
    const mockSupabaseAdmin = {
        from: vi.fn(() => ({
            select: mockSelect,
        })),
    };

    const mockSupabaseClient = {
        auth: {
            getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user-123' } }, error: null }),
        },
    };

    return { mockSupabaseClient, mockSupabaseAdmin, mockSelect };
});

vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn().mockResolvedValue(mockSupabaseClient),
}));

vi.mock('@/lib/supabase/admin', () => ({
    createAdminClient: vi.fn().mockReturnValue(mockSupabaseAdmin),
}));

// Mock NextResponse
vi.mock('next/server', () => ({
    NextResponse: {
        json: vi.fn((data, init) => ({
            json: () => Promise.resolve(data),
            status: init?.status || 200
        })),
    },
}));


describe('Simulation API Logic', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('POST /start', () => {
        it('should fetch IDs, shuffle, and return 60 questions', async () => {
            // 1. Mock first call: select('id')
            // Return 100 fake IDs
            const allIds = Array.from({ length: 100 }, (_, i) => ({ id: `q-${i}` }));

            // 2. Mock second call: select(...).in(...)
            // Return 60 fake question details
            const selectedQuestions = Array.from({ length: 60 }, (_, i) => ({
                id: `q-${i}`,
                tipo_pregunta: 'opcion_multiple',
                enunciado_es: 'Pregunta ' + i
            }));

            // Setup mock behavior
            mockSelect
                .mockResolvedValueOnce({ data: allIds, error: null }) // First call
                .mockReturnValueOnce({ // Second call returns builder with .in()
                    in: vi.fn().mockResolvedValue({ data: selectedQuestions, error: null })
                });

            const response = await startPOST();
            const data = await response.json();

            expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('preguntas');
            // Expect first select
            expect(mockSelect).toHaveBeenCalledTimes(2);

            // Verify Logic
            expect(data.allowed).toBe(true);
            expect(data.preguntas).toHaveLength(60);
            expect(data.tiempo_limite_min).toBe(90);
        });

        it('should handle error when fetching IDs fails', async () => {
             mockSelect.mockResolvedValueOnce({ data: null, error: { message: 'DB Error' } });

             const response = await startPOST();
             const data = await response.json();

             expect(response.status).toBe(500);
             expect(data.error).toBe('Error al obtener preguntas');
        });
    });

    describe('POST /submit', () => {
        it('should calculate score correctly (Pass > 70%)', async () => {
            // Setup Request
            const answers = {
                'q1': 'A',
                'q2': 'B', // Wrong
                'q3': 'C',
            };
            const request = {
                json: async () => ({ answers }),
            } as unknown as Request;

            // Mock DB returning correct answers for these IDs
            const correctAnswers = [
                { id: 'q1', respuesta_correcta: 'A', puntos: 1 },
                { id: 'q2', respuesta_correcta: 'A', puntos: 1 }, // User said B
                { id: 'q3', respuesta_correcta: 'C', puntos: 1 },
            ];

            // Submit calls: select(...).in(...)
            // Reset mock for this test
            mockSelect.mockReset();
            mockSelect.mockReturnValue({
                in: vi.fn().mockResolvedValue({ data: correctAnswers, error: null })
            });

            const response = await submitPOST(request);
            const data = await response.json();

            // 2 out of 3 correct = 66.6%
            expect(data.puntos_obtenidos).toBe(2);
            expect(data.puntos_totales).toBe(3);
            expect(data.aprobado).toBe(false); // 66% < 70%
            expect(data.puntuacion).toBe(67); // Math.round(66.66)
        });

        it('should return 400 if no answers provided', async () => {
             const request = {
                json: async () => ({ }),
            } as unknown as Request;

            const response = await submitPOST(request);
            expect(response.status).toBe(400);
        });
    });
});
