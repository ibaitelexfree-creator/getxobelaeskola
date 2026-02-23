import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkAuth } from './auth-guard';

const mockGetUser = vi.fn();
const mockFrom = vi.fn();
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
    createClient: () => ({
        auth: {
            getUser: mockGetUser
        }
    })
}));

vi.mock('@/lib/supabase/admin', () => ({
    createAdminClient: () => ({
        from: mockFrom
    })
}));

describe('Auth Guard', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockFrom.mockReturnValue({ select: mockSelect });
        mockSelect.mockReturnValue({ eq: mockEq });
        mockEq.mockReturnValue({ single: mockSingle });
    });

    it('should return null user and error if no user is authenticated', async () => {
        // Mock no user
        mockGetUser.mockResolvedValue({ data: { user: null }, error: new Error('No session') });

        const result = await checkAuth();

        expect(result.user).toBeNull();
        expect(result.error).toBeDefined();
        expect(result.error).not.toBeNull();
    });

    it('should return error if profile is not found', async () => {
        mockGetUser.mockResolvedValue({ data: { user: { id: '123' } }, error: null });
        mockSingle.mockResolvedValue({ data: null, error: { message: 'Not found', code: '404' } });

        const result = await checkAuth();

        expect(result.user).toBeDefined();
        expect(result.profile).toBeNull();
        expect(result.error).toEqual({ message: 'Not found', code: '404' });
    });

    it('should return user, profile, and clients if authenticated and profile exists', async () => {
        const user = { id: '123' };
        const profile = { id: '123', rol: 'student' };
        mockGetUser.mockResolvedValue({ data: { user }, error: null });
        mockSingle.mockResolvedValue({ data: profile, error: null });

        const result = await checkAuth();

        expect(result.error).toBeNull(); // Changed from toBeUndefined()
        expect(result.user).toEqual(user);
        expect(result.profile).toEqual(profile);
        expect(result.supabase).toBeDefined();
        expect(result.supabaseAdmin).toBeDefined();
    });
});
