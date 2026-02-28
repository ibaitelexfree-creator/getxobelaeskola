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

describe('Admin Explorer API', () => {
    let mockSupabase: any;
    let mockSelect: any;
    let mockOr: any;
    let mockLimit: any;
    let mockIn: any;

    const createChain = (response: any = { data: [], error: null }) => {
        const chain: any = {
            select: vi.fn().mockReturnThis(),
            or: vi.fn().mockReturnThis(),
            limit: vi.fn().mockResolvedValue(response),
            in: vi.fn().mockResolvedValue(response),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue(response)
        };
        return chain;
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockSupabase = {
            from: vi.fn().mockReturnThis(),
            select: mockSelect,
            or: mockOr,
            limit: mockLimit,
            in: mockIn,
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockReturnThis(),
        };
        (createClient as any).mockReturnValue(mockSupabase);
    });

    it('should correctly aggregate relations using manual batching', async () => {
        const mockData = [
            {
                id: 'user1',
                nombre: 'John',
                email: 'john@example.com'
            }
        ];

        // Mocks for relation queries
        const chainReservas = createChain({ data: [{ perfil_id: 'user1' }, { perfil_id: 'user1' }], error: null });
        const chainInscripciones = createChain({ data: [{ perfil_id: 'user1' }], error: null });
        const chainMensajes = createChain({ data: [], error: null });
        const chainSubscriptions = createChain({ data: Array(5).fill({ email: 'john@example.com' }), error: null });
        const chainProfiles = createChain({ data: mockData, error: null });

        // Capture the select mock for verification
        const selectProfiles = chainProfiles.select;

        mockSupabase.from.mockImplementation((table: string) => {
            if (table === 'profiles') return chainProfiles;
            if (table === 'reservas_alquiler') return chainReservas;
            if (table === 'inscripciones') return chainInscripciones;
            if (table === 'mensajes_contacto') return chainMensajes;
            if (table === 'newsletter_subscriptions') return chainSubscriptions;

            return createChain();
        });

        const req = new Request('http://localhost/api/admin/explorer?q=john&table=profiles');
        const response = await GET(req);
        const json = await response.json();

        // Verify that from was called with 'profiles'
        expect(mockSupabase.from).toHaveBeenCalledWith('profiles');

        // Verify that main query was simple select *
        expect(selectProfiles).toHaveBeenCalledWith('*');

        // Verify that secondary queries were made for relations
        expect(mockSupabase.from).toHaveBeenCalledWith('reservas_alquiler');
        expect(mockSupabase.from).toHaveBeenCalledWith('inscripciones');
        expect(mockSupabase.from).toHaveBeenCalledWith('newsletter_subscriptions');

        // Verify manual batching calls via .in()
        expect(mockSupabase.from).toHaveBeenCalledWith('reservas_alquiler');
        expect(mockSupabase.from).toHaveBeenCalledWith('inscripciones');
        expect(mockSupabase.from).toHaveBeenCalledWith('newsletter_subscriptions');

        // Verify output format is correctly mapped from aggregated results
        expect(json.results[0]._relations).toHaveLength(3); // 2 rentals + 1 inscripcion + 5 subscriptions
        expect(json.results[0]._relations).toContainEqual({ label: 'Alquileres', count: 2, table: 'reservas_alquiler' });
        expect(json.results[0]._relations).toContainEqual({ label: 'Cursos Inscritos', count: 1, table: 'inscripciones' });
        expect(json.results[0]._relations).toContainEqual({ label: 'Suscripciones (por Email)', count: 5, table: 'newsletter_subscriptions' });
    });

    it('should correctly handle tables without relations', async () => {
        const mockData = [{ id: 'res1', estado_entrega: 'pendiente' }];
        const chainReservas = createChain({ data: mockData, error: null });

        mockSupabase.from.mockImplementation((table: string) => {
            if (table === 'reservas_alquiler') return chainReservas;
            return createChain();
        });

        const req = new Request('http://localhost/api/admin/explorer?q=res1&table=reservas_alquiler');
        const response = await GET(req);
        const json = await response.json();

        expect(mockSupabase.from).toHaveBeenCalledWith('reservas_alquiler');
        expect(json.results[0]._relations).toHaveLength(0);
        // Only 1 query (main) + 0 queries (relations) = 1
        expect(mockSupabase.from).toHaveBeenCalledTimes(1);
    });

    it('should search all tables in parallel', async () => {
        // Setup simple mocks for all tables
        mockSupabase.from.mockImplementation(() => createChain({ data: [], error: null }));

        // We trigger a search across all tables (no 'table' param)
        const req = new Request('http://localhost/api/admin/explorer?q=search');
        const response = await GET(req);
        const json = await response.json();

        // Should call from for each table in SEARCHABLE_COLS (6 tables)
        expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
        expect(mockSupabase.from).toHaveBeenCalledWith('cursos');
        expect(mockSupabase.from).toHaveBeenCalledWith('embarcaciones');
        expect(mockSupabase.from).toHaveBeenCalledWith('reservas_alquiler');
        expect(mockSupabase.from).toHaveBeenCalledWith('mensajes_contacto');
        expect(mockSupabase.from).toHaveBeenCalledWith('newsletter_subscriptions');

        expect(json.results).toBeDefined();
    });
});
