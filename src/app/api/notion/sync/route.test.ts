
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { NextResponse } from 'next/server';

vi.mock('next/server', () => ({
    NextResponse: {
        json: vi.fn((data, init) => ({ data, init }))
    }
}));

vi.mock('child_process', () => ({
    exec: vi.fn(),
    default: {
        exec: vi.fn()
    }
}));

describe('Notion Sync API Route', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.NOTION_SYNC_SECRET = 'test_secret';
    });

    it('should return 401 if secret is missing', async () => {
        const req = new Request('http://localhost/api/notion/sync');
        const response = await POST(req);

        expect(NextResponse.json).toHaveBeenCalledWith(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    });

    it('should return 401 if secret is incorrect', async () => {
        const req = new Request('http://localhost/api/notion/sync?secret=wrong');
        const response = await POST(req);

        expect(NextResponse.json).toHaveBeenCalledWith(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    });

    it('should return 401 if NOTION_SYNC_SECRET is not set in env', async () => {
        delete process.env.NOTION_SYNC_SECRET;
        const req = new Request('http://localhost/api/notion/sync?secret=test_secret');
        const response = await POST(req);

        expect(NextResponse.json).toHaveBeenCalledWith(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    });

    it('should return 200 if secret is correct', async () => {
        process.env.NOTION_SYNC_SECRET = 'test_secret';
        const req = new Request('http://localhost/api/notion/sync?secret=test_secret');
        const response = await POST(req);

        expect(NextResponse.json).toHaveBeenCalledWith(
            { message: 'Sync started successfully', mode: 'pull' }
        );
    });
});
