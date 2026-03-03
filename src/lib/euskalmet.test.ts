import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import jwt from 'jsonwebtoken';
import { generateEuskalmetToken } from './euskalmet';

vi.mock('jsonwebtoken', () => {
    const sign = vi.fn(() => 'mock-token');
    return {
        sign,
        default: { sign }
    };
});

describe('Euskalmet Token Generation', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2024-01-01T12:00:00Z'));
        vi.clearAllMocks();
        vi.unstubAllEnvs();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should generate a token with correct payload and default email', () => {
        vi.stubEnv('EUSKALMET_PRIVATE_KEY', 'test-key');
        // Ensure EUSKALMET_EMAIL is not set to test default
        vi.stubEnv('EUSKALMET_EMAIL', '');

        const token = generateEuskalmetToken();

        expect(token).toBe('mock-token');
        const now = Math.floor(new Date('2024-01-01T12:00:00Z').getTime() / 1000);

        const signSpy = (jwt as any).sign || jwt;
        expect(signSpy).toHaveBeenCalledWith(
            {
                aud: 'met01.apikey',
                iss: 'GetxoBelaEskola',
                version: '1.0.0',
                email: 'info@getxobelaeskola.com',
                iat: now,
                exp: now + 3600
            },
            'test-key',
            { algorithm: 'RS256' }
        );
    });

    it('should use custom email if provided in env', () => {
        vi.stubEnv('EUSKALMET_PRIVATE_KEY', 'test-key');
        vi.stubEnv('EUSKALMET_EMAIL', 'custom@example.com');

        generateEuskalmetToken();

        const signSpy = (jwt as any).sign || jwt;
        expect(signSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                email: 'custom@example.com'
            }),
            'test-key',
            { algorithm: 'RS256' }
        );
    });

    it('should handle escaped newlines in PRIVATE_KEY', () => {
        vi.stubEnv('EUSKALMET_PRIVATE_KEY', 'line1\\nline2');

        generateEuskalmetToken();

        const signSpy = (jwt as any).sign || jwt;
        expect(signSpy).toHaveBeenCalledWith(
            expect.any(Object),
            'line1\nline2',
            { algorithm: 'RS256' }
        );
    });

    it('should throw error if EUSKALMET_PRIVATE_KEY is not defined', () => {
        vi.stubEnv('EUSKALMET_PRIVATE_KEY', '');

        expect(() => generateEuskalmetToken()).toThrow('EUSKALMET_PRIVATE_KEY is not defined');
    });
});
