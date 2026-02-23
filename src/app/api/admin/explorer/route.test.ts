
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Hoist mock object so it's available in vi.mock factory
const { mockSupabase } = vi.hoisted(() => {
    return {
        mockSupabase: {
            callCount: 0,
            from: vi.fn(),
        }
    };
});

// Mock createClient
vi.mock('@/lib/supabase/server', () => ({
    createClient: () => mockSupabase
}));

// Mock next/server
vi.mock('next/server', () => ({
    NextResponse: {
        json: (body: any) => ({ _json: body })
    }
}));

// Import implementation after mocking
import { GET } from './route';

// Helper to generate dummy data
const generateData = (count: number) => Array(count).fill(0).map((_, i) => ({
    id: i + 1, // Start from 1 to avoid falsy checks
    email: `user${i + 1}@example.com`,
    perfil_id: i + 1,
    curso_id: i + 1,
    embarcacion_id: i + 1,
    // Add other fields to satisfy potential TS interfaces if needed implicitly
    nombre: `Item ${i + 1}`
}));

// Mock Query Builder Implementation
const createQueryBuilder = (table: string) => {
    // We need to return a "thenable" object to simulate await
    // and chainable methods.
    return {
        select: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),

        // Simulate promise resolution
        then(resolve: any, reject: any) {
            mockSupabase.callCount++;

            // Default response
            // We return 5 items to ensure loops run
            const data = generateData(5);
            const count = 5; // Ensure count > 0 checks pass

            resolve({ data, error: null, count });
        }
    };
};

describe('Admin Explorer API Performance', () => {
    beforeEach(() => {
        mockSupabase.callCount = 0;
        mockSupabase.from.mockImplementation((table) => createQueryBuilder(table));
    });

    it('executes optimized batched queries', async () => {
        // Construct request
        const req = new Request('http://localhost:3000/api/admin/explorer?q=test&table=all');

        // Execute handler
        await GET(req);

        console.log(`Measured DB Calls: ${mockSupabase.callCount}`);

        // Verify optimized behavior
        // 4 initial searches
        // + Batched relations checks:
        // Profiles (4 rels) -> 4 calls
        // Cursos (2 rels) -> 2 calls
        // Embarcaciones (1 rel) -> 1 call
        // Reservas (0 rels) = 0
        // Total expected: 4 + 4 + 2 + 1 = 11 calls.

        expect(mockSupabase.callCount).toBeLessThan(15);
        expect(mockSupabase.callCount).toBeGreaterThan(0);
    });
});
