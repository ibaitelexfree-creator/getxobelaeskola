import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST } from './route';

// Mock dependencias
vi.mock('@/lib/resend', () => ({
  resend: {
    emails: {
      send: vi.fn().mockResolvedValue({ data: { id: 'test-id' }, error: null })
    }
  },
  DEFAULT_FROM_EMAIL: 'test@example.com'
}));

// Mock supabase server client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null } })
    },
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null })
  })
}));

describe('POST /api/email/send', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.clearAllMocks();
  });

  const createRequest = (apiKey: string | null, body: any = { to: 'test@example.com', subject: 'Test', text: 'Hello' }) => {
    const headers = new Headers();
    if (apiKey) {
      headers.set('x-api-key', apiKey);
    }
    return new Request('http://localhost:3000/api/email/send', {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });
  };

  it('should authorize with correct API key', async () => {
    process.env.INTERNAL_API_SECRET = 'correct-secret';
    const req = createRequest('correct-secret');

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('should deny access with incorrect API key', async () => {
    process.env.INTERNAL_API_SECRET = 'correct-secret';
    const req = createRequest('wrong-secret');

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toBe('No autorizado');
  });

  it('should deny access if INTERNAL_API_SECRET is missing even if some key is provided', async () => {
    delete process.env.INTERNAL_API_SECRET;
    const req = createRequest('some-key');

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toBe('No autorizado');
  });

  it('should deny access if INTERNAL_API_SECRET is missing and no key is provided', async () => {
    delete process.env.INTERNAL_API_SECRET;
    const req = createRequest(null);

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toBe('No autorizado');
  });
});
