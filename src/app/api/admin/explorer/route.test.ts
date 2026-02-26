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
        // Setup default mock structure for chained calls
        const mockLimit = vi.fn().mockResolvedValue({ data: [], error: null });
        const mockOr = vi.fn().mockReturnValue({ limit: mockLimit });
        const mockSelect = vi.fn().mockReturnValue({ or: mockOr, in: vi.fn().mockResolvedValue({ data: [], error: null }) });
        const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });

        mockSupabase = {
            from: mockFrom,
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

        // Specific mock implementations per table
        mockSupabase.from.mockImplementation((table: string) => {
            const mockSelect = vi.fn();
            if (table === 'profiles') {
                const mockLimit = vi.fn().mockResolvedValue({ data: mockData, error: null });
                const mockOr = vi.fn().mockReturnValue({ limit: mockLimit });
                mockSelect.mockReturnValue({ or: mockOr });
                return { select: mockSelect };
            }
            if (table === 'reservas_alquiler') {
                const mockIn = vi.fn().mockResolvedValue({ data: [{ perfil_id: 'user1' }, { perfil_id: 'user1' }], error: null });
                mockSelect.mockReturnValue({ in: mockIn });
                return { select: mockSelect };
            }
            if (table === 'inscripciones') {
                const mockIn = vi.fn().mockResolvedValue({ data: [{ perfil_id: 'user1' }], error: null });
                mockSelect.mockReturnValue({ in: mockIn });
                return { select: mockSelect };
            }
            if (table === 'mensajes_contacto') {
                const mockIn = vi.fn().mockResolvedValue({ data: [], error: null });
                mockSelect.mockReturnValue({ in: mockIn });
                return { select: mockSelect };
            }
            if (table === 'newsletter_subscriptions') {
                const mockIn = vi.fn().mockResolvedValue({
                    data: Array(5).fill({ email: 'john@example.com' }),
                    error: null
                });
                mockSelect.mockReturnValue({ in: mockIn });
                return { select: mockSelect };
            }
            // Default fallback
            const mockIn = vi.fn().mockResolvedValue({ data: [], error: null });
            mockSelect.mockReturnValue({ in: mockIn, or: vi.fn().mockReturnValue({ limit: vi.fn().mockResolvedValue({ data: [], error: null }) }) });
            return { select: mockSelect };
        });

        const req = new Request('http://localhost/api/admin/explorer?q=john&table=profiles');
        const response = await GET(req);
        const json = await response.json();

        // Verify that from was called with 'profiles'
        expect(mockSupabase.from).toHaveBeenCalledWith('profiles');

        // Access the specific mock function for 'profiles' to check calls
        const profilesFromCall = mockSupabase.from.mock.calls.find((call: any[]) => call[0] === 'profiles');
        // We can't easily access the inner mock created inside implementation unless we store it or inspect the result
        // Instead, rely on the fact that the result of the call *is* the object containing the mock
        const profilesQueryBuilder = mockSupabase.from.results.find((res: any) => res.value?.select && res.type === 'return')?.value;
        const selectCall = profilesQueryBuilder.select.mock.calls[0][0];

        expect(selectCall).toContain('count_reservas_alquiler_perfil_id:reservas_alquiler!perfil_id(count)');
        expect(selectCall).toContain('count_inscripciones_perfil_id:inscripciones!perfil_id(count)');
        expect(selectCall).toContain('count_mensajes_contacto_email:mensajes_contacto!email(count)');
        expect(selectCall).toContain('count_newsletter_subscriptions_email:newsletter_subscriptions!email(count)');

        // Verify output format
        expect(json.results[0]._relations).toHaveLength(3);
        expect(json.results[0]._relations).toContainEqual({ label: 'Alquileres', count: 2, table: 'reservas_alquiler' });
        expect(json.results[0]._relations).toContainEqual({ label: 'Cursos Inscritos', count: 1, table: 'inscripciones' });
        expect(json.results[0]._relations).toContainEqual({ label: 'Suscripciones (por Email)', count: 5, table: 'newsletter_subscriptions' });
    });

    it('should correctly handle tables without relations', async () => {
        const mockData = [{ id: 'res1', estado_entrega: 'pendiente' }];

        mockSupabase.from.mockImplementation((table: string) => {
            const mockSelect = vi.fn();
            if (table === 'reservas_alquiler') {
                const mockLimit = vi.fn().mockResolvedValue({ data: mockData, error: null });
                const mockOr = vi.fn().mockReturnValue({ limit: mockLimit });
                mockSelect.mockReturnValue({ or: mockOr, in: vi.fn().mockResolvedValue({ data: [], error: null }) });
                return { select: mockSelect };
            }
            // Default
            mockSelect.mockReturnValue({ or: vi.fn().mockReturnValue({ limit: vi.fn().mockResolvedValue({ data: [], error: null }) }), in: vi.fn().mockResolvedValue({ data: [], error: null }) });
            return { select: mockSelect };
        });

        const req = new Request('http://localhost/api/admin/explorer?q=res1&table=reservas_alquiler');
        const response = await GET(req);
        const json = await response.json();

        expect(mockSupabase.from).toHaveBeenCalledWith('reservas_alquiler');
        expect(json.results[0]._relations).toHaveLength(0);
        // Ensure only relevant queries were made.
        // Note: The implementation might make extra calls if parallel searching is triggered when no table is specified,
        // but here ?table=reservas_alquiler is explicit.
        expect(mockSupabase.from).toHaveBeenCalledTimes(1);
    });

    it('should search all tables in parallel and perform one query per table', async () => {
        // Setup global search (no table param)
        const req = new Request('http://localhost/api/admin/explorer?q=test');

        // Ensure mock returns valid chain for all tables
        mockSupabase.from.mockImplementation(() => {
            const mockLimit = vi.fn().mockResolvedValue({ data: [], error: null });
            const mockOr = vi.fn().mockReturnValue({ limit: mockLimit });
            const mockSelect = vi.fn().mockReturnValue({ or: mockOr });
            return { select: mockSelect };
        });

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
