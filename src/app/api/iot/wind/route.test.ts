import { POST } from './route';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

const { mockInsert } = vi.hoisted(() => ({
  mockInsert: vi.fn().mockResolvedValue({ error: null })
}));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn().mockReturnValue({
    from: vi.fn().mockReturnValue({
      insert: mockInsert
    })
  })
}));

describe('POST /api/iot/wind', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should REJECT the hardcoded fallback when IOT_API_KEY is missing', async () => {
    delete process.env.IOT_API_KEY;

    const req = new NextRequest('http://localhost/api/iot/wind', {
      method: 'POST',
      headers: {
        'x-api-key': 'club-nautico-iot-secret-2024',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sensor_id: 'test-sensor',
        speed_knots: 10,
        direction_deg: 180,
        gust_knots: 15,
        battery_level: 90
      })
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('should return 401 if provided apiKey does not match IOT_API_KEY', async () => {
    process.env.IOT_API_KEY = 'real-secret';

    const req = new NextRequest('http://localhost/api/iot/wind', {
      method: 'POST',
      headers: {
        'x-api-key': 'wrong-secret',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sensor_id: 'test-sensor',
        speed_knots: 10,
        direction_deg: 180
      })
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('should accept requests with CORRECT API key when set', async () => {
    process.env.IOT_API_KEY = 'real-secret';

    const req = new NextRequest('http://localhost/api/iot/wind', {
      method: 'POST',
      headers: {
        'x-api-key': 'real-secret',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sensor_id: 'test-sensor',
        speed_knots: 10,
        direction_deg: 180
      })
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
  });
});
