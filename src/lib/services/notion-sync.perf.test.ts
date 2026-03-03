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
    single: vi.fn(),
};

vi.mock('@/lib/supabase/admin', () => ({
    createAdminClient: vi.fn(() => mockSupabase)
}));

vi.mock('@notionhq/client', () => ({
    Client: vi.fn().mockImplementation(function() {
        return {};
    })
}));

vi.mock('fs', () => ({
    existsSync: vi.fn(() => true),
    readFileSync: vi.fn(() => '{}'),
    default: {
        existsSync: vi.fn(() => true),
        readFileSync: vi.fn(() => '{}')
    }
}));

describe('NotionSyncService N+1 queries', () => {
    let service: NotionSyncService;

    beforeEach(() => {
        vi.clearAllMocks();
        service = new NotionSyncService();
    });

    it('should fetch dashboard stats and count queries', async () => {
        const numRentals = 10;
        const numAuditLogs = 8;

        const rawRentals = Array.from({ length: numRentals }, (_, i) => ({
            id: i,
            monto_total: 100,
            perfil_id: `p${i}`,
            servicio_id: `s${i}`,
            estado_entrega: 'pendiente',
            hora_inicio: '10:00'
        }));

        const rawAuditLogs = Array.from({ length: numAuditLogs }, (_, i) => ({
            action_type: 'UPDATE',
            description: 'test',
            created_at: new Date().toISOString(),
            staff_id: `staff${i}`
        }));

        // Mocking the sequence of calls in fetchDashboardStats
        mockSupabase.from.mockImplementation((table: string) => {
            return {
                select: vi.fn().mockReturnThis(),
                gte: vi.fn().mockResolvedValue({ data: [] }),
                eq: vi.fn().mockReturnThis(),
                in: vi.fn().mockResolvedValue({ data: [] }),
                order: vi.fn().mockReturnThis(),
                limit: vi.fn().mockImplementation(async () => {
                    if (table === 'reservas_alquiler') return { data: rawRentals };
                    if (table === 'audit_logs') return { data: rawAuditLogs };
                    return { data: [] };
                }),
                single: vi.fn().mockResolvedValue({ data: { nombre: 'Test', nombre_es: 'Service' } }),
            } as any;
        });

        // We need to use internal method to avoid full dashboard update which requires Notion mocks
        await (service as any).fetchDashboardStats();

        const profileCalls = mockSupabase.from.mock.calls.filter(call => call[0] === 'profiles').length;
        const serviceCalls = mockSupabase.from.mock.calls.filter(call => call[0] === 'servicios_alquiler').length;

        console.log(`Profile calls: ${profileCalls}`);
        console.log(`Service calls: ${serviceCalls}`);

        // Profiles calls:
        // 1. eq('rol', 'alumno')
        // 2. eq('rol', 'socio')
        // 3. in('rol', ['admin', 'instructor'])
        // 4. audit_logs map (8 logs -> 8 calls)
        // 5. recentRentals map (10 rentals -> 10 calls)
        // Total expected baseline: 3 + 8 + 10 = 21

        // Service calls:
        // 1. recentRentals map (10 rentals -> 10 calls)
        // Total expected baseline: 10
    });
});
