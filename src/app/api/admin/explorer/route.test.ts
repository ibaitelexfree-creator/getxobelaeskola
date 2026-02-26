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

    it('should use manual batching to avoid N+1 queries for profiles', async () => {
        const mockData = [
            {
                id: 'user1',
                nombre: 'John',
                email: 'john@example.com' // Email needed for some relations
            }
        ];

        // Setup mock responses based on table
        const mockSelect = vi.fn().mockReturnThis();
        const mockOr = vi.fn().mockReturnThis();
        const mockLimit = vi.fn().mockResolvedValue({ data: mockData, error: null });

        // Mock for relation queries
        const mockRelationIn = vi.fn();

        mockSupabase.from.mockImplementation((table: string) => {
            if (table === 'profiles') {
                return {
                    select: mockSelect,
                    or: mockOr,
                    limit: mockLimit
                };
            }
            if (table === 'reservas_alquiler') {
                return {
                    select: vi.fn().mockReturnThis(),
                    in: mockRelationIn.mockResolvedValueOnce({ data: [{ perfil_id: 'user1' }, { perfil_id: 'user1' }], error: null })
                };
            }
            if (table === 'inscripciones') {
                return {
                    select: vi.fn().mockReturnThis(),
                    in: mockRelationIn.mockResolvedValueOnce({ data: [{ perfil_id: 'user1' }], error: null })
                };
            }
            if (table === 'mensajes_contacto') {
                return {
                    select: vi.fn().mockReturnThis(),
                    in: mockRelationIn.mockResolvedValueOnce({ data: [], error: null })
                };
            }
            if (table === 'newsletter_subscriptions') {
                return {
                    select: vi.fn().mockReturnThis(),
                    in: mockRelationIn.mockResolvedValueOnce({
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

        // Verify that select was called with '*'
        const selectCall = mockSelect.mock.calls[0][0];
        expect(selectCall).toBe('*');

        // Verify output format is correctly aggregated
        expect(json.results[0]._relations).toHaveLength(3); // 2 rentals + 1 inscripcion + 5 subscriptions (0 messages skipped)
        expect(json.results[0]._relations).toContainEqual({ label: 'Alquileres', count: 2, table: 'reservas_alquiler' });
        expect(json.results[0]._relations).toContainEqual({ label: 'Cursos Inscritos', count: 1, table: 'inscripciones' });
        expect(json.results[0]._relations).toContainEqual({ label: 'Suscripciones (por Email)', count: 5, table: 'newsletter_subscriptions' });

        // Verify total queries: 1 (main) + 4 (relations) = 5
        expect(mockSupabase.from).toHaveBeenCalledTimes(5);
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
        const mockLimit = vi.fn().mockResolvedValue({ data: [], error: null });

        mockSupabase.from.mockImplementation((table: string) => {
            if (table === 'profiles') {
                return {
                    select: vi.fn().mockReturnThis(),
                    or: vi.fn().mockReturnThis(),
                    limit: mockLimit
                };
            }
            if (table === 'reservas_alquiler') {
                return {
                    select: vi.fn().mockReturnThis(),
                    in: vi.fn().mockResolvedValue({
                        data: null,
                        error: { message: 'DB Error' }
                    }),
                    or: vi.fn().mockReturnThis(),
                    limit: mockLimit
                };
            }
            // Other relations succeed
            return {
                select: vi.fn().mockReturnThis(),
                or: vi.fn().mockReturnThis(),
                limit: mockLimit,
                in: vi.fn().mockResolvedValue({ data: [], error: null })
            };
        });

        // Trigger a global search (no table specified)
        const req = new Request('http://localhost/api/admin/explorer?q=anything');
        const response = await GET(req);

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
