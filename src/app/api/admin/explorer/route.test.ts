import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { createClient } from '@/lib/supabase/server';

// Mock Supabase client
vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn(),
}));

vi.mock('next/headers', () => ({
    cookies: vi.fn(),
}));

describe('Admin Explorer API Performance Optimization', () => {
    let mockSupabase: any;
    let mockSelect: any;
    let mockOr: any;
    let mockLimit: any;
    let mockIn: any;

    beforeEach(() => {
        vi.clearAllMocks();

        // Define shared spies
        mockSelect = vi.fn().mockReturnThis();
        mockOr = vi.fn().mockReturnThis();
        mockLimit = vi.fn().mockResolvedValue({ data: [], error: null });
        mockIn = vi.fn().mockResolvedValue({ data: [], error: null });

        // Base mock structure using shared spies
        mockSupabase = {
            from: vi.fn(),
        };
        (createClient as any).mockReturnValue(mockSupabase);
    });

    it('should use manual batching to fetch related data', async () => {
        const mockData = [
            {
                id: 'user1',
                nombre: 'John',
                email: 'john@example.com'
            }
        ];

        // Setup mock responses based on table
        mockSupabase.from.mockImplementation((table: string) => {
            // Re-bind return values for specific tables
            if (table === 'profiles') {
                mockLimit.mockResolvedValueOnce({ data: mockData, error: null });
            }
            // Just return the shared chain objects
            return {
                select: mockSelect,
                or: mockOr,
                limit: mockLimit,
                in: mockIn
            };
        });

        // Mock related data responses
        mockIn.mockImplementation(async () => {
            // This is generic, but sufficient if we check the calls
            return { data: [{ perfil_id: 'user1', email: 'john@example.com' }, { perfil_id: 'user1' }], error: null };
        });

        const req = new Request('http://localhost/api/admin/explorer?q=john&table=profiles');
        const response = await GET(req);
        const json = await response.json();

        // Verify that from was called with 'profiles'
        expect(mockSupabase.from).toHaveBeenCalledWith('profiles');

        // Verify that select was called with '*' (manual batching strategy)
        const selectCall = mockSelect.mock.calls[0][0];
        expect(selectCall).toBe('*');

        // Verify manual batching calls via .in()
        expect(mockSupabase.from).toHaveBeenCalledWith('reservas_alquiler');
        expect(mockSupabase.from).toHaveBeenCalledWith('inscripciones');
        expect(mockSupabase.from).toHaveBeenCalledWith('mensajes_contacto');
        expect(mockSupabase.from).toHaveBeenCalledWith('newsletter_subscriptions');

        // Verify .in() was called to fetch related data
        expect(mockIn).toHaveBeenCalled();

        // Verify output format contains relations (count > 0 because mockIn returns data)
        expect(json.results[0]._relations.length).toBeGreaterThan(0);
    });

    it('should correctly handle tables without relations', async () => {
        const mockData = [{ id: 'res1', estado_entrega: 'pendiente' }];

        mockSupabase.from.mockImplementation((table: string) => {
            if (table === 'reservas_alquiler') {
                mockLimit.mockResolvedValueOnce({ data: mockData, error: null });
            }
            return {
                select: mockSelect,
                or: mockOr,
                limit: mockLimit,
                in: mockIn
            };
        });

        const req = new Request('http://localhost/api/admin/explorer?q=res1&table=reservas_alquiler');
        const response = await GET(req);
        const json = await response.json();

        expect(mockSupabase.from).toHaveBeenCalledWith('reservas_alquiler');
        expect(json.results[0]._relations).toHaveLength(0);
        // Only 1 query since no relations configured for reservas_alquiler in RELATIONS map
        expect(mockSupabase.from).toHaveBeenCalledTimes(1);
    });

    it('should search all tables in parallel and perform one query per table', async () => {
        mockLimit.mockResolvedValue({ data: [], error: null });

        mockSupabase.from.mockImplementation((table: string) => {
            return {
                select: mockSelect,
                or: mockOr,
                limit: mockLimit,
                in: mockIn
            };
        });

        const req = new Request('http://localhost/api/admin/explorer?q=searchterm');
        await GET(req);

        // Should call from once for each table in SEARCHABLE_COLS (6 tables)
        expect(mockSupabase.from).toHaveBeenCalledTimes(6);
        expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
        expect(mockSupabase.from).toHaveBeenCalledWith('cursos');
        expect(mockSupabase.from).toHaveBeenCalledWith('embarcaciones');
        expect(mockSupabase.from).toHaveBeenCalledWith('reservas_alquiler');
        expect(mockSupabase.from).toHaveBeenCalledWith('mensajes_contacto');
        expect(mockSupabase.from).toHaveBeenCalledWith('newsletter_subscriptions');
    });
});
