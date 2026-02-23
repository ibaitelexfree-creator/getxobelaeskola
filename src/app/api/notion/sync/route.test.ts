
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST } from './route';
import { NextResponse } from 'next/server';
import child_process from 'child_process';
import fs from 'fs';
import path from 'path';

// Mock child_process
vi.mock('child_process', () => {
    const execMock = vi.fn((cmd, opts, cb) => {
        if (typeof opts === 'function') {
            cb = opts;
            opts = {};
        }
        if (cb) cb(null, 'stdout', '');
        return { on: vi.fn() };
    });

    const execFileMock = vi.fn((file, args, opts, cb) => {
        if (typeof opts === 'function') {
            cb = opts;
            opts = {};
        }
        if (cb) cb(null, 'stdout', '');
        return { on: vi.fn() };
    });

    return {
        default: {
            exec: execMock,
            execFile: execFileMock,
        },
        exec: execMock,
        execFile: execFileMock,
    };
});

// Mock fs to ensure predictable validation
vi.mock('fs', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        default: {
            ...actual,
            existsSync: vi.fn(),
            readFileSync: vi.fn(),
        },
        existsSync: vi.fn(),
        readFileSync: vi.fn(),
    };
});

// Mock NextResponse
vi.mock('next/server', () => {
    const json = vi.fn((body, init) => ({ body, init }));
    return { NextResponse: { json } };
});

describe('Notion Sync API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Setup default mocks for fs
        vi.mocked(fs.existsSync).mockReturnValue(true);
        vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ 'cursos': 'uuid', 'some_table': 'uuid' }));

        // Setup default environment
        process.env.NOTION_SYNC_SECRET = 'test_secret';
    });

    afterEach(() => {
        delete process.env.NOTION_SYNC_SECRET;
    });

    it('should return 500 if NOTION_SYNC_SECRET is not set', async () => {
        delete process.env.NOTION_SYNC_SECRET;
        const req = new Request('http://localhost:3000/api/notion/sync?secret=test_secret');
        const res = await POST(req);

        expect(res.body.error).toContain('misconfiguration');
        expect(res.init.status).toBe(500);
    });

    it('should reject requests with invalid secret', async () => {
        const req = new Request('http://localhost:3000/api/notion/sync?secret=wrong_secret');
        const res = await POST(req);

        expect(res.init.status).toBe(401);
    });

    it('should execute command securely for valid inputs', async () => {
        const req = new Request('http://localhost:3000/api/notion/sync?secret=test_secret&mode=pull&table=cursos');
        await POST(req);

        // Check that execFile was used
        expect(child_process.execFile).toHaveBeenCalled();
        expect(child_process.exec).not.toHaveBeenCalled();

        // Check arguments
        const calls = vi.mocked(child_process.execFile).mock.calls;
        // The first argument is process.execPath (node)
        expect(calls[0][0]).toBe(process.execPath);

        const args = calls[0][1];
        // arguments: [scriptPath, mode, table]
        expect(args[1]).toBe('pull');
        expect(args[2]).toBe('cursos');
    });

    it('should reject invalid table names not in map', async () => {
        const req = new Request('http://localhost:3000/api/notion/sync?secret=test_secret&mode=pull&table=invalid_table');
        const res = await POST(req);

        expect(res.init.status).toBe(400);
        expect(child_process.execFile).not.toHaveBeenCalled();
    });

    it('should prevent command injection in table parameter', async () => {
        const req = new Request('http://localhost:3000/api/notion/sync?secret=test_secret&mode=pull&table=cursos;rm -rf /');
        const res = await POST(req);

        expect(res.init.status).toBe(400);
        expect(child_process.execFile).not.toHaveBeenCalled();
    });

    it('should fallback to regex validation if map file is missing', async () => {
        vi.mocked(fs.existsSync).mockReturnValue(false); // Simulate missing file

        // Valid regex match (alphanumeric)
        const req1 = new Request('http://localhost:3000/api/notion/sync?secret=test_secret&mode=pull&table=some_table');
        await POST(req1);
        expect(child_process.execFile).toHaveBeenCalled();

        vi.clearAllMocks();
        vi.mocked(fs.existsSync).mockReturnValue(false);

        // Invalid regex match (injection attempt with semicolon)
        const req2 = new Request('http://localhost:3000/api/notion/sync?secret=test_secret&mode=pull&table=table;rm');
        const res2 = await POST(req2);

        expect(res2.init.status).toBe(400);
        expect(child_process.execFile).not.toHaveBeenCalled();
    });
});
