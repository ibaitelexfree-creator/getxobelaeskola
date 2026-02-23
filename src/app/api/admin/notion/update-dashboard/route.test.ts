
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { POST } from './route';
import { NextResponse } from 'next/server';
import { exec, execFile } from 'child_process';
import { requireAdmin } from '@/lib/auth-guard';

// Mock child_process
vi.mock('child_process', () => {
    const execMock = vi.fn((cmd, opts, cb) => {
        if (cb) cb(null, 'Success', '');
        return { stdout: 'Success', stderr: '' };
    });

    const execFileMock = vi.fn((file, args, opts, cb) => {
        if (cb) cb(null, 'Success', '');
        return { stdout: 'Success', stderr: '' };
    });

    return {
        default: { exec: execMock, execFile: execFileMock },
        exec: execMock,
        execFile: execFileMock
    };
});

// Mock next/server
vi.mock('next/server', () => {
    return {
        NextResponse: {
            json: vi.fn((body, init) => ({ body, init })),
        },
    };
});

// Mock @/lib/auth-guard
vi.mock('@/lib/auth-guard', () => {
    return {
        requireAdmin: vi.fn(),
    };
});

describe('POST /api/admin/notion/update-dashboard', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 403 if not admin', async () => {
        const errorResponse = { body: { error: 'Unauthorized' }, init: { status: 403 } };
        // @ts-ignore
        requireAdmin.mockResolvedValue({ error: errorResponse });

        const response = await POST();

        expect(requireAdmin).toHaveBeenCalled();
        expect(response).toEqual(errorResponse);
        expect(execFile).not.toHaveBeenCalled();
        expect(exec).not.toHaveBeenCalled();
    });

    it('should execute script if admin', async () => {
        // @ts-ignore
        requireAdmin.mockResolvedValue({ user: { id: '1' }, profile: { role: 'admin' } });

        await POST();

        expect(requireAdmin).toHaveBeenCalled();
        expect(execFile).toHaveBeenCalled();
        expect(exec).not.toHaveBeenCalled();

        // Check arguments for execFile
        expect(execFile).toHaveBeenCalledWith(
            process.execPath,
            expect.arrayContaining([expect.stringContaining('notion-premium-dashboard.js')]),
            expect.objectContaining({
                env: expect.objectContaining({
                    SUPABASE_SERVICE_ROLE_KEY: expect.any(String),
                    NOTION_TOKEN: expect.any(String)
                })
            }),
            expect.any(Function)
        );
    });
});
