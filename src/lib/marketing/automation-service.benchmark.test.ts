import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processMarketingAutomations } from './automation-service';

// Mock Dependencies
const { mockSupabase, mockResend, mockStripe } = vi.hoisted(() => {
    const mockSupabase = {
        from: vi.fn(),
        auth: {
            admin: {
                getUserById: vi.fn(),
            },
        },
    };

    const mockResend = {
        emails: {
            send: vi.fn(),
        },
    };

    const mockStripe = {
        promotionCodes: {
            create: vi.fn(),
        },
    };

    return { mockSupabase, mockResend, mockStripe };
});

vi.mock('../supabase/admin', () => ({
    createAdminClient: () => mockSupabase,
}));

vi.mock('../resend', () => ({
    resend: mockResend,
    DEFAULT_FROM_EMAIL: 'test@example.com',
}));

vi.mock('../stripe', () => ({
    stripe: mockStripe,
}));

describe('processMarketingAutomations Benchmark', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const createQueryBuilder = (config: any = {}) => {
        const builder: any = {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            lte: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn(),
            insert: vi.fn().mockResolvedValue({ error: null }),
        };

        builder.then = (resolve: any) => {
            if (config.error) {
                resolve({ data: null, error: config.error });
            } else if (config.count !== undefined) {
                resolve({ count: config.count, error: null });
            } else {
                resolve({ data: config.data || [], error: null });
            }
        };

        builder.maybeSingle.mockImplementation(() => {
            return Promise.resolve({ data: config.singleData || null, error: null });
        });

        return builder;
    };

    it('measures database round-trips for 10 candidates', async () => {
        const candidateCount = 10;
        const mockCampaign = {
            id: 'camp_1',
            nombre: 'Benchmark Campaign',
            curso_trigger_id: 'trigger_1',
            curso_objetivo_id: 'target_1',
            dias_espera: 30,
            activo: true,
            trigger_course: { nombre_es: 'Trigger' },
            target_course: { nombre_es: 'Target', slug: 'target' },
        };

        const mockInscriptions = Array.from({ length: candidateCount }, (_, i) => ({
            perfil_id: `user_${i}`,
            profiles: { nombre: `User ${i}`, email: `user_${i}@example.com` },
        }));

        mockSupabase.from.mockImplementation((table: string) => {
            if (table === 'marketing_campaigns') {
                return createQueryBuilder({ data: [mockCampaign] });
            }
            if (table === 'inscripciones') {
                const builder: any = {
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnThis(),
                    lte: vi.fn().mockReturnThis(),
                    in: vi.fn().mockReturnThis(),
                };
                builder.then = (resolve: any) => {
                    if (builder.lte.mock.calls.length > 0) {
                        resolve({ data: mockInscriptions, error: null });
                    } else if (builder.in.mock.calls.length > 0) {
                        // Batch check bought target course
                        resolve({ data: [], error: null });
                    } else {
                        // Sequential check (baseline)
                        resolve({ count: 0, error: null });
                    }
                };
                return builder;
            }
            if (table === 'marketing_history') {
                const builder: any = {
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnThis(),
                    in: vi.fn().mockReturnThis(),
                    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
                    insert: vi.fn().mockResolvedValue({ error: null }),
                };
                builder.then = (resolve: any) => {
                    resolve({ data: [], error: null });
                };
                return builder;
            }
            return createQueryBuilder();
        });

        mockSupabase.auth.admin.getUserById.mockImplementation((id: string) =>
            Promise.resolve({ data: { user: { id, email: `${id}@example.com` } }, error: null })
        );

        mockResend.emails.send.mockResolvedValue({ id: 'email_id' });

        const startTime = performance.now();
        await processMarketingAutomations();
        const endTime = performance.now();

        const fromCalls = mockSupabase.from.mock.calls.length;
        const authCalls = mockSupabase.auth.admin.getUserById.mock.calls.length;
        const totalRoundTrips = fromCalls + authCalls;

        console.log(`--- Benchmark Results for ${candidateCount} candidates ---`);
        console.log(`Total Supabase .from() calls: ${fromCalls}`);
        console.log(`Total Auth API calls: ${authCalls}`);
        console.log(`Total Round-trips: ${totalRoundTrips}`);
        console.log(`Execution time: ${(endTime - startTime).toFixed(2)}ms`);
        console.log(`---------------------------------------------------------`);

        // Baseline expectations:
        // 1 for campaigns
        // 1 for trigger inscriptions
        // For each candidate:
        //   1 for target inscription check
        //   1 for history check
        //   1 for auth getUserById
        //   1 for history insert
        // Total = 2 + 10 * 4 = 42

        // Note: Stripe is skipped because we didn't mock it to have stripe_coupon_id in campaign
    });
});
