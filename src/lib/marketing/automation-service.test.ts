import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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

describe('processMarketingAutomations', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // Helper to create a chainable query builder
    const createQueryBuilder = (config: any = {}) => {
        const builder: any = {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            lte: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn(),
            insert: vi.fn().mockResolvedValue({ error: null }),
        };

        // Handle await directly on builder (for list results)
        builder.then = (resolve: any, reject: any) => {
            if (config.error) {
                resolve({ data: null, error: config.error });
            } else if (config.count !== undefined) {
                resolve({ count: config.count, error: null });
            } else {
                resolve({ data: config.data || [], error: null });
            }
        };

        // Handle await on maybeSingle (for single results)
        builder.maybeSingle.mockImplementation(() => {
            if (config.singleError) {
                return Promise.resolve({ data: null, error: config.singleError });
            }
            return Promise.resolve({ data: config.singleData || null, error: null });
        });

        return builder;
    };

    it('should process active campaigns successfully (Happy Path)', async () => {
        // Setup Mocks
        const mockCampaign = {
            id: 'camp_1',
            nombre: 'Test Campaign',
            curso_trigger_id: 'trigger_1',
            curso_objetivo_id: 'target_1',
            dias_espera: 30,
            activo: true,
            trigger_course: { nombre_es: 'Trigger Course' },
            target_course: { nombre_es: 'Target Course', slug: 'target-course' },
        };

        const mockUser = {
            id: 'user_1',
            email: 'user@example.com',
        };

        const mockInscription = {
            perfil_id: 'user_1',
            created_at: '2023-01-01T00:00:00Z',
            profiles: { nombre: 'Test User' },
        };

        // Mock Supabase Calls
        mockSupabase.from.mockImplementation((table: string) => {
            if (table === 'marketing_campaigns') {
                return createQueryBuilder({ data: [mockCampaign] });
            }
            if (table === 'inscripciones') {
                // We need to distinguish between trigger check (lte) and target check (eq only)
                // Since the builder is created fresh each time, we can't inspect previous calls easily
                // UNLESS we return a proxy or inspect the stack.
                // EASIER: Return a builder that captures calls and decides on resolve.

                const builder: any = {
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnThis(),
                    lte: vi.fn().mockReturnThis(),
                };

                builder.then = (resolve: any) => {
                    // Check if lte was called (Trigger Query)
                    if (builder.lte.mock.calls.length > 0) {
                        resolve({ data: [mockInscription], error: null });
                    } else {
                        // Target Query (Check if bought)
                        resolve({ count: 0, error: null });
                    }
                };
                return builder;
            }
            if (table === 'marketing_history') {
                const builder: any = {
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnThis(),
                    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }), // No history
                    insert: vi.fn().mockResolvedValue({ error: null }),
                };
                return builder;
            }
            return createQueryBuilder();
        });

        mockSupabase.auth.admin.getUserById.mockResolvedValue({ data: { user: mockUser }, error: null });
        mockResend.emails.send.mockResolvedValue({ id: 'email_1' });

        // Run
        const result = await processMarketingAutomations();

        // Assertions
        expect(result.success).toBe(true);
        expect(result.totalSent).toBe(1);

        // Verify Resend Call
        expect(mockResend.emails.send).toHaveBeenCalledWith(expect.objectContaining({
            to: 'user@example.com',
            subject: expect.stringContaining('Target Course'),
        }));

        // Verify History Insert
        expect(mockSupabase.from).toHaveBeenCalledWith('marketing_history');
        // We can't easily check the insert call on a dynamic mock unless we capture it.
        // But since we mocked 'insert' on the history builder, it should have been called.
    });

    it('should skip if user bought target course', async () => {
        const mockCampaign = {
            id: 'camp_1',
            curso_trigger_id: 'trigger_1',
            curso_objetivo_id: 'target_1',
            activo: true,
        };

        mockSupabase.from.mockImplementation((table: string) => {
            if (table === 'marketing_campaigns') return createQueryBuilder({ data: [mockCampaign] });
            if (table === 'inscripciones') {
                const builder: any = {
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnThis(),
                    lte: vi.fn().mockReturnThis(),
                };
                builder.then = (resolve: any) => {
                    if (builder.lte.mock.calls.length > 0) {
                        resolve({ data: [{ perfil_id: 'user_1' }], error: null });
                    } else {
                        // Target Query - User has bought it!
                        resolve({ count: 1, error: null });
                    }
                };
                return builder;
            }
            return createQueryBuilder();
        });

        const result = await processMarketingAutomations();
        expect(result.success).toBe(true);
        expect(result.totalSent).toBe(0);
        expect(mockResend.emails.send).not.toHaveBeenCalled();
    });

    it('should skip if campaign already sent', async () => {
        const mockCampaign = { id: 'camp_1', curso_trigger_id: 'trigger_1', curso_objetivo_id: 'target_1', activo: true };

        mockSupabase.from.mockImplementation((table: string) => {
            if (table === 'marketing_campaigns') return createQueryBuilder({ data: [mockCampaign] });
            if (table === 'inscripciones') {
                const builder: any = {
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnThis(),
                    lte: vi.fn().mockReturnThis(),
                };
                builder.then = (resolve: any) => {
                    if (builder.lte.mock.calls.length > 0) {
                        resolve({ data: [{ perfil_id: 'user_1' }], error: null });
                    } else {
                        resolve({ count: 0, error: null });
                    }
                };
                return builder;
            }
            if (table === 'marketing_history') {
                return {
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnThis(),
                    maybeSingle: vi.fn().mockResolvedValue({ data: { id: 'hist_1' }, error: null }), // History exists
                } as any;
            }
            return createQueryBuilder();
        });

        const result = await processMarketingAutomations();
        expect(result.totalSent).toBe(0);
        expect(mockResend.emails.send).not.toHaveBeenCalled();
    });

    it('should fallback to static code on Stripe error', async () => {
        const mockCampaign = {
            id: 'camp_1',
            activo: true,
            stripe_coupon_id: 'coupon_1',
            cupon_codigo: 'STATIC10', // Fallback
            curso_trigger_id: 'trigger_1',
            curso_objetivo_id: 'target_1',
        };

        mockSupabase.from.mockImplementation((table: string) => {
            if (table === 'marketing_campaigns') return createQueryBuilder({ data: [mockCampaign] });
            if (table === 'inscripciones') {
                 const builder: any = {
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnThis(),
                    lte: vi.fn().mockReturnThis(),
                };
                builder.then = (resolve: any) => {
                    if (builder.lte.mock.calls.length > 0) resolve({ data: [{ perfil_id: 'user_1' }], error: null });
                    else resolve({ count: 0, error: null });
                };
                return builder;
            }
            if (table === 'marketing_history') {
                return {
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnThis(),
                    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
                    insert: vi.fn().mockResolvedValue({ error: null }),
                } as any;
            }
            return createQueryBuilder();
        });

        mockSupabase.auth.admin.getUserById.mockResolvedValue({ data: { user: { email: 'test@test.com' } }, error: null });
        mockStripe.promotionCodes.create.mockRejectedValue(new Error('Stripe Error'));
        mockResend.emails.send.mockResolvedValue({ id: 'email_1' });

        const result = await processMarketingAutomations();

        expect(result.totalSent).toBe(1);
        // Verify email sent with STATIC10 (fallback)
        const emailHtml = mockResend.emails.send.mock.calls[0][0].html;
        expect(emailHtml).toContain('STATIC10');
    });

    it('should not insert history if email fails', async () => {
        const mockCampaign = { id: 'camp_1', curso_trigger_id: 'trigger_1', curso_objetivo_id: 'target_1', activo: true };

        // Setup successful checks but failing email
        const insertSpy = vi.fn().mockResolvedValue({ error: null });

        mockSupabase.from.mockImplementation((table: string) => {
            if (table === 'marketing_campaigns') return createQueryBuilder({ data: [mockCampaign] });
            if (table === 'inscripciones') {
                 const builder: any = {
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnThis(),
                    lte: vi.fn().mockReturnThis(),
                };
                builder.then = (resolve: any) => {
                    if (builder.lte.mock.calls.length > 0) resolve({ data: [{ perfil_id: 'user_1' }], error: null });
                    else resolve({ count: 0, error: null });
                };
                return builder;
            }
            if (table === 'marketing_history') {
                return {
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnThis(),
                    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
                    insert: insertSpy,
                } as any;
            }
            return createQueryBuilder();
        });

        mockSupabase.auth.admin.getUserById.mockResolvedValue({ data: { user: { email: 'test@test.com' } }, error: null });
        mockResend.emails.send.mockRejectedValue(new Error('Email Error'));

        const result = await processMarketingAutomations();

        expect(result.totalSent).toBe(0);
        expect(insertSpy).not.toHaveBeenCalled();
    });
});
