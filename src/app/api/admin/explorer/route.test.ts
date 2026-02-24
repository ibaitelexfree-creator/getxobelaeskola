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
    let mockFrom: any;
    let mockSelect: any;
    let mockOr: any;
    let mockLimit: any;
    let mockIn: any;

    beforeEach(() => {
        vi.clearAllMocks();

        mockSelect = vi.fn().mockReturnThis();
        mockOr = vi.fn().mockReturnThis();
        mockLimit = vi.fn().mockReturnThis();
        mockIn = vi.fn().mockReturnThis();

        mockFrom = vi.fn().mockReturnValue({
            select: mockSelect,
            or: mockOr,
            limit: mockLimit,
            in: mockIn
        });

        mockSupabase = {
            from: mockFrom
        };

        (createClient as any).mockResolvedValue(mockSupabase);
    });

    it('should use resource embedding and avoid N+1 queries for profiles', async () => {
        const mockProfiles = [
            {
                id: 'user1',
                nombre: 'John',
                email: 'john@example.com'
            }
        ];

        mockLimit.mockResolvedValue({ data: mockProfiles, error: null });
        mockIn.mockResolvedValue({ data: [], error: null });

        // Customize mockIn for newsletter_subscriptions
        mockFrom.mockImplementation((table: string) => {
            const chain = {
                select: mockSelect,
                or: mockOr,
                limit: mockLimit,
                in: mockIn
            };

            if (table === 'newsletter_subscriptions') {
                mockIn.mockResolvedValueOnce({
                    data: Array(5).fill({ email: 'john@example.com' }),
                    error: null
                });
            } else if (table === 'reservas_alquiler') {
                mockIn.mockResolvedValueOnce({
                    data: [{ perfil_id: 'user1' }, { perfil_id: 'user1' }],
                    error: null
                });
            } else if (table === 'inscripciones') {
                mockIn.mockResolvedValueOnce({
                    data: [{ perfil_id: 'user1' }],
                    error: null
                });
            }
            return chain;
        });

        const req = new Request('http://localhost/api/admin/explorer?q=john&table=profiles');
        const response = await GET(req);
        const json = await response.json();

        // Verify that from was called with 'profiles'
        expect(mockFrom).toHaveBeenCalledWith('profiles');

        // Verify that select was called
        expect(mockSelect).toHaveBeenCalled();

        // Verify output format
        expect(json.results[0]._table).toBe('profiles');
        expect(json.results[0]._relations).toHaveLength(3);
        expect(json.results[0]._relations).toContainEqual({ label: 'Alquileres', count: 2, table: 'reservas_alquiler' });
        expect(json.results[0]._relations).toContainEqual({ label: 'Cursos Inscritos', count: 1, table: 'inscripciones' });
        expect(json.results[0]._relations).toContainEqual({ label: 'Suscripciones (por Email)', count: 5, table: 'newsletter_subscriptions' });

        const rels = json.results[0]._relations;
        const rentalRel = rels.find((r: any) => r.table === 'reservas_alquiler');
        expect(rentalRel).toEqual({ label: 'Alquileres', count: 2, table: 'reservas_alquiler' });

        const subRel = rels.find((r: any) => r.table === 'newsletter_subscriptions');
        expect(subRel).toEqual({ label: 'Suscripciones (por Email)', count: 5, table: 'newsletter_subscriptions' });

        // Total queries: 1 (search) + 4 (relations) = 5
        expect(mockFrom).toHaveBeenCalledTimes(5);
    });

    it('should search all tables in parallel and perform one query per table', async () => {
        mockLimit.mockResolvedValue({ data: [], error: null });
        mockIn.mockResolvedValue({ data: [], error: null });

        const req = new Request('http://localhost/api/admin/explorer?q=test&table=all');
        await GET(req);

        // Should call from once for each table in SEARCHABLE_COLS (6 tables)
        // Note: each table search also triggers relations checks, but here we return empty data so relations are skipped
        expect(mockFrom).toHaveBeenCalledTimes(6);
        expect(mockFrom).toHaveBeenCalledWith('profiles');
        expect(mockFrom).toHaveBeenCalledWith('cursos');
        expect(mockFrom).toHaveBeenCalledWith('embarcaciones');
        expect(mockFrom).toHaveBeenCalledWith('reservas_alquiler');
        expect(mockFrom).toHaveBeenCalledWith('mensajes_contacto');
        expect(mockFrom).toHaveBeenCalledWith('newsletter_subscriptions');
    });
});
