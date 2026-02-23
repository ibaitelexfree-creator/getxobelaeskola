import { vi, describe, it, expect, beforeEach } from 'vitest';
import { POST } from './route';
import { stripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import { resend } from '@/lib/resend';
import { NextResponse } from 'next/server';

// Mock dependencies
vi.mock('@/lib/stripe', () => ({
    stripe: {
        webhooks: {
            constructEvent: vi.fn()
        },
        customers: {
            retrieve: vi.fn()
        }
    }
}));

vi.mock('@/lib/supabase/admin', () => ({
    createAdminClient: vi.fn()
}));

vi.mock('@/lib/resend', () => ({
    resend: {
        emails: {
            send: vi.fn()
        }
    },
    DEFAULT_FROM_EMAIL: 'test@example.com'
}));

vi.mock('next/headers', () => ({
    headers: vi.fn(() => ({
        get: vi.fn(() => 'mock-signature')
    }))
}));

vi.mock('next/server', () => ({
    NextResponse: {
        json: vi.fn((body, init) => ({ body, init }))
    }
}));

describe('Stripe Webhook Handler', () => {
    let mockSupabase: any;

    beforeEach(() => {
        vi.clearAllMocks();

        // Setup Supabase mock
        mockSupabase = {
            from: vi.fn(() => mockSupabase),
            insert: vi.fn(() => mockSupabase),
            select: vi.fn(() => mockSupabase),
            single: vi.fn(() => Promise.resolve({ data: { id: 'log_id' } })),
            maybeSingle: vi.fn(() => Promise.resolve({ data: null })), // No duplicate
            eq: vi.fn(() => mockSupabase),
            update: vi.fn(() => mockSupabase),
        };
        (createAdminClient as any).mockReturnValue(mockSupabase);
    });

    it('should handle payment_intent.payment_failed event', async () => {
        const mockEvent = {
            id: 'evt_123',
            type: 'payment_intent.payment_failed',
            data: {
                object: {
                    id: 'pi_123',
                    object: 'payment_intent',
                    amount: 2000,
                    currency: 'eur',
                    receipt_email: 'customer@example.com',
                    metadata: { locale: 'es' },
                    last_payment_error: { message: 'Card declined' }
                }
            }
        };

        (stripe.webhooks.constructEvent as any).mockReturnValue(mockEvent);

        const request = new Request('http://localhost/api/webhook', {
            method: 'POST',
            body: JSON.stringify(mockEvent)
        });

        await POST(request);

        // Verify audit log created
        expect(mockSupabase.from).toHaveBeenCalledWith('stripe_audit_logs');

        // Verify email sent
        // Using "!" because we know we mocked it
        expect(resend!.emails.send).toHaveBeenCalledWith(expect.objectContaining({
            to: 'customer@example.com',
            subject: expect.stringContaining('Error en el Pago'),
            html: expect.stringContaining('20.00 EUR')
        }));

        // Verify successful response
        expect(NextResponse.json).toHaveBeenCalledWith({ received: true });
    });

    it('should fetch customer email if receipt_email is missing', async () => {
        const mockEvent = {
            id: 'evt_124',
            type: 'payment_intent.payment_failed',
            data: {
                object: {
                    id: 'pi_124',
                    object: 'payment_intent',
                    amount: 5000,
                    currency: 'eur',
                    customer: 'cus_123',
                    // receipt_email missing
                }
            }
        };

        (stripe.webhooks.constructEvent as any).mockReturnValue(mockEvent);
        (stripe.customers.retrieve as any).mockResolvedValue({
            id: 'cus_123',
            object: 'customer',
            email: 'fetched@example.com',
            name: 'Fetched Customer'
        });

        const request = new Request('http://localhost/api/webhook', {
            method: 'POST',
            body: JSON.stringify(mockEvent)
        });

        await POST(request);

        // Verify customer fetched
        expect(stripe.customers.retrieve).toHaveBeenCalledWith('cus_123');

        // Verify email sent to fetched email
        expect(resend!.emails.send).toHaveBeenCalledWith(expect.objectContaining({
            to: 'fetched@example.com'
        }));
    });
});
