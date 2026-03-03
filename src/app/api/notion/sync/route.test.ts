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
      return { on: vi.fn(), unref: vi.fn() };
    })
  }
});

// Mock next/server
vi.mock('next/server', () => {
  const actual = vi.importActual('next/server');
  return {
    ...actual,
    NextResponse: {
      json: vi.fn((data, init) => ({
        json: async () => data,
        status: init?.status || 200
      }))
    }
  };
});

describe('Notion Sync API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('NOTION_SYNC_SECRET', 'test_secret');
  });

  it('rejects unauthorized requests with no secret', async () => {
    const req = new NextRequest('http://localhost/api/notion/sync');
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('rejects unauthorized requests with wrong secret', async () => {
    const req = new NextRequest('http://localhost/api/notion/sync?secret=wrong');
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('calls execFile with the correct arguments to prevent command injection', async () => {
    const maliciousTable = 'users; rm -rf /';
    const req = new NextRequest(`http://localhost/api/notion/sync?secret=test_secret&mode=pull&table=${encodeURIComponent(maliciousTable)}`);
    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(execFile).toHaveBeenCalledTimes(1);

    const call = vi.mocked(execFile).mock.calls[0];
    const args = call[1] as string[];
    expect(call[0]).toBe('node');
    expect(args).toContain(maliciousTable); // The malicious string should be treated as a single argument
  });
});
