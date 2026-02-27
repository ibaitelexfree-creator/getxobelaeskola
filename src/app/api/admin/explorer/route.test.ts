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
        // Base mock structure
        mockSupabase = {
            from: vi.fn(),
        };
        (createClient as any).mockReturnValue(mockSupabase);
    });

    it('should use resource embedding and avoid N+1 queries for profiles', async () => {
        const mockData = [
            {
                id: 'user1',
                nombre: 'John',
                count_reservas_alquiler_perfil_id: [{ count: 2 }],
                count_inscripciones_perfil_id: [{ count: 1 }],
                count_mensajes_contacto_email: [{ count: 0 }],
                count_newsletter_subscriptions_email: [{ count: 5 }]
            }
        ];

        // Setup mock responses based on table
        mockSupabase.from.mockImplementation((table: string) => {
            if (table === 'profiles') {
                return {
                    select: vi.fn().mockReturnThis(),
                    or: vi.fn().mockReturnThis(),
                    limit: vi.fn().mockResolvedValue({ data: mockData, error: null })
                };
            }
            if (table === 'reservas_alquiler') {
                return {
                    select: vi.fn().mockReturnThis(),
                    in: vi.fn().mockResolvedValue({ data: [{ perfil_id: 'user1' }, { perfil_id: 'user1' }], error: null })
                };
            }
            if (table === 'inscripciones') {
                return {
                    select: vi.fn().mockReturnThis(),
                    in: vi.fn().mockResolvedValue({ data: [{ perfil_id: 'user1' }], error: null })
                };
            }
            if (table === 'mensajes_contacto') {
                return {
                    select: vi.fn().mockReturnThis(),
                    in: vi.fn().mockResolvedValue({ data: [], error: null })
                };
            }
            if (table === 'newsletter_subscriptions') {
                return {
                    select: vi.fn().mockReturnThis(),
                    in: vi.fn().mockResolvedValue({
                        data: Array(5).fill({ email: 'john@example.com' }),
                        error: null
                    })
                };
            }
            // Default mock for any other table
            return {
                select: vi.fn().mockReturnThis(),
                or: vi.fn().mockReturnThis(),
                limit: vi.fn().mockResolvedValue({ data: [], error: null }),
                in: vi.fn().mockResolvedValue({ data: [], error: null })
            };
        });

        const req = new Request('http://localhost/api/admin/explorer?q=john&table=profiles');
        const response = await GET(req);
        const json = await response.json();

        // Verify that from was called with 'profiles'
        expect(mockSupabase.from).toHaveBeenCalledWith('profiles');

        // Verify that select was called with the optimized embedding string with aliases
        const selectCall = mockSupabase.select.mock.calls[0][0];
        expect(selectCall).toContain('count_reservas_alquiler_perfil_id:reservas_alquiler!perfil_id(count)');
        expect(selectCall).toContain('count_inscripciones_perfil_id:inscripciones!perfil_id(count)');
        expect(selectCall).toContain('count_mensajes_contacto_email:mensajes_contacto!email(count)');
        expect(selectCall).toContain('count_newsletter_subscriptions_email:newsletter_subscriptions!email(count)');

        // Verify output format is correctly mapped from aliased results
        expect(json.results[0]._relations).toHaveLength(3); // 2 rentals + 1 inscripcion + 5 subscriptions (0 messages skipped)
        expect(json.results[0]._relations).toContainEqual({ label: 'Alquileres', count: 2, table: 'reservas_alquiler' });
        expect(json.results[0]._relations).toContainEqual({ label: 'Cursos Inscritos', count: 1, table: 'inscripciones' });
        expect(json.results[0]._relations).toContainEqual({ label: 'Suscripciones (por Email)', count: 5, table: 'newsletter_subscriptions' });

        const rentalRel = json.results[0]._relations.find((r: any) => r.table === 'reservas_alquiler');
        expect(rentalRel).toEqual({ label: 'Alquileres', count: 2, table: 'reservas_alquiler' });

        const subRel = json.results[0]._relations.find((r: any) => r.table === 'newsletter_subscriptions');
        expect(subRel).toEqual({ label: 'Suscripciones (por Email)', count: 5, table: 'newsletter_subscriptions' });

        // Verify total queries: 1 (main) + 4 (relations) = 5
        expect(mockSupabase.from).toHaveBeenCalledTimes(5);
    });

    it('should correctly handle tables without relations', async () => {
        const mockData = [{ id: 'res1', estado_entrega: 'pendiente' }];

        mockSupabase.from.mockImplementation((table: string) => {
            if (table === 'reservas_alquiler') {
                return {
                    select: vi.fn().mockReturnThis(),
                    or: vi.fn().mockReturnThis(),
                    limit: vi.fn().mockResolvedValue({ data: mockData, error: null }),
                    in: vi.fn().mockResolvedValue({ data: [], error: null })
                };
            }
            return {
                select: vi.fn().mockReturnThis(),
                or: vi.fn().mockReturnThis(),
                limit: vi.fn().mockResolvedValue({ data: [], error: null }),
                in: vi.fn().mockResolvedValue({ data: [], error: null })
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
        // mockSupabase.limit is undefined because the chain is mocked in from().
        // We set up the behavior inside mockImplementation.

        mockSupabase.from.mockImplementation((table: string) => {
            if (table === 'profiles') {
                return {
                    select: vi.fn().mockReturnThis(),
                    or: vi.fn().mockReturnThis(),
                    limit: vi.fn().mockResolvedValue({ data: [], error: null })
                };
            }
            if (table === 'reservas_alquiler') {
                return {
                    select: vi.fn().mockReturnThis(),
                    in: vi.fn().mockResolvedValue({
                        data: null,
                        error: { message: 'DB Error' }
                    })
                };
            }
            // Other relations succeed
            return {
                select: vi.fn().mockReturnThis(),
                in: vi.fn().mockResolvedValue({ data: [], error: null })
            };
        });

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
