import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

// Mock dependencies before importing the module under test
vi.mock('next-intl/middleware', () => ({
    default: vi.fn(() => (_req: NextRequest) => NextResponse.next()),
}));

vi.mock('@supabase/ssr', () => ({
    createServerClient: vi.fn(),
}));

// Mock next/server to ensure NextResponse.next() returns something we can modify
vi.mock('next/server', async () => {
    const actual = await vi.importActual<typeof import('next/server')>('next/server');

    const mockedNextResponse = {
        ...actual.NextResponse,
        next: vi.fn().mockImplementation((options) => {
            const res = new (actual.NextResponse as any)(null);
            if (options?.request?.headers) {
                options.request.headers.forEach((value: string, key: string) => {
                    res.headers.set(key, value);
                });
            }
            return res;
        }),
    };

    return {
        ...actual,
        NextResponse: mockedNextResponse,
    };
});

// Now import middleware
import middleware from './middleware';
import { createServerClient } from '@supabase/ssr';

describe('Middleware Auth Error Path', () => {
    const supabaseUrl = 'https://example.supabase.co';
    const supabaseAnonKey = 'anon-key';
    let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        vi.clearAllMocks();
        process.env.NEXT_PUBLIC_SUPABASE_URL = supabaseUrl;
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = supabaseAnonKey;
        consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    it('should catch and log errors from supabase.auth.getUser()', async () => {
        // Arrange
        const authError = new Error('Connection failed');
        const mockGetUser = vi.fn().mockRejectedValue(authError);

        vi.mocked(createServerClient).mockReturnValue({
            auth: {
                getUser: mockGetUser,
            },
        } as any);

        const req = new NextRequest('http://localhost/dashboard');

        // Act
        const res = await middleware(req);

        // Assert
        expect(mockGetUser).toHaveBeenCalled();
        expect(consoleErrorSpy).toHaveBeenCalledWith('Middleware auth check failed:', authError);
        expect(res).toBeDefined();
    });

    it('should handle missing environment variables gracefully', async () => {
        // Arrange
        delete process.env.NEXT_PUBLIC_SUPABASE_URL;
        const req = new NextRequest('http://localhost/dashboard');

        // Act
        const res = await middleware(req);

        // Assert
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            expect.stringContaining('CRITICAL ERROR: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing')
        );
        expect(res).toBeDefined();
    });

    it('should inject metering headers in API routes when auth fails', async () => {
        // Arrange
        vi.mocked(createServerClient).mockReturnValue({
            auth: {
                getUser: vi.fn().mockRejectedValue(new Error('Auth crash')),
            },
        } as any);

        // Request with tenant ID header but failing auth
        const req = new NextRequest('http://localhost/api/data', {
            headers: { 'x-tenant-id': 'tenant-header-id' }
        });

        // Act
        const res = await middleware(req);

        // Assert
        expect(res.headers.get('x-metering-tenant-id')).toBe('tenant-header-id');
        expect(consoleErrorSpy).toHaveBeenCalledWith('Middleware auth check failed:', expect.any(Error));
    });

    it('should successfully identify user and inject tenant ID', async () => {
        // Arrange
        const mockUser = { id: 'user-id-123' };
        vi.mocked(createServerClient).mockReturnValue({
            auth: {
                getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
            },
        } as any);

        const req = new NextRequest('http://localhost/api/secure-data');

        // Act
        const res = await middleware(req);

        // Assert
        expect(res.headers.get('x-metering-tenant-id')).toBe('user-id-123');
        expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
});
