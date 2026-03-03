import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { execFile } from 'child_process';
import { NextRequest } from 'next/server';

vi.mock('child_process', () => ({
  execFile: vi.fn((cmd, args, options, callback) => {
    if (callback) callback(null, 'success', '');
  }),
}));

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
});
