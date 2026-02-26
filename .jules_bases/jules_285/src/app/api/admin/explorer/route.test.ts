
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
        mockSupabase = {
            from: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            or: vi.fn().mockReturnThis(),
            limit: vi.fn().mockImplementation(() => Promise.resolve({ data: [], error: null })),
            eq: vi.fn().mockReturnThis(),
        };
        (createClient as any).mockReturnValue(mockSupabase);
    });

    it('should use resource embedding and avoid N+1 queries for profiles', async () => {
        const mockData = [
            {
                id: 'user1',
                nombre: 'John',
                reservas_alquiler: [{ count: 2 }],
                inscripciones: [{ count: 1 }],
                mensajes_contacto: [{ count: 0 }],
                newsletter_subscriptions: [{ count: 5 }]
            }
        ];

        mockSupabase.limit.mockResolvedValue({ data: mockData, error: null });

        const req = new Request('http://localhost/api/admin/explorer?q=john&table=profiles');
        const response = await GET(req);
        const json = await response.json();

        // Verify that from was called with 'profiles'
        expect(mockSupabase.from).toHaveBeenCalledWith('profiles');

        // Verify that select was called with the optimized embedding string
        const selectCall = mockSupabase.select.mock.calls[0][0];
        expect(selectCall).toContain('reservas_alquiler!perfil_id(count)');
        expect(selectCall).toContain('inscripciones!perfil_id(count)');
        expect(selectCall).toContain('mensajes_contacto!email(count)');
        expect(selectCall).toContain('newsletter_subscriptions!email(count)');

        // Verify output format is correctly mapped from embedded results
        expect(json.results[0]._relations).toHaveLength(3); // 2 rentals + 1 inscripcion + 5 subscriptions (0 messages skipped)
        expect(json.results[0]._relations).toContainEqual({ label: 'Alquileres', count: 2, table: 'reservas_alquiler' });
        expect(json.results[0]._relations).toContainEqual({ label: 'Cursos Inscritos', count: 1, table: 'inscripciones' });
        expect(json.results[0]._relations).toContainEqual({ label: 'Suscripciones (por Email)', count: 5, table: 'newsletter_subscriptions' });

        // CRITICAL: Verify only ONE database chain was executed (No N+1)
        expect(mockSupabase.from).toHaveBeenCalledTimes(1);
    });

    it('should correctly handle tables without relations (like reservas_alquiler)', async () => {
        const mockData = [{ id: 'res1', estado_entrega: 'pendiente' }];
        mockSupabase.limit.mockResolvedValue({ data: mockData, error: null });

        const req = new Request('http://localhost/api/admin/explorer?q=res1&table=reservas_alquiler');
        const response = await GET(req);
        const json = await response.json();

        expect(mockSupabase.from).toHaveBeenCalledWith('reservas_alquiler');
        expect(mockSupabase.select).toHaveBeenCalledWith('*');
        expect(json.results[0]._relations).toHaveLength(0);
        expect(mockSupabase.from).toHaveBeenCalledTimes(1);
    });

    it('should search all tables and perform one query per table', async () => {
        mockSupabase.limit.mockResolvedValue({ data: [], error: null });

        const req = new Request('http://localhost/api/admin/explorer?q=test&table=all');
        await GET(req);

        // Should call from once for each table in tablesToSearch:
        // ['profiles', 'cursos', 'embarcaciones', 'reservas_alquiler']
        expect(mockSupabase.from).toHaveBeenCalledTimes(4);
    });
});
