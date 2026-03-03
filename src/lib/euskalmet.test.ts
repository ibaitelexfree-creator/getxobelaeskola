import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import jwt from 'jsonwebtoken';

vi.mock('jsonwebtoken', () => ({
    default: {
        sign: vi.fn(() => 'mock-token')
    }
}));

describe('Euskalmet Token Generation', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2024-01-01T12:00:00Z'));
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllEnvs();
    });

    it('should generate a token with correct payload and default email', async () => {
        vi.stubEnv('EUSKALMET_PRIVATE_KEY', 'test-key');
        // Ensure EUSKALMET_EMAIL is not set to test default
        vi.stubEnv('EUSKALMET_EMAIL', '');

        const { generateEuskalmetToken } = await import('./euskalmet');
        const token = generateEuskalmetToken();

        expect(token).toBe('mock-token');
        const now = Math.floor(new Date('2024-01-01T12:00:00Z').getTime() / 1000);

        expect(jwt.sign).toHaveBeenCalledWith(
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

    it('should use custom email if provided in env', async () => {
        vi.stubEnv('EUSKALMET_PRIVATE_KEY', 'test-key');
        vi.stubEnv('EUSKALMET_EMAIL', 'custom@example.com');

        const { generateEuskalmetToken } = await import('./euskalmet');
        generateEuskalmetToken();

        expect(jwt.sign).toHaveBeenCalledWith(
            expect.objectContaining({
                email: 'custom@example.com'
            }),
            'test-key',
            { algorithm: 'RS256' }
        );
    });

    it('should handle escaped newlines in PRIVATE_KEY', async () => {
        vi.stubEnv('EUSKALMET_PRIVATE_KEY', 'line1\\nline2');

        const { generateEuskalmetToken } = await import('./euskalmet');
        generateEuskalmetToken();

        expect(jwt.sign).toHaveBeenCalledWith(
            expect.any(Object),
            'line1\nline2',
            { algorithm: 'RS256' }
        );
    });

    it('should throw error if EUSKALMET_PRIVATE_KEY is not defined', async () => {
        vi.stubEnv('EUSKALMET_PRIVATE_KEY', '');

        const { generateEuskalmetToken } = await import('./euskalmet');
        expect(() => generateEuskalmetToken()).toThrow('EUSKALMET_PRIVATE_KEY is not defined');
    });
});
