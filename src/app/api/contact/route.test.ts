import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { NextResponse } from 'next/server';
import { logToExternalWebhook } from '@/lib/external-logger';

// Mock dependencies
const mockQueryBuilder = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    insert: vi.fn().mockResolvedValue({ error: null }),
    then: vi.fn(function(resolve) { resolve({ data: [], error: null }); })
};

const mockSupabase = {
    from: vi.fn(() => mockQueryBuilder),
};

vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn(() => mockSupabase),
}));

vi.mock('@/lib/resend', () => ({
    resend: {
        emails: {
            send: vi.fn(() => Promise.resolve({ data: { id: 'email_id' }, error: null })),
        },
    },
    DEFAULT_FROM_EMAIL: 'test@example.com',
}));

vi.mock('@/lib/external-logger', () => ({
    logToExternalWebhook: vi.fn(),
}));

describe('Contact API POST', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset query builder default response
        mockQueryBuilder.then.mockImplementation((resolve) => resolve({ data: [], error: null }));
    });

    it('should return error if fields are missing', async () => {
        const req = new Request('http://localhost/api/contact', {
            method: 'POST',
            body: JSON.stringify({}),
        });
        const res = await POST(req);
        const data = await res.json();
        expect(res.status).toBe(400);
        expect(data.error).toBe('Faltan campos obligatorios');
    });

    it('should process new message correctly', async () => {
        const req = new Request('http://localhost/api/contact', {
            method: 'POST',
            body: JSON.stringify({
                nombre: 'Test',
                email: 'test@example.com',
                asunto: 'Subject',
                mensaje: 'Message',
            }),
        });

        const res = await POST(req);
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data.success).toBe(true);
        expect(logToExternalWebhook).toHaveBeenCalledWith('CONTACT_EMAIL_SENT', expect.anything());
        expect(mockSupabase.from).toHaveBeenCalledWith('mensajes_contacto');
        expect(mockQueryBuilder.insert).toHaveBeenCalled();
    });

    it('should handle duplicates (idempotency)', async () => {
        // Mock duplicate found
        mockQueryBuilder.then.mockImplementation((resolve) => resolve({ data: [{ id: 'existing' }], error: null }));

        const req = new Request('http://localhost/api/contact', {
            method: 'POST',
            body: JSON.stringify({
                nombre: 'Test',
                email: 'test@example.com',
                asunto: 'Subject',
                mensaje: 'Message',
            }),
        });

        const res = await POST(req);
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.message).toContain('cached');

        // Should verify log
        expect(logToExternalWebhook).toHaveBeenCalledWith('CONTACT_DUPLICATE_PREVENTED', expect.anything());

        // Should NOT insert
        expect(mockQueryBuilder.insert).not.toHaveBeenCalled();
    });
});
