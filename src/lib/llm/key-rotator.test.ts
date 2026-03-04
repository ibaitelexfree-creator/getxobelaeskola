import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RoundRobinRotator, resetGlobalKeyIndex } from './key-rotator';

describe('RoundRobinRotator', () => {
    let originalEnv: NodeJS.ProcessEnv;

    beforeEach(() => {
        // Manually isolate env since vi.resetModules is not available in Bun
        originalEnv = { ...process.env };
        resetGlobalKeyIndex();
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    it('initializes with explicit keys', () => {
        const keys = ['key1', 'key2'];
        const rotator = new RoundRobinRotator(keys);
        expect(rotator.availableKeysCount).toBe(2);
        expect(rotator.getNextKey()).toBe('key1');
        expect(rotator.getNextKey()).toBe('key2');
        expect(rotator.getNextKey()).toBe('key1'); // Rotates back
    });

    it('initializes from OPENAI_API_KEYS environment variable', () => {
        process.env.OPENAI_API_KEYS = 'env-key1, env-key2 , env-key3';
        delete process.env.OPENAI_API_KEY;

        const rotator = new RoundRobinRotator();
        expect(rotator.availableKeysCount).toBe(3);
        expect(rotator.getNextKey()).toBe('env-key1');
        expect(rotator.getNextKey()).toBe('env-key2');
        expect(rotator.getNextKey()).toBe('env-key3');
    });

    it('initializes from OPENAI_API_KEY environment variable if OPENAI_API_KEYS is missing', () => {
        delete process.env.OPENAI_API_KEYS;
        process.env.OPENAI_API_KEY = 'single-key';

        const rotator = new RoundRobinRotator();
        expect(rotator.availableKeysCount).toBe(1);
        expect(rotator.getNextKey()).toBe('single-key');
    });

    it('initializes with no keys and logs warning when environment variables are missing', () => {
        delete process.env.OPENAI_API_KEYS;
        delete process.env.OPENAI_API_KEY;

        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const rotator = new RoundRobinRotator();

        expect(rotator.availableKeysCount).toBe(0);
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('No OpenAI API keys found'));

        expect(() => rotator.getNextKey()).toThrow('No API keys available for rotation.');

        consoleSpy.mockRestore();
    });

    it('maintains rotation state across instances because of global index', () => {
        const keys = ['key1', 'key2'];
        const rotator1 = new RoundRobinRotator(keys);
        expect(rotator1.getNextKey()).toBe('key1');

        const rotator2 = new RoundRobinRotator(keys);
        expect(rotator2.getNextKey()).toBe('key2'); // Continues from previous index
    });

    it('reports failure and success without crashing', () => {
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const rotator = new RoundRobinRotator(['key1']);

        rotator.reportSuccess('key1');
        rotator.reportFailure('key1');

        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('reported failure'));
        consoleSpy.mockRestore();
    });
});
