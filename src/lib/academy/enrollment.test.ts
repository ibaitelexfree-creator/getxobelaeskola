import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getUserEnrollments } from './enrollment';
import { createAdminClient } from '@/lib/supabase/admin';

// Mock the Supabase Admin Client
vi.mock('@/lib/supabase/admin', () => ({
    createAdminClient: vi.fn(),
}));

describe('getUserEnrollments', () => {
    let mockSupabase: any;
    let mockProfilesChain: any;
    let mockCursosChain: any;
    let mockInscripcionesChain: any;

    beforeEach(() => {
        vi.clearAllMocks();

        // Helper to create a chainable mock that is also awaitable
        const createChain = () => {
            const chain: any = {};
            chain.select = vi.fn().mockReturnValue(chain);
            chain.eq = vi.fn().mockReturnValue(chain);
            chain.single = vi.fn();
            chain.then = vi.fn(); // Make it awaitable
            return chain;
        };

        mockProfilesChain = createChain();
        mockCursosChain = createChain();
        mockInscripcionesChain = createChain();

        mockSupabase = {
            from: vi.fn((table: string) => {
                if (table === 'profiles') return mockProfilesChain;
                if (table === 'cursos') return mockCursosChain;
                if (table === 'inscripciones') return mockInscripcionesChain;
                return createChain();
            }),
        };

        (createAdminClient as any).mockReturnValue(mockSupabase);
    });

    it('returns empty array if userId is missing', async () => {
        const result = await getUserEnrollments('');
        expect(result).toEqual([]);
        expect(createAdminClient).not.toHaveBeenCalled();
    });

    it('returns all courses for admin user', async () => {
        const userId = 'admin-user-id';
        const mockCourses = [{ id: 'course-1' }, { id: 'course-2' }];

        // Mock Profile Response
        mockProfilesChain.single.mockResolvedValue({ data: { rol: 'admin' }, error: null });

        // Mock Courses Response
        // Since the code awaits the chain directly: await supabase...eq('activo', true)
        mockCursosChain.then.mockImplementation((resolve: any) => resolve({ data: mockCourses, error: null }));

        const result = await getUserEnrollments(userId);

        expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
        expect(mockProfilesChain.eq).toHaveBeenCalledWith('id', userId);

        expect(mockSupabase.from).toHaveBeenCalledWith('cursos');
        expect(mockCursosChain.eq).toHaveBeenCalledWith('activo', true);

        expect(result).toEqual(['course-1', 'course-2']);
    });

    it('returns all courses for instructor user', async () => {
        const userId = 'instructor-user-id';
        const mockCourses = [{ id: 'course-A' }];

        mockProfilesChain.single.mockResolvedValue({ data: { rol: 'instructor' }, error: null });
        mockCursosChain.then.mockImplementation((resolve: any) => resolve({ data: mockCourses, error: null }));

        const result = await getUserEnrollments(userId);
        expect(result).toEqual(['course-A']);
    });

    it('returns only paid enrollments for regular user', async () => {
        const userId = 'regular-user-id';
        const mockEnrollments = [
            { curso_id: 'course-101' },
            { curso_id: 'course-102' }
        ];

        mockProfilesChain.single.mockResolvedValue({ data: { rol: 'user' }, error: null });

        // Mock Inscripciones Response
        mockInscripcionesChain.then.mockImplementation((resolve: any) => resolve({ data: mockEnrollments, error: null }));

        const result = await getUserEnrollments(userId);

        expect(mockSupabase.from).toHaveBeenCalledWith('inscripciones');
        expect(mockInscripcionesChain.eq).toHaveBeenCalledWith('perfil_id', userId);
        expect(mockInscripcionesChain.eq).toHaveBeenCalledWith('estado_pago', 'pagado');

        expect(result).toEqual(['course-101', 'course-102']);
    });

    it('returns empty array for regular user with no enrollments', async () => {
        const userId = 'new-user-id';

        mockProfilesChain.single.mockResolvedValue({ data: { rol: 'user' }, error: null });
        mockInscripcionesChain.then.mockImplementation((resolve: any) => resolve({ data: [], error: null }));

        const result = await getUserEnrollments(userId);
        expect(result).toEqual([]);
    });

    it('handles database error gracefully for regular user', async () => {
        const userId = 'error-user-id';

        // Mock console.error to keep test output clean
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        mockProfilesChain.single.mockResolvedValue({ data: { rol: 'user' }, error: null });
        mockInscripcionesChain.then.mockImplementation((resolve: any) => resolve({ data: null, error: { message: 'DB Error' } }));

        const result = await getUserEnrollments(userId);

        expect(result).toEqual([]);
        expect(consoleSpy).toHaveBeenCalledWith('Error fetching enrollments:', { message: 'DB Error' });

        consoleSpy.mockRestore();
    });
});
