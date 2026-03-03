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
        const data = await (response as any).json();
        expect(data.message).toBe('Sync started successfully');
    });
});
