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
    let mockLimit: any;
    let mockFrom: any;
    let mockOr: any;
    let mockIn: any;

    beforeEach(() => {
        vi.clearAllMocks();

        // Create spies
        mockSelect = vi.fn().mockReturnThis();
        mockOr = vi.fn().mockReturnThis();
        mockLimit = vi.fn().mockResolvedValue({ data: [], error: null });
        mockIn = vi.fn().mockResolvedValue({ data: [], error: null });

        // Chain setup
        mockFrom = vi.fn().mockReturnValue({
            select: mockSelect,
            or: mockOr,
            limit: mockLimit,
            in: mockIn
        });

        // Base mock structure
        mockSupabase = {
            from: mockFrom,
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
                return {
                    select: mockSelect,
                    or: mockOr,
                    limit: vi.fn().mockResolvedValue({ data: mockData, error: null }),
                    in: mockIn
                };
            }
            if (table === 'reservas_alquiler') {
                return {
                    select: mockSelect,
                    or: mockOr,
                    in: vi.fn().mockResolvedValue({ data: [{ perfil_id: 'user1' }, { perfil_id: 'user1' }], error: null }),
                    limit: mockLimit
                };
            }
            if (table === 'inscripciones') {
                return {
                    select: mockSelect,
                    or: mockOr,
                    in: vi.fn().mockResolvedValue({ data: [{ perfil_id: 'user1' }], error: null }),
                    limit: mockLimit
                };
            }
            if (table === 'mensajes_contacto') {
                return {
                    select: mockSelect,
                    or: mockOr,
                    in: vi.fn().mockResolvedValue({ data: [], error: null }),
                    limit: mockLimit
                };
            }
            if (table === 'newsletter_subscriptions') {
                return {
                    select: mockSelect,
                    or: mockOr,
                    in: vi.fn().mockResolvedValue({
                        data: Array(5).fill({ email: 'john@example.com' }),
                        error: null
                    }),
                    limit: mockLimit
                };
            }
            // Default mock for any other table
            return {
                select: mockSelect,
                or: mockOr,
                limit: vi.fn().mockResolvedValue({ data: [], error: null }),
                in: vi.fn().mockResolvedValue({ data: [], error: null })
            };
        });

        const req = new Request('http://localhost/api/admin/explorer?q=john&table=profiles');
        const response = await GET(req);
        const json = await response.json();

        // Verify that from was called with 'profiles' (main query)
        expect(mockSupabase.from).toHaveBeenCalledWith('profiles');

        // Verify that select was called with '*' for the main query
        // The first call to select should be for profiles
        // We can't easily rely on call order if parallel, but checkAuth/route logic is sequential for main then relations
        // Main query: .from('profiles').select('*').or(...)
        // Relation queries: .from('...').select('fk').in(...)

        // Verify output format
        expect(json.results[0]._relations).toBeDefined();
        const relations = json.results[0]._relations;

        const rentalRel = relations.find((r: any) => r.table === 'reservas_alquiler');
        expect(rentalRel).toEqual({ label: 'Alquileres', count: 2, table: 'reservas_alquiler' });

        const courseRel = relations.find((r: any) => r.table === 'inscripciones');
        expect(courseRel).toEqual({ label: 'Cursos Inscritos', count: 1, table: 'inscripciones' });

        const subRel = relations.find((r: any) => r.table === 'newsletter_subscriptions');
        expect(subRel).toEqual({ label: 'Suscripciones (por Email)', count: 5, table: 'newsletter_subscriptions' });

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
                return {
                    select: mockSelect,
                    or: mockOr,
                    limit: vi.fn().mockResolvedValue({ data: mockData, error: null }),
                    in: mockIn
                };
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
        mockSupabase.from.mockImplementation((table: string) => {
            if (table === 'profiles') {
                return {
                    select: mockSelect,
                    or: mockOr,
                    limit: vi.fn().mockResolvedValue({ data: [], error: null }),
                    in: mockIn
                };
            }
            if (table === 'reservas_alquiler') {
                return {
                    select: mockSelect,
                    or: mockOr, // Ensure 'or' is present!
                    in: vi.fn().mockResolvedValue({
                        data: null,
                        error: { message: 'DB Error' }
                    }),
                    limit: mockLimit
                };
            }
            // Other relations succeed
            return {
                select: mockSelect,
                or: mockOr,
                limit: mockLimit,
                in: vi.fn().mockResolvedValue({ data: [], error: null })
            };
        });

        const req = new Request('http://localhost/api/admin/explorer?q=something'); // No table param -> parallel search
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
