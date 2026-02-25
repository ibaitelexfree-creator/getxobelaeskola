import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getApiBaseUrl, apiUrl } from './api';

describe('getApiBaseUrl', () => {
    beforeEach(() => {
        vi.resetModules();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.unstubAllEnvs();
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
        // Mock environment as development
        vi.stubEnv('NODE_ENV', 'development');
        // Ensure env doesn't override it for this test case if logic prefers window
        vi.stubEnv('NEXT_PUBLIC_APP_URL', '');

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
    beforeEach(() => {
        vi.resetModules();
        // Set a default environment for apiUrl tests
        const mockLocation = {
            hostname: 'example.com',
            protocol: 'https:',
            origin: 'https://example.com',
        };
        vi.stubGlobal('window', { location: mockLocation });
        vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://api.test.com');
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.unstubAllEnvs();
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
