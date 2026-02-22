import { describe, it, expect, vi } from 'vitest';
import { FallbackChain } from './fallback-chain';
import { MockClient } from './mock-client';

describe('FallbackChain', () => {
    it('should use the first client if it succeeds', async () => {
        const client1 = new MockClient(false, 'Response 1');
        const client2 = new MockClient(false, 'Response 2');
        const chain = new FallbackChain([client1, client2]);

        const result = await chain.generateContent('test');
        expect(result).toBe('Response 1');
    });

    it('should fallback to the second client if the first fails', async () => {
        const client1 = new MockClient(true);
        const client2 = new MockClient(false, 'Response 2');
        const chain = new FallbackChain([client1, client2]);

        // Spy on client2
        const spy = vi.spyOn(client2, 'generateContent');

        const result = await chain.generateContent('test');
        expect(result).toBe('Response 2');
        expect(spy).toHaveBeenCalled();
    });

    it('should throw an error if all clients fail', async () => {
        const client1 = new MockClient(true);
        const client2 = new MockClient(true);
        const chain = new FallbackChain([client1, client2]);

        await expect(chain.generateContent('test')).rejects.toThrow('All models in the chain failed');
    });

    it('should require at least one client', () => {
        expect(() => new FallbackChain([])).toThrow('FallbackChain requires at least one client');
    });
});
