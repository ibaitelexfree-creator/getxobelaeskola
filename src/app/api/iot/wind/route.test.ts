import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';

vi.mock('@/lib/supabase/admin', () => ({
    createAdminClient: vi.fn(() => ({
        from: vi.fn(() => ({
            insert: vi.fn(() => Promise.resolve({ error: null }))
        }))
    }))
}));

describe('IoT Wind API Security', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        vi.resetModules();
        process.env = { ...originalEnv };
    });

    it('should return 401 if IOT_API_KEY is not set in environment', async () => {
        delete process.env.IOT_API_KEY;
        const request = new NextRequest('http://localhost/api/iot/wind', {
            method: 'POST',
            headers: { 'x-api-key': 'club-nautico-iot-secret-2024' },
            body: JSON.stringify({ sensor_id: 'test', speed_knots: 10, direction_deg: 90 })
        });

        const response = await POST(request);
        expect(response.status).toBe(401);
        const body = await response.json();
        expect(body.error).toBe('Unauthorized');
    });

    it('should return 401 if provided apiKey does not match IOT_API_KEY', async () => {
        process.env.IOT_API_KEY = 'real-secret-key';
        const request = new NextRequest('http://localhost/api/iot/wind', {
            method: 'POST',
            headers: { 'x-api-key': 'club-nautico-iot-secret-2024' },
            body: JSON.stringify({ sensor_id: 'test', speed_knots: 10, direction_deg: 90 })
        });

        const response = await POST(request);
        expect(response.status).toBe(401);
    });

    it('should return 200 if provided apiKey matches IOT_API_KEY', async () => {
        process.env.IOT_API_KEY = 'real-secret-key';
        const request = new NextRequest('http://localhost/api/iot/wind', {
            method: 'POST',
            headers: { 'x-api-key': 'real-secret-key' },
            body: JSON.stringify({ sensor_id: 'test', speed_knots: 10, direction_deg: 90 })
        });

        const response = await POST(request);
        expect(response.status).toBe(200);
    });
});
