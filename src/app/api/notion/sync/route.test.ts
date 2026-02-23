
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock child_process must be defined before imports
vi.mock('child_process', () => {
    const execMock = vi.fn((cmd, opts, cb) => {
        // Handle optional opts
        if (typeof opts === 'function') {
            cb = opts;
            opts = {};
        }
        if (cb) cb(null, 'stdout', 'stderr');
        return {
             kill: vi.fn(),
             pid: 123
        };
    });

    return {
        default: { exec: execMock },
        exec: execMock
    };
});

import { POST } from './route';
import child_process from 'child_process';

describe('POST /api/notion/sync', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should return 401 if secret is incorrect', async () => {
    process.env.NOTION_SYNC_SECRET = 'my_secret';

    const req = new Request('http://localhost/api/notion/sync?secret=wrong_secret', {
      method: 'POST',
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body).toEqual({ error: 'Unauthorized' });
  });

  it('should return 401 if secret is missing', async () => {
    process.env.NOTION_SYNC_SECRET = 'my_secret';

    const req = new Request('http://localhost/api/notion/sync', {
      method: 'POST',
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('should return 401 if NOTION_SYNC_SECRET is not set', async () => {
    delete process.env.NOTION_SYNC_SECRET;

    // Even if we send a secret, it should fail if env var is not set (security default)
    const req = new Request('http://localhost/api/notion/sync?secret=any_secret', {
        method: 'POST',
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('should return 401 if using old hardcoded secret (and env var is different)', async () => {
    process.env.NOTION_SYNC_SECRET = 'new_secure_secret';

    const req = new Request('http://localhost/api/notion/sync?secret=getxo_notion_sync_2026_pro', {
        method: 'POST',
    });

    const res = await POST(req);

    expect(res.status).toBe(401);
  });

  it('should return 200 if secret is correct', async () => {
    process.env.NOTION_SYNC_SECRET = 'my_secret';

    const req = new Request('http://localhost/api/notion/sync?secret=my_secret', {
      method: 'POST',
    });

    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(child_process.exec).toHaveBeenCalled();
  });
});
