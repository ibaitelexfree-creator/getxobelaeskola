import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn(),
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
        const mockSupabase = {
            auth: {
                getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
            },
        };
        (createClient as any).mockReturnValue(mockSupabase);

        const req = new NextRequest('http://localhost/api/profile?user_id=123');
        const res = await GET(req);
        expect(res.status).toBe(401);
    });

    it('should return profile data for authorized user', async () => {
        const mockProfile = { id: '123', email: 'test@example.com', rol: 'admin' };
        const mockSupabase = {
            auth: {
                getUser: vi.fn().mockResolvedValue({ data: { user: { id: '123' } }, error: null }),
            },
            from: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
        };
        (createClient as any).mockReturnValue(mockSupabase);

        const req = new NextRequest('http://localhost/api/profile?user_id=123');
        const res = await GET(req);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data).toEqual(mockProfile);
    });

    it('should return 404 if profile not found', async () => {
        const mockSupabase = {
            auth: {
                getUser: vi.fn().mockResolvedValue({ data: { user: { id: '123' } }, error: null }),
            },
            from: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
        };
        (createClient as any).mockReturnValue(mockSupabase);

        const req = new NextRequest('http://localhost/api/profile?user_id=123');
        const res = await GET(req);
        expect(res.status).toBe(404);
    });
});
