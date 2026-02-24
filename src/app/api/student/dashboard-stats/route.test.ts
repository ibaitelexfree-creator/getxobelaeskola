import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { createClient } from '@/lib/supabase/server';

// Mock the Supabase Server Client
vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn(),
}));

describe('Dashboard Stats API', () => {
    let mockSupabase: any;
    let mockUser = { id: 'test-user-id', email: 'test@example.com' };

    beforeEach(() => {
        vi.clearAllMocks();

        const createChain = (table: string) => {
            const chain: any = {
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                in: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({ data: null, error: null }),
                maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
                // Handle the case where it's awaited directly (like .select().eq()...)
                then: vi.fn().mockImplementation(function(onfulfilled) {
                    let data: any = [];
                    if (table === 'profiles') data = { id: 'test-user-id', nombre: 'Test' };
                    if (table === 'inscripciones') data = [
                        {
                            id: 'ins-1',
                            curso_id: 'course-1',
                            edicion_id: 'ed-1',
                            cursos: { id: 'course-1', nombre_es: 'Course 1', nombre_eu: 'Course 1 EU', slug: 'course-1' },
                            ediciones_curso: {
                                id: 'ed-1',
                                curso_id: 'course-1',
                                fecha_inicio: '2023-01-01',
                                fecha_fin: '2023-01-02',
                                cursos: { id: 'course-1', nombre_es: 'Course 1', nombre_eu: 'Course 1 EU', slug: 'course-1' }
                            }
                        }
                    ];
                    if (table === 'modulos') {
                        // For { count: 'exact', head: true }
                        return Promise.resolve({ count: 10, error: null }).then(onfulfilled);
                    }
                    return Promise.resolve({ data, error: null }).then(onfulfilled);
                })
            };
            return chain;
        };

        mockSupabase = {
            auth: {
                getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
            },
            from: vi.fn((table: string) => createChain(table)),
        };

        (createClient as any).mockResolvedValue(mockSupabase);
    });

    it('returns the correct structure with optimized joins', async () => {
        const response = await GET();
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toHaveProperty('inscripciones');
        expect(data.inscripciones).toHaveLength(1);

        const ins = data.inscripciones[0];
        expect(ins.id).toBe('ins-1');

        // Verify joined course
        expect(ins.cursos).toBeDefined();
        expect(ins.cursos.id).toBe('course-1');
        expect(ins.cursos.nombre_es).toBe('Course 1');

        // Verify joined edition and its joined course
        expect(ins.ediciones_curso).toBeDefined();
        expect(ins.ediciones_curso.id).toBe('ed-1');
        expect(ins.ediciones_curso.cursos).toBeDefined();
        expect(ins.ediciones_curso.cursos.nombre_es).toBe('Course 1');

        // Verify academy stats are calculated
        expect(data).toHaveProperty('academyStats');
        expect(data.academyStats.totalModules).toBe(10);
    });

    it('handles unauthorized access', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: { message: 'Unauthorized' } });
        const response = await GET();
        expect(response.status).toBe(401);
    });
});
