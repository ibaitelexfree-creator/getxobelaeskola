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

    it('should use batching (Option B) and avoid N+1 queries for profiles', async () => {
        const mockProfiles = [
            { id: 'user1', nombre: 'John', email: 'john@example.com' }
        ];

        // Setup mock responses based on table
        mockSupabase.from.mockImplementation((table: string) => {
            if (table === 'profiles') {
                return {
                    select: vi.fn().mockReturnThis(),
                    or: vi.fn().mockReturnThis(),
                    limit: vi.fn().mockResolvedValue({ data: mockProfiles, error: null })
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

        // Verify relations queries were made (Batching Option B: 1 query per relation type)
        expect(mockSupabase.from).toHaveBeenCalledWith('reservas_alquiler');
        expect(mockSupabase.from).toHaveBeenCalledWith('inscripciones');
        expect(mockSupabase.from).toHaveBeenCalledWith('mensajes_contacto');
        expect(mockSupabase.from).toHaveBeenCalledWith('newsletter_subscriptions');

        // Verify output format
        const rels = json.results[0]._relations;
        expect(rels).toHaveLength(3); // 2 rentals + 1 inscripcion + 5 subscriptions (0 messages skipped)

        const rentalRel = rels.find((r: any) => r.table === 'reservas_alquiler');
        expect(rentalRel).toEqual({ label: 'Alquileres', count: 2, table: 'reservas_alquiler' });

        const subRel = rels.find((r: any) => r.table === 'newsletter_subscriptions');
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

    it('should handle relation query errors gracefully', async () => {
        const mockProfiles = [{ id: 'user1', email: 'john@example.com' }];

        mockSupabase.from.mockImplementation((table: string) => {
            if (table === 'profiles') {
                return {
                    select: vi.fn().mockReturnThis(),
                    or: vi.fn().mockReturnThis(),
                    limit: vi.fn().mockResolvedValue({ data: mockProfiles, error: null })
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

        const req = new Request('http://localhost/api/admin/explorer?q=john&table=profiles');
        const response = await GET(req);
        const json = await response.json();

        // Should return profiles but rentals count should be missing or 0 (skipped)
        // Since we skip relations on error, it won't be in _relations
        const rels = json.results[0]._relations;
        const rentalRel = rels.find((r: any) => r.table === 'reservas_alquiler');
        expect(rentalRel).toBeUndefined();

        // Other relations should still run
        expect(mockSupabase.from).toHaveBeenCalledWith('inscripciones');
    });
});
