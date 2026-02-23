
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';

const { mocks, resetStats } = vi.hoisted(() => {
    let callCount = 0;

    // Simulate query builder
    const builder = {
        select: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),

        // Then method makes it awaitable
        then: (resolve: any, reject: any) => {
            callCount++;
            // Return dummy data
            const data = Array(5).fill(0).map((_, i) => ({
                id: i + 1,
                email: `user${i+1}@example.com`,
                perfil_id: i + 1, // for reverse check simulation
                curso_id: i + 1,
                embarcacion_id: i + 1,
                nombre: `Item ${i+1}`
            }));

            // Resolve with Supabase-like response
            resolve({ data, error: null, count: 5 });
        }
    };

    return {
        mocks: {
            createClient: () => ({
                from: vi.fn(() => builder)
            }),
            stats: { get calls() { return callCount; }, reset: () => { callCount = 0; } }
        },
        resetStats: () => { mocks.stats.reset(); }
    };
});

vi.mock('@/lib/supabase/server', () => ({
    createClient: mocks.createClient
}));

vi.mock('next/headers', () => ({
    cookies: () => ({ getAll: () => [] })
}));

vi.mock('next/server', () => ({
    NextResponse: {
        json: (body: any) => ({
            json: async () => body,
            body
        })
    }
}));

describe('Admin Explorer API Performance', () => {
    beforeEach(() => {
        mocks.stats.reset();
    });

    it('should reduce N+1 queries significantly', async () => {
        const req = new Request('http://localhost/api/admin/explorer?q=test&table=all');
        const response = await GET(req);
        const json = await response.json();

        console.log(`Database calls made: ${mocks.stats.calls}`);

        // Original implementation makes ~34 calls
        // Optimized implementation should make ~11 calls
        // We set a threshold of 20 to catch regressions or confirm improvement
        expect(mocks.stats.calls).toBeLessThan(20);

        // Verify response structure
        expect(json.results).toBeDefined();
        expect(json.results.length).toBeGreaterThan(0);
        // We can't easily check _relations content deeply with mock builder returning same data for everything
        // But we can check it exists
        if (json.results[0]._relations) {
            expect(Array.isArray(json.results[0]._relations)).toBe(true);
        }
    });
});
