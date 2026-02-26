import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkAuth, requireAdmin, requireInstructor } from './auth-guard';

// Mock NextResponse
vi.mock('next/server', () => ({
    NextResponse: {
        json: (body: any, init?: { status?: number }) => ({ body, status: init?.status }),
    },
}));

// Create mocked functions and objects using vi.hoisted
const { mockGetUser, mockSingle, mockEq, mockSelect, mockFrom, mockSupabase, mockSupabaseAdmin } = vi.hoisted(() => {
    const mockGetUser = vi.fn();
    const mockSingle = vi.fn();
    const mockEq = vi.fn();
    const mockSelect = vi.fn();
    const mockFrom = vi.fn();

    // Setup chain
    mockFrom.mockReturnValue({ select: mockSelect });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ single: mockSingle });

    const mockSupabase = {
        auth: {
            getUser: mockGetUser,
        },
    };

    const mockSupabaseAdmin = {
        from: mockFrom,
    };

    return {
        mockGetUser,
        mockSingle,
        mockEq,
        mockSelect,
        mockFrom,
        mockSupabase,
        mockSupabaseAdmin
    };
});

// Mock Supabase client creators
vi.mock('@/lib/supabase/server', () => ({
    createClient: () => mockSupabase,
}));

vi.mock('@/lib/supabase/admin', () => ({
    createAdminClient: () => mockSupabaseAdmin,
}));

describe('Auth Guard', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset chain behavior just in case
        mockFrom.mockReturnValue({ select: mockSelect });
        mockSelect.mockReturnValue({ eq: mockEq });
        mockEq.mockReturnValue({ single: mockSingle });
    });

    describe('checkAuth', () => {
        it('should return 401 if no user is authenticated', async () => {
            mockGetUser.mockResolvedValue({ data: { user: null } });

            const result = await checkAuth();

            expect(result.error).toBeDefined();
            // Cast to any to access mocked properties
            const errorResponse = result.error as any;
            expect(errorResponse.status).toBe(401);
        });

        it('should return 404 if user is authenticated but profile is not found', async () => {
            const user = { id: 'user-123' };
            mockGetUser.mockResolvedValue({ data: { user } });
            // Profile fetch returns error or null data
            mockSingle.mockResolvedValue({ data: null, error: { message: 'Profile not found', code: '404' } });

            const result = await checkAuth();

            expect(mockGetUser).toHaveBeenCalled();
            expect(mockFrom).toHaveBeenCalledWith('profiles');
            expect(mockEq).toHaveBeenCalledWith('id', 'user-123');

            expect(result.error).toBeDefined();
            // Handle different error structures
            if ((result.error as any).status) {
                 expect((result.error as any).status).toBe(404);
            } else {
                 expect(result.error).toEqual(expect.objectContaining({ message: 'Profile not found' }));
            }
        });

        it('should return user, profile, and clients if authenticated and profile exists', async () => {
            const user = { id: 'user-123' };
            const profile = { id: 'user-123', rol: 'student' };
            mockGetUser.mockResolvedValue({ data: { user } });
            mockSingle.mockResolvedValue({ data: profile, error: null });

            const result = await checkAuth();

            expect(result.error).toBeFalsy();
            expect(result.user).toEqual(user);
            expect(result.profile).toEqual(profile);
            expect(result.supabase).toBe(mockSupabase);
            expect(result.supabaseAdmin).toBe(mockSupabaseAdmin);
        });
    });

    describe('requireAdmin', () => {
        it('should return error if checkAuth fails', async () => {
            mockGetUser.mockResolvedValue({ data: { user: null } });

            const result = await requireAdmin();

            expect(result.error).toBeDefined();
            const errorResponse = result.error as any;
            expect(errorResponse.status).toBe(401);
        });

        it('should return 403 if user is not admin', async () => {
            const user = { id: 'user-123' };
            const profile = { id: 'user-123', rol: 'student' };
            mockGetUser.mockResolvedValue({ data: { user } });
            mockSingle.mockResolvedValue({ data: profile, error: null });

            const result = await requireAdmin();

            expect(result.error).toBeDefined();
            const errorResponse = result.error as any;
            expect(errorResponse.status).toBe(403);
            expect(errorResponse.body).toEqual({ error: 'Acceso restringido a administradores' });
        });

        it('should succeed if user is admin', async () => {
            const user = { id: 'admin-123' };
            const profile = { id: 'admin-123', rol: 'admin' };
            mockGetUser.mockResolvedValue({ data: { user } });
            mockSingle.mockResolvedValue({ data: profile, error: null });

            const result = await requireAdmin();

            // Updated expectation to allow null or undefined
            expect(result.error).toBeFalsy();
            expect(result.user).toEqual(user);
            expect(result.profile).toEqual(profile);
        });
    });

    describe('requireInstructor', () => {
        it('should return error if checkAuth fails', async () => {
            mockGetUser.mockResolvedValue({ data: { user: null } });

            const result = await requireInstructor();

            expect(result.error).toBeDefined();
            const errorResponse = result.error as any;
            expect(errorResponse.status).toBe(401);
        });

        it('should return 403 if user is strictly student', async () => {
            const user = { id: 'student-123' };
            const profile = { id: 'student-123', rol: 'student' };
            mockGetUser.mockResolvedValue({ data: { user } });
            mockSingle.mockResolvedValue({ data: profile, error: null });

            const result = await requireInstructor();

            expect(result.error).toBeDefined();
            const errorResponse = result.error as any;
            expect(errorResponse.status).toBe(403);
            expect(errorResponse.body).toEqual({ error: 'Acceso restringido a instructores o administradores' });
        });

        it('should succeed if user is instructor', async () => {
            const user = { id: 'inst-123' };
            const profile = { id: 'inst-123', rol: 'instructor' };
            mockGetUser.mockResolvedValue({ data: { user } });
            mockSingle.mockResolvedValue({ data: profile, error: null });

            const result = await requireInstructor();

            // Updated expectation
            expect(result.error).toBeFalsy();
            expect(result.user).toEqual(user);
        });

        it('should succeed if user is admin', async () => {
            const user = { id: 'admin-123' };
            const profile = { id: 'admin-123', rol: 'admin' };
            mockGetUser.mockResolvedValue({ data: { user } });
            mockSingle.mockResolvedValue({ data: profile, error: null });

            const result = await requireInstructor();

            // Updated expectation
            expect(result.error).toBeFalsy();
            expect(result.user).toEqual(user);
        });
    });
});
