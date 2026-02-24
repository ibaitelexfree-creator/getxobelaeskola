import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getUserEnrollments } from './enrollment';
import { createAdminClient } from '@/lib/supabase/admin';

vi.mock('server-only', () => ({}));

// Mock the admin client
vi.mock('@/lib/supabase/admin', () => ({
    createAdminClient: vi.fn()
}));

describe('getUserEnrollments', () => {
    let mockSupabase: any;
    let consoleSpy: any;

    beforeEach(() => {
        vi.clearAllMocks();
        consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        // Default mock implementation for the chain
        mockSupabase = {
            from: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: null, error: null })
        };
        (mockSupabase as any).then = undefined; // Avoid promise-like behavior if not needed

        (createAdminClient as any).mockReturnValue(mockSupabase);
    });

    it('1️⃣ should return empty array when userId is empty', async () => {
        const result = await getUserEnrollments('');
        expect(result).toEqual([]);
        expect(createAdminClient).not.toHaveBeenCalled();
    });

    it('2️⃣ should return all active courses for admin role', async () => {
        const userId = 'admin-uuid';

        // Mock profile fetch
        mockSupabase.single.mockResolvedValueOnce({
            data: { rol: 'admin' },
            error: null
        });

        // Mock courses fetch
        // Note: the code for admin/instructor doesn't use .single() for courses
        // It uses .eq('activo', true) which returns the chain itself which is awaited
        mockSupabase.eq.mockImplementation((column: string, value: any) => {
            if (column === 'activo' && value === true) {
                return Promise.resolve({ data: [{ id: 'course-1' }, { id: 'course-2' }], error: null });
            }
            return mockSupabase;
        });

        const result = await getUserEnrollments(userId);

        expect(result).toEqual(['course-1', 'course-2']);
        expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
        expect(mockSupabase.from).toHaveBeenCalledWith('cursos');
        expect(mockSupabase.eq).toHaveBeenCalledWith('activo', true);
    });

    it('3️⃣ should return all active courses for instructor role', async () => {
        const userId = 'instructor-uuid';

        mockSupabase.single.mockResolvedValueOnce({
            data: { rol: 'instructor' },
            error: null
        });

        mockSupabase.eq.mockImplementation((column: string, value: any) => {
            if (column === 'activo' && value === true) {
                return Promise.resolve({ data: [{ id: 'course-a' }], error: null });
            }
            return mockSupabase;
        });

        const result = await getUserEnrollments(userId);

        expect(result).toEqual(['course-a']);
        expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
        expect(mockSupabase.from).toHaveBeenCalledWith('cursos');
    });

    it('4️⃣ should return paid enrollments for regular user', async () => {
        const userId = 'user-uuid';

        // Profile fetch (not admin)
        mockSupabase.single.mockResolvedValueOnce({
            data: { rol: 'user' },
            error: null
        });

        // Enrollment fetch
        // The chain ends with .eq('estado_pago', 'pagado') which is then awaited
        mockSupabase.eq.mockImplementation(function(this: any, column: string, value: any) {
            if (column === 'estado_pago' && value === 'pagado') {
                return Promise.resolve({ data: [{ curso_id: 'c1' }, { curso_id: 'c2' }], error: null });
            }
            return this;
        });

        const result = await getUserEnrollments(userId);

        expect(result).toEqual(['c1', 'c2']);
        expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
        expect(mockSupabase.from).toHaveBeenCalledWith('inscripciones');
        expect(mockSupabase.eq).toHaveBeenCalledWith('perfil_id', userId);
        expect(mockSupabase.eq).toHaveBeenCalledWith('estado_pago', 'pagado');
    });

    it('5️⃣ should return empty array for user without enrollments', async () => {
        const userId = 'user-no-enroll-uuid';

        mockSupabase.single.mockResolvedValueOnce({ data: { rol: 'user' }, error: null });

        mockSupabase.eq.mockImplementation(function(this: any, column: string, value: any) {
            if (column === 'estado_pago' && value === 'pagado') {
                return Promise.resolve({ data: [], error: null });
            }
            return this;
        });

        const result = await getUserEnrollments(userId);

        expect(result).toEqual([]);
    });

    it('6️⃣ should return empty array and log error when profile fetch fails', async () => {
        const userId = 'error-uuid';
        const error = { message: 'DB Error' };

        mockSupabase.single.mockResolvedValueOnce({ data: null, error });

        // For regular user flow if it continues (though it shouldn't if it's admin check but let's see)
        // Actually, if profile is null, it continues to regular user flow
        mockSupabase.eq.mockImplementation(function(this: any, column: string, value: any) {
             if (column === 'estado_pago' && value === 'pagado') {
                return Promise.resolve({ data: null, error: { message: 'Secondary Error' } });
            }
            return this;
        });

        const result = await getUserEnrollments(userId);

        expect(result).toEqual([]);
        expect(consoleSpy).toHaveBeenCalled();
    });

    it('7️⃣ should return empty array and log error when enrollment fetch fails', async () => {
        const userId = 'user-uuid';

        mockSupabase.single.mockResolvedValueOnce({ data: { rol: 'user' }, error: null });

        mockSupabase.eq.mockImplementation(function(this: any, column: string, value: any) {
            if (column === 'estado_pago' && value === 'pagado') {
                return Promise.resolve({ data: null, error: { message: 'Fetch Error' } });
            }
            return this;
        });

        const result = await getUserEnrollments(userId);

        expect(result).toEqual([]);
        expect(consoleSpy).toHaveBeenCalledWith('Error fetching enrollments:', { message: 'Fetch Error' });
    });
});
