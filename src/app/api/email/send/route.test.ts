import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';

const { mockSend } = vi.hoisted(() => ({
    mockSend: vi.fn().mockResolvedValue({ data: { id: 'msg-id' }, error: null })
}));

vi.mock('@/lib/resend', () => ({
    resend: {
        emails: {
            send: mockSend
        }
    },
    DEFAULT_FROM_EMAIL: 'test@example.com'
}));

vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn().mockReturnValue({
        auth: {
            getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null })
        }
    })
}));

describe('Email API Security', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        vi.clearAllMocks();
        process.env = { ...originalEnv };
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    it('should REJECT the hardcoded fallback when INTERNAL_API_SECRET is missing', async () => {
        delete process.env.INTERNAL_API_SECRET;

        const req = new NextRequest('http://localhost/api/email/send', {
            method: 'POST',
            headers: {
                'x-api-key': 'getxo-secret-2024',
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                to: 'user@example.com',
                subject: 'Test',
                text: 'Hello'
            })
        });

        const res = await POST(req as any);
        expect(res.status).toBe(401);
    });

    it('should return 401 if provided apiKey does not match INTERNAL_API_SECRET', async () => {
        process.env.INTERNAL_API_SECRET = 'real-internal-secret';
        const request = new NextRequest('http://localhost/api/email/send', {
            method: 'POST',
            headers: { 'x-api-key': 'getxo-secret-2024' },
            body: JSON.stringify({ to: 'test@example.com', subject: 'test', text: 'test' })
        });

        const response = await POST(request as any);
        expect(response.status).toBe(401);
    });

    it('should accept requests with CORRECT API key when set', async () => {
        process.env.INTERNAL_API_SECRET = 'real-internal-secret';

        const req = new NextRequest('http://localhost/api/email/send', {
            method: 'POST',
            headers: {
                'x-api-key': 'real-internal-secret',
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                to: 'user@example.com',
                subject: 'Test',
                text: 'Hello'
            })
        });

        const res = await POST(req as any);
        expect(res.status).toBe(200);
    });
});
