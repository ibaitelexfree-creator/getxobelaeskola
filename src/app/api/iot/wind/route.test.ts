import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn().mockReturnThis(),
    insert: vi.fn().mockResolvedValue({ error: null }),
  })),
}));

describe('POST /api/iot/wind', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  const createRequest = (apiKey: string | null, body: any = {}) => {
    const req = new NextRequest('http://localhost/api/iot/wind', {
      method: 'POST',
      headers: new Headers({
        ...(apiKey ? { 'x-api-key': apiKey } : {}),
      }),
      body: JSON.stringify(body),
    });
    // Mock the .json() method since NextRequest inside Node might not parse it easily without a proper server setup in some mock environments
    req.json = vi.fn().mockResolvedValue(body);
    return req;
  };

  it('should return 401 if IOT_API_KEY is not set', async () => {
    delete process.env.IOT_API_KEY;
    const req = createRequest('any-key');
    const res = await POST(req);

    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe('Unauthorized');
  });

  it('should return 401 if x-api-key does not match IOT_API_KEY', async () => {
    process.env.IOT_API_KEY = 'correct-secret-key';
    const req = createRequest('wrong-secret-key');
    const res = await POST(req);

    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe('Unauthorized');
  });

  it('should proceed if x-api-key matches IOT_API_KEY', async () => {
    process.env.IOT_API_KEY = 'correct-secret-key';
    const req = createRequest('correct-secret-key', {
      sensor_id: 'sensor-1',
      speed_knots: 10,
      direction_deg: 180,
    });

    const res = await POST(req);

    // Status should be 200 (Success)
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
  });
});
