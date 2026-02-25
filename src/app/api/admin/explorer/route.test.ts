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
        // Base mock structure that returns 'this' for chaining
        mockSupabase = {
            from: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            or: vi.fn().mockReturnThis(),
            limit: vi.fn().mockImplementation(() => Promise.resolve({ data: [], error: null })),
            eq: vi.fn().mockReturnThis(),
            in: vi.fn().mockImplementation(() => Promise.resolve({ data: [], error: null })),
        };
        (createClient as any).mockReturnValue(mockSupabase);
    });

    it('should use batched queries and avoid N+1 queries for profiles', async () => {
        const mockProfile = {
            id: 'user1',
            nombre: 'John',
            email: 'john@example.com'
        };

        // 1. Base Query Mock
        mockSupabase.limit.mockResolvedValueOnce({ data: [mockProfile], error: null });

        // 2. Relation Queries Mocks (Order matters based on RELATIONS definition)
        // Order in RELATIONS.profiles:
        // 1. reservas_alquiler (fk: perfil_id) -> let's return 2 items
        // 2. inscripciones (fk: perfil_id) -> let's return 1 item
        // 3. mensajes_contacto (fk: email) -> let's return 0 items
        // 4. newsletter_subscriptions (fk: email) -> let's return 5 items

        const mockRentals = [{ perfil_id: 'user1' }, { perfil_id: 'user1' }];
        const mockInscriptions = [{ perfil_id: 'user1' }];
        const mockMessages: any[] = [];
        const mockSubscriptions = Array(5).fill({ email: 'john@example.com' });

        mockSupabase.in
            .mockResolvedValueOnce({ data: mockRentals, error: null })       // Alquileres
            .mockResolvedValueOnce({ data: mockInscriptions, error: null })  // Inscripciones
            .mockResolvedValueOnce({ data: mockMessages, error: null })      // Mensajes
            .mockResolvedValueOnce({ data: mockSubscriptions, error: null }); // Suscripciones

        const req = new Request('http://localhost/api/admin/explorer?q=john&table=profiles');
        const response = await GET(req);
        const json = await response.json();

        // Verify base query
        expect(mockSupabase.from).toHaveBeenNthCalledWith(1, 'profiles');
        expect(mockSupabase.select).toHaveBeenNthCalledWith(1, '*');

        // Verify relation queries (4 relations + 1 base = 5 calls to from/select)
        // Wait, 'from' is called for base + 4 relations.
        expect(mockSupabase.from).toHaveBeenCalledTimes(5);

        // Verify relation queries logic
        // Check 2nd call (Alquileres)
        expect(mockSupabase.from).toHaveBeenNthCalledWith(2, 'reservas_alquiler');
        // select should be called with fk and count options
        expect(mockSupabase.select).toHaveBeenCalledWith('perfil_id', { count: 'exact', head: false });

        // Verify output format is correctly aggregated from batched results
        const result = json.results[0];
        expect(result._relations).toHaveLength(3); // 2 rentals + 1 inscripcion + 5 subscriptions (0 messages skipped)

        const rentals = result._relations.find((r: any) => r.table === 'reservas_alquiler');
        expect(rentals).toEqual({ label: 'Alquileres', count: 2, table: 'reservas_alquiler' });

        const inscrip = result._relations.find((r: any) => r.table === 'inscripciones');
        expect(inscrip).toEqual({ label: 'Cursos Inscritos', count: 1, table: 'inscripciones' });

        const subs = result._relations.find((r: any) => r.table === 'newsletter_subscriptions');
        expect(subs).toEqual({ label: 'Suscripciones (por Email)', count: 5, table: 'newsletter_subscriptions' });
    });

    it('should correctly handle tables without relations (like reservas_alquiler)', async () => {
        const mockData = [{ id: 'res1', estado_entrega: 'pendiente' }];
        mockSupabase.limit.mockResolvedValue({ data: mockData, error: null });

        const req = new Request('http://localhost/api/admin/explorer?q=res1&table=reservas_alquiler');
        const response = await GET(req);
        const json = await response.json();

        expect(mockSupabase.from).toHaveBeenCalledWith('reservas_alquiler');
        expect(mockSupabase.select).toHaveBeenCalledWith('*');
        // Should NOT call any relation queries because none are defined for this table
        expect(mockSupabase.from).toHaveBeenCalledTimes(1);
        expect(json.results[0]._relations).toHaveLength(0);
    });

    it('should search all tables', async () => {
        // Mock empty results for all tables to keep it simple
        mockSupabase.limit.mockResolvedValue({ data: [], error: null });

        const req = new Request('http://localhost/api/admin/explorer?q=test&table=all');
        await GET(req);

        // Should call from once for each table in tablesToSearch:
        // ['profiles', 'cursos', 'embarcaciones', 'reservas_alquiler']
        // Since limit returns [], no relation queries are triggered.
        expect(mockSupabase.from).toHaveBeenCalledTimes(4);
    });
});
