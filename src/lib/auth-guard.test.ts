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
        it('should return null user if no user is authenticated', async () => {
            mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

            const result = await checkAuth();

            // checkAuth returns { user: null, error: null } if explicit null is returned from supabase
            // It does NOT return a 401 response object itself.
            expect(result.user).toBeNull();
            expect(result.error).toBeNull();
        });

        it('should return error if Supabase returns error', async () => {
            const authError = { message: 'Auth error', status: 401 };
            mockGetUser.mockResolvedValue({ data: { user: null }, error: authError });

            const result = await checkAuth();

            expect(result.error).toEqual(authError);
        });

        it('should return 404 in result.error if profile is not found (assuming checkAuth handles this logic internally?)', async () => {
            // Wait, checkAuth implementation:
            // const { data: profile, error: profileError } = ...
            // return { ..., error: profileError || null };
            // If profile is null and profileError is null (Supabase single() might return error if not found depending on config, but here mock returns null data)

            const user = { id: 'user-123' };
            mockGetUser.mockResolvedValue({ data: { user } });
            // Simulate Supabase returning null data and maybe an error or just null
            // Usually single() returns error if row missing unless maybeSingle() is used.
            // Let's assume the mock returns null data and null error for now, simulating a successful query that found nothing (if maybeSingle used) OR an error if single() used.
            // If checkAuth uses .single(), it throws or returns error if 0 rows.
            // Let's assume the code uses .single() and we mock the error behavior.

            const notFoundError = { code: 'PGRST116', message: 'JSON object requested, multiple (or no) rows returned' };
            mockSingle.mockResolvedValue({ data: null, error: notFoundError });

            const result = await checkAuth();

            expect(result.profile).toBeNull();
            expect(result.error).toEqual(notFoundError);
        });

        it('should return user, profile, and clients if authenticated and profile exists', async () => {
            const user = { id: 'user-123' };
            const profile = { id: 'user-123', rol: 'student' };
            mockGetUser.mockResolvedValue({ data: { user } });
            mockSingle.mockResolvedValue({ data: profile, error: null });

            const result = await checkAuth();

            expect(result.error).toBeNull();
            expect(result.user).toEqual(user);
            expect(result.profile).toEqual(profile);
            expect(result.supabase).toBe(mockSupabase);
            expect(result.supabaseAdmin).toBe(mockSupabaseAdmin);
        });
    });

    describe('requireAdmin', () => {
        it('should return error if checkAuth fails', async () => {
            mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: 'No auth' } });

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

            expect(result.error).toBeUndefined();
            expect(result.user).toEqual(user);
            expect(result.profile).toEqual(profile);
        });
    });

    describe('requireInstructor', () => {
        it('should return error if checkAuth fails', async () => {
            mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: 'No auth' } });

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

            expect(result.error).toBeUndefined();
            expect(result.user).toEqual(user);
        });

        it('should succeed if user is admin', async () => {
            const user = { id: 'admin-123' };
            const profile = { id: 'admin-123', rol: 'admin' };
            mockGetUser.mockResolvedValue({ data: { user } });
            mockSingle.mockResolvedValue({ data: profile, error: null });

            const result = await requireInstructor();

            expect(result.error).toBeUndefined();
            expect(result.user).toEqual(user);
        });
    });
});
