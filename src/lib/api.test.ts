import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getApiBaseUrl, apiUrl } from './api';

describe('getApiBaseUrl', () => {
    const originalWindow = global.window;
    const originalEnv = process.env;

    beforeEach(() => {
        vi.resetModules();
        process.env = { ...originalEnv };
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        process.env = originalEnv;
    });

    it('should return empty string when window is undefined (server-side)', () => {
        vi.stubGlobal('window', undefined);
        expect(getApiBaseUrl()).toBe('');
    });

    it('should return window.location.origin when on localhost browser', () => {
        const mockLocation = {
            hostname: 'localhost',
            protocol: 'http:',
            origin: 'http://localhost:3000',
        };
        vi.stubGlobal('window', { location: mockLocation });
        // Use Object.defineProperty to bypass read-only restriction in test environment if needed,
        // or just rely on the fact that standard process.env assignment works in Node/Vitest usually.
        // If it's read-only, we might need a different approach or just assume it's development in test runner.
        // But let's try defining it properly.
        Object.defineProperty(process.env, 'NODE_ENV', { value: 'development', writable: true });

        expect(getApiBaseUrl()).toBe('http://localhost:3000');
    });

    it('should return NEXT_PUBLIC_APP_URL when on Capacitor (localhost)', () => {
        const mockLocation = {
            hostname: 'localhost',
            protocol: 'capacitor:',
            origin: 'capacitor://localhost',
        };
        vi.stubGlobal('window', { location: mockLocation });
        process.env.NEXT_PUBLIC_APP_URL = 'https://api.example.com';

        expect(getApiBaseUrl()).toBe('https://api.example.com');
    });

    it('should return NEXT_PUBLIC_APP_URL when on Capacitor (file protocol)', () => {
        const mockLocation = {
            hostname: 'localhost',
            protocol: 'file:',
            origin: 'file://',
        };
        vi.stubGlobal('window', { location: mockLocation });
        process.env.NEXT_PUBLIC_APP_URL = 'https://api.example.com';

        expect(getApiBaseUrl()).toBe('https://api.example.com');
    });

    it('should return NEXT_PUBLIC_APP_URL when explicitly set (production browser)', () => {
        const mockLocation = {
            hostname: 'example.com',
            protocol: 'https:',
            origin: 'https://example.com',
        };
        vi.stubGlobal('window', { location: mockLocation });
        process.env.NEXT_PUBLIC_APP_URL = 'https://api.custom.com';

        expect(getApiBaseUrl()).toBe('https://api.custom.com');
    });

    it('should return fallback URL when on production browser and NEXT_PUBLIC_APP_URL is not set', () => {
        const mockLocation = {
            hostname: 'example.com',
            protocol: 'https:',
            origin: 'https://example.com',
        };
        vi.stubGlobal('window', { location: mockLocation });
        delete process.env.NEXT_PUBLIC_APP_URL;

        expect(getApiBaseUrl()).toBe('https://getxobelaeskola.cloud');
    });

    it('should remove trailing slash from NEXT_PUBLIC_APP_URL', () => {
        const mockLocation = {
            hostname: 'example.com',
            protocol: 'https:',
            origin: 'https://example.com',
        };
        vi.stubGlobal('window', { location: mockLocation });
        process.env.NEXT_PUBLIC_APP_URL = 'https://api.custom.com/';

        expect(getApiBaseUrl()).toBe('https://api.custom.com');
    });
});

describe('apiUrl', () => {
    const originalWindow = global.window;
    const originalEnv = process.env;

    beforeEach(() => {
        vi.resetModules();
        process.env = { ...originalEnv };
        // Set a default environment for apiUrl tests
        const mockLocation = {
            hostname: 'example.com',
            protocol: 'https:',
            origin: 'https://example.com',
        };
        vi.stubGlobal('window', { location: mockLocation });
        process.env.NEXT_PUBLIC_APP_URL = 'https://api.test.com';
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        process.env = originalEnv;
    });

    it('should append path to base URL', () => {
        expect(apiUrl('/users')).toBe('https://api.test.com/users');
    });

    it('should add leading slash if missing', () => {
        expect(apiUrl('users')).toBe('https://api.test.com/users');
    });

    it('should correct /api/academy/ prefix to /api/', () => {
        expect(apiUrl('/api/academy/users')).toBe('https://api.test.com/api/users');
    });

    it('should handle complex paths correctly', () => {
        expect(apiUrl('/api/academy/v1/resource/123')).toBe('https://api.test.com/api/v1/resource/123');
    });

    it('should work correctly server-side (empty base)', () => {
        vi.stubGlobal('window', undefined);
        expect(apiUrl('/api/users')).toBe('/api/users');
    });
});
