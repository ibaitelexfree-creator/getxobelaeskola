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

    beforeEach(() => {
        vi.clearAllMocks();

        // Base mock structure with all chainable methods
        mockSupabase = {
            from: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            or: vi.fn().mockReturnThis(),
            limit: vi.fn().mockReturnThis(),
            in: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockReturnThis(),
        };
        (createClient as any).mockReturnValue(mockSupabase);
    });

    it('should use efficient batching and avoid N+1 queries for profiles', async () => {
        const mockData = [
            {
                id: 'user1',
                nombre: 'John',
                email: 'john@example.com'
            }
        ];

        // Setup mock responses based on table
        mockSupabase.from.mockImplementation((table: string) => {
            if (table === 'profiles') {
                mockSupabase.limit.mockResolvedValueOnce({ data: mockData, error: null });
            } else if (table === 'reservas_alquiler') {
                mockSupabase.in.mockResolvedValueOnce({ data: [{ perfil_id: 'user1' }, { perfil_id: 'user1' }], error: null });
            } else if (table === 'inscripciones') {
                mockSupabase.in.mockResolvedValueOnce({ data: [{ perfil_id: 'user1' }], error: null });
            } else if (table === 'newsletter_subscriptions') {
                mockSupabase.in.mockResolvedValueOnce({
                    data: Array(5).fill({ email: 'john@example.com' }),
                    error: null
                });
            } else {
                mockSupabase.in.mockResolvedValueOnce({ data: [], error: null });
                mockSupabase.limit.mockResolvedValueOnce({ data: [], error: null });
            }
            return mockSupabase;
        });

        const req = new Request('http://localhost/api/admin/explorer?q=john&table=profiles');
        const response = await GET(req);
        const json = await response.json();

        // Verify that from was called with 'profiles' (main query)
        expect(mockSupabase.from).toHaveBeenCalledWith('profiles');

        // Verify that select was called first with '*'
        expect(mockSupabase.select).toHaveBeenCalledWith('*');

        // Verify that from was called with 'profiles' first
        expect(mockSupabase.from).toHaveBeenCalledWith('profiles');

        // Verify output format is correctly mapped from aggregated results
        expect(json.results[0]._relations).toBeDefined();
        const relations = json.results[0]._relations;

        expect(relations).toContainEqual({ label: 'Alquileres', count: 2, table: 'reservas_alquiler' });
        expect(relations).toContainEqual({ label: 'Cursos Inscritos', count: 1, table: 'inscripciones' });
        expect(relations).toContainEqual({ label: 'Suscripciones (por Email)', count: 5, table: 'newsletter_subscriptions' });

        // Verify that we queried the related tables
        expect(mockSupabase.from).toHaveBeenCalledWith('reservas_alquiler');
        expect(mockSupabase.from).toHaveBeenCalledWith('inscripciones');
        expect(mockSupabase.from).toHaveBeenCalledWith('mensajes_contacto');
        expect(mockSupabase.from).toHaveBeenCalledWith('newsletter_subscriptions');
    });

    it('should correctly handle tables without relations', async () => {
        const mockData = [{ id: 'res1', estado_entrega: 'pendiente' }];

        mockSupabase.from.mockImplementation((table: string) => {
            if (table === 'reservas_alquiler') {
                mockSupabase.limit.mockResolvedValueOnce({ data: mockData, error: null });
            } else {
                mockSupabase.limit.mockResolvedValueOnce({ data: [], error: null });
            }
            return mockSupabase;
        });

        const req = new Request('http://localhost/api/admin/explorer?q=res1&table=reservas_alquiler');
        const response = await GET(req);
        const json = await response.json();

        expect(mockSupabase.from).toHaveBeenCalledWith('reservas_alquiler');
        expect(json.results[0]._relations).toHaveLength(0);
        // Only 1 main query since no relations configured for reservas_alquiler in RELATIONS map
        expect(mockSupabase.from).toHaveBeenCalledTimes(1);
    });

    it('should search all tables in parallel and perform one query per table', async () => {
        mockSupabase.from.mockImplementation((table: string) => {
            return mockSupabase;
        });

        mockSupabase.limit.mockResolvedValue({ data: [], error: null });
        mockSupabase.in.mockResolvedValue({ data: [], error: null });

        const req = new Request('http://localhost/api/admin/explorer?q=john'); // No table param = search all
        const response = await GET(req);
        const json = await response.json();

        // Should call from once for each table in SEARCHABLE_COLS (6 tables currently)
        expect(mockSupabase.from).toHaveBeenCalledTimes(6);
        expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
        expect(mockSupabase.from).toHaveBeenCalledWith('cursos');
        expect(mockSupabase.from).toHaveBeenCalledWith('embarcaciones');
        expect(mockSupabase.from).toHaveBeenCalledWith('reservas_alquiler');
        expect(mockSupabase.from).toHaveBeenCalledWith('mensajes_contacto');
        expect(mockSupabase.from).toHaveBeenCalledWith('newsletter_subscriptions');

        expect(json.results).toBeDefined();
    });
});
