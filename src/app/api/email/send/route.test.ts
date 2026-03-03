import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';

vi.mock('@/lib/resend', () => ({
    resend: null, // Simulation mode
    DEFAULT_FROM_EMAIL: 'test@example.com'
}));

vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn(() => Promise.resolve({
        auth: {
            getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null }))
        }
    }))
}));

describe('Email API Security', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        vi.resetModules();
        process.env = { ...originalEnv };
    });

    it('should return 401 if INTERNAL_API_SECRET is not set and no user session', async () => {
        delete process.env.INTERNAL_API_SECRET;
        const request = new NextRequest('http://localhost/api/email/send', {
            method: 'POST',
            headers: { 'x-api-key': 'getxo-secret-2024' },
            body: JSON.stringify({ to: 'test@example.com', subject: 'test', text: 'test' })
        });

        const response = await POST(request as any);
        expect(response.status).toBe(401);
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

    it('should return 200 if provided apiKey matches INTERNAL_API_SECRET', async () => {
        process.env.INTERNAL_API_SECRET = 'real-internal-secret';
        const request = new NextRequest('http://localhost/api/email/send', {
            method: 'POST',
            headers: { 'x-api-key': 'real-internal-secret' },
            body: JSON.stringify({ to: 'test@example.com', subject: 'test', text: 'test' })
        });

        const response = await POST(request as any);
        expect(response.status).toBe(200);
    });
});
