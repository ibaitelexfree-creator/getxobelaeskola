import { vi, describe, it, expect, beforeEach } from 'vitest';
import { NotionSyncService } from './notion-sync';

// Mocks
const mockSupabase = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: {}, error: null }),
};

vi.mock('@/lib/supabase/admin', () => ({
    createAdminClient: vi.fn(() => mockSupabase)
}));

vi.mock('@notionhq/client', () => ({
    Client: class {
        constructor() {
            return {
                databases: { query: vi.fn() },
                pages: { create: vi.fn(), update: vi.fn() },
                blocks: {
                    children: {
                        list: vi.fn().mockResolvedValue({ results: [] }),
                        append: vi.fn(),
                        delete: vi.fn()
                    },
                    delete: vi.fn()
                }
            };
        }
    }
}));

vi.mock('fs', () => ({
    existsSync: vi.fn(() => true),
    readFileSync: vi.fn(() => '{}'),
    default: { existsSync: vi.fn(() => true), readFileSync: vi.fn(() => '{}') }
}));

describe('NotionSyncService Performance Optimization', () => {
    let service: NotionSyncService;

    beforeEach(() => {
        vi.clearAllMocks();
        service = new NotionSyncService();
    });

    it('should verify reduced Supabase calls in fetchDashboardStats', async () => {
        // Setup mock data for 8 audit logs and 10 rentals
        const mockAuditLogs = Array.from({ length: 8 }, (_, i) => ({
            action_type: 'test',
            description: 'test description',
            created_at: new Date().toISOString(),
            staff_id: `user-${i}`
        }));

        const mockRentals = Array.from({ length: 10 }, (_, i) => ({
            id: i,
            monto_total: 100,
            perfil_id: `profile-${i}`,
            servicio_id: `service-${i}`,
            estado_entrega: 'pendiente',
            fecha_reserva: '2024-01-01',
            hora_inicio: '10:00'
        }));

        mockSupabase.from.mockImplementation((table) => {
            const chain = {
                select: vi.fn().mockReturnThis(),
                gte: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                in: vi.fn().mockReturnThis(),
                order: vi.fn().mockReturnThis(),
                limit: vi.fn().mockReturnThis(),
                single: vi.fn(),
                then: (resolve) => {
                    if (table === 'audit_logs') resolve({ data: mockAuditLogs });
                    else if (table === 'reservas_alquiler') resolve({ data: mockRentals });
                    else resolve({ data: [] });
                }
            };
            chain.single.mockResolvedValue({ data: { nombre: 'Test', nombre_es: 'Test Service' } });
            return chain as any;
        });

        await service.updateDashboard();

        const profileCalls = mockSupabase.from.mock.calls.filter(call => call[0] === 'profiles').length;
        const serviceCalls = mockSupabase.from.mock.calls.filter(call => call[0] === 'servicios_alquiler').length;

        console.log(`Optimized Supabase Profiles calls: ${profileCalls}`);
        console.log(`Optimized Supabase Services calls: ${serviceCalls}`);
        console.log(`Total optimized mapping calls: ${profileCalls + serviceCalls}`);

        // Baseline was 31. Optimized should be 6.
        expect(profileCalls).toBe(5);
        expect(serviceCalls).toBe(1);
        expect(profileCalls + serviceCalls).toBeLessThan(10);
    });
});
