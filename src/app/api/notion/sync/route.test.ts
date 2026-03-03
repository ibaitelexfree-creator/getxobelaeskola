<<<<<<< HEAD
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { POST } from './route';

// Mock child_process.exec
vi.mock('child_process', () => ({
    exec: vi.fn((cmd, options, callback) => {
        if (callback) callback(null, 'success', '');
    }),
    default: {
        exec: vi.fn((cmd, options, callback) => {
            if (callback) callback(null, 'success', '');
        })
    }
}));

// Mock next/server
vi.mock('next/server', () => ({
    NextResponse: {
        json: vi.fn((data, init) => ({
            json: async () => data,
            status: init?.status || 200
        }))
    }
}));

describe('Notion Sync API Route', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubEnv('NOTION_SYNC_SECRET', '');
    });

    it('should return 401 if NOTION_SYNC_SECRET is not set', async () => {
        vi.stubEnv('NOTION_SYNC_SECRET', '');
        const req = new Request('https://example.com/api/notion/sync?secret=any', { method: 'POST' });
        const response = await POST(req);

        expect(response.status).toBe(401);
        const data = await response.json();
        expect(data).toEqual({ error: 'Unauthorized' });
    });

    it('should return 401 if secret does not match NOTION_SYNC_SECRET', async () => {
        vi.stubEnv('NOTION_SYNC_SECRET', 'correct_secret');
        const req = new Request('https://example.com/api/notion/sync?secret=wrong_secret', { method: 'POST' });
        const response = await POST(req);

        expect(response.status).toBe(401);
        const data = await response.json();
        expect(data).toEqual({ error: 'Unauthorized' });
    });

    it('should return 200 if secret matches NOTION_SYNC_SECRET', async () => {
        vi.stubEnv('NOTION_SYNC_SECRET', 'correct_secret');
        const req = new Request('https://example.com/api/notion/sync?secret=correct_secret', { method: 'POST' });
        const response = await POST(req);

        expect(response.status).toBe(200);
        const data = await (response as unknown as { json: () => Promise<{ message: string }> }).json();
        expect(data.message).toBe('Sync started successfully');
    });
=======
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { execFile } from 'child_process';
import { NextRequest } from 'next/server';

vi.mock('child_process', () => {
  return {
    execFile: vi.fn((cmd, args, opts, callback) => {
      if (callback) {
        callback(null, 'stdout', 'stderr');
      }
      return { on: vi.fn() };
    })
  }
});

describe('Notion Sync Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects unauthorized requests', async () => {
    const req = new NextRequest('http://localhost/api/notion/sync?secret=wrong');
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('calls execFile with the correct arguments to prevent command injection', async () => {
    const maliciousTable = 'users; rm -rf /';
    const req = new NextRequest(`http://localhost/api/notion/sync?secret=getxo_notion_sync_2026_pro&mode=pull&table=${encodeURIComponent(maliciousTable)}`);
    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(execFile).toHaveBeenCalledTimes(1);

    const [cmd, args] = vi.mocked(execFile).mock.calls[0];
    expect(cmd).toBe('node');
    expect(args).toContain(maliciousTable); // The malicious string should be treated as a single argument, not executed
  });
>>>>>>> origin/jules/fix-notion-sync-command-injection-17401770005979444128
});
