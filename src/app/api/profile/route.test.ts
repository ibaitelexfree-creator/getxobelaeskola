import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { NextRequest } from 'next/server';
import { checkAuth } from '@/lib/auth-guard';

vi.mock('@/lib/auth-guard', () => ({
    checkAuth: vi.fn(),
}));

describe('GET /api/profile', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 400 if user_id is missing', async () => {
        const req = new NextRequest('http://localhost/api/profile');
        const res = await GET(req);
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toBe('User ID is required');
    });

    it('should return 401 if unauthorized', async () => {
        (checkAuth as any).mockResolvedValue({
            user: null,
            profile: null,
            error: { message: 'Unauthorized' },
            supabase: {}
        });

        const req = new NextRequest('http://localhost/api/profile?user_id=123');
        const res = await GET(req);
        expect(res.status).toBe(401);
    });

    it('should return 403 if user is not owner and not admin', async () => {
        (checkAuth as any).mockResolvedValue({
            user: { id: 'other_user' },
            profile: { rol: 'user' },
            error: null,
            supabase: {}
        });

        const req = new NextRequest('http://localhost/api/profile?user_id=123');
        const res = await GET(req);
        expect(res.status).toBe(403);
        const data = await res.json();
        expect(data.error).toBe('Forbidden');
    });

    it('should return profile data for owner', async () => {
        const mockProfile = { id: '123', nombre: 'Test User', rol: 'user', status_socio: 'activo' };
        const mockSupabase = {
            from: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
        };

        (checkAuth as any).mockResolvedValue({
            user: { id: '123' },
            profile: { rol: 'user' },
            error: null,
            supabase: mockSupabase
        });

        const req = new NextRequest('http://localhost/api/profile?user_id=123');
        const res = await GET(req);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data).toEqual(mockProfile);
    });

    it('should return profile data for admin looking at another user', async () => {
        const mockProfile = { id: '123', nombre: 'Test User', rol: 'user', status_socio: 'activo' };
        const mockSupabase = {
            from: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
        };

        (checkAuth as any).mockResolvedValue({
            user: { id: 'admin_id' },
            profile: { rol: 'admin' },
            error: null,
            supabase: mockSupabase
        });

        const req = new NextRequest('http://localhost/api/profile?user_id=123');
        const res = await GET(req);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data).toEqual(mockProfile);
    });

    it('should return 404 if profile not found', async () => {
        const mockSupabase = {
            from: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
        };

        (checkAuth as any).mockResolvedValue({
            user: { id: '123' },
            profile: { rol: 'user' },
            error: null,
            supabase: mockSupabase
        });

        const req = new NextRequest('http://localhost/api/profile?user_id=123');
        const res = await GET(req);
        expect(res.status).toBe(404);
    });
});
