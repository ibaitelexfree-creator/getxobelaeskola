import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { requireAuth } from '@/lib/auth-guard';
import { isPointInWater } from '@/lib/geospatial/water-check';
import { fetchEuskalmetAlerts } from '@/lib/euskalmet';
import { createClient } from '@/lib/supabase/server';

// Mock dependencies
vi.mock('@/lib/auth-guard', () => ({
    requireAuth: vi.fn()
}));

vi.mock('@/lib/geospatial/water-check', () => ({
    isPointInWater: vi.fn()
}));

vi.mock('@/lib/euskalmet', () => ({
    fetchEuskalmetAlerts: vi.fn()
}));

vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn()
}));

describe('Heartbeat API', () => {
    let mockSupabase: any;
    const mockUser = { id: 'test-user-id' };

    beforeEach(() => {
        vi.clearAllMocks();

        mockSupabase = {
            from: vi.fn().mockReturnThis(),
            upsert: vi.fn().mockResolvedValue({ error: null })
        };
        (createClient as any).mockReturnValue(mockSupabase);
    });

    it('should return 401 if unauthorized', async () => {
        (requireAuth as any).mockResolvedValue({ user: null, error: { message: 'No auth' } });

        const req = new Request('http://localhost/api/tracking/heartbeat', {
            method: 'POST',
            body: JSON.stringify({ lat: 43.34, lng: -3.01 })
        });

        const res = await POST(req);
        expect(res.status).toBe(401);
    });

    it('should calculate server_interval correctly for sailing at 5 knots', async () => {
        (requireAuth as any).mockResolvedValue({ user: mockUser, error: null });
        (isPointInWater as any).mockReturnValue(true);
        (fetchEuskalmetAlerts as any).mockResolvedValue([]);

        const req = new Request('http://localhost/api/tracking/heartbeat', {
            method: 'POST',
            body: JSON.stringify({
                lat: 43.34,
                lng: -3.01,
                speed: 2.5 // ~5 knots (9km/h)
            })
        });

        const res = await POST(req);
        const data = await res.json();

        expect(data.in_water).toBe(true);
        expect(data.server_interval).toBe(15000); // 15s for speed 1-3 m/s
        expect(mockSupabase.from).toHaveBeenCalledWith('user_live_locations');
    });

    it('should reduce interval if alerts are active', async () => {
        (requireAuth as any).mockResolvedValue({ user: mockUser, error: null });
        (isPointInWater as any).mockReturnValue(true);
        (fetchEuskalmetAlerts as any).mockResolvedValue([{ type: 'costa' }]);

        const req = new Request('http://localhost/api/tracking/heartbeat', {
            method: 'POST',
            body: JSON.stringify({
                lat: 43.34,
                lng: -3.01,
                speed: 0.1 // standing still (normally 60s or 30s)
            })
        });

        const res = await POST(req);
        const data = await res.json();

        expect(data.server_interval).toBe(10000); // reduced to 10s max due to alerts
    });

    it('should increase interval if on land', async () => {
        (requireAuth as any).mockResolvedValue({ user: mockUser, error: null });
        (isPointInWater as any).mockReturnValue(false);
        (fetchEuskalmetAlerts as any).mockResolvedValue([]);

        const req = new Request('http://localhost/api/tracking/heartbeat', {
            method: 'POST',
            body: JSON.stringify({
                lat: 43.34,
                lng: -3.01,
                speed: 10 // driving in car
            })
        });

        const res = await POST(req);
        const data = await res.json();

        expect(data.in_water).toBe(false);
        expect(data.server_interval).toBe(120000); // 2 minutes if on land
    });
});
