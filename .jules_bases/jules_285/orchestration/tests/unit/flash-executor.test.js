import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { EventEmitter } from 'events';
import FlashExecutor from '../../lib/flash-executor.js';

describe('FlashExecutor Key Rotation', () => {
    let originalEnv;

    beforeEach(() => {
        originalEnv = { ...process.env };
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    it('should initialize with multiple keys from options', () => {
        const executor = new FlashExecutor({
            apiKeys: ['key1', 'key2', 'key3']
        });
        executor.stop();

        const status = executor.getStatus();
        assert.strictEqual(status.keyCount, 3);
        assert.strictEqual(status.currentKeyIndex, 0);
        assert.strictEqual(status.enabled, true);
    });

    it('should initialize with comma-separated ENV keys', () => {
        process.env.GEMINI_API_KEYS = 'env1, env2 ';
        const executor = new FlashExecutor({});
        executor.stop();

        const status = executor.getStatus();
        assert.strictEqual(status.keyCount, 2);
        assert.deepStrictEqual(executor.apiKeys, ['env1', 'env2']);
    });

    it('should fallback to single ENV key', () => {
        delete process.env.GEMINI_API_KEYS;
        process.env.GEMINI_API_KEY = 'singleKey';

        const executor = new FlashExecutor({});
        executor.stop();

        const status = executor.getStatus();
        assert.strictEqual(status.keyCount, 1);
        assert.deepStrictEqual(executor.apiKeys, ['singleKey']);
    });

    it('should rotate keys on consecutive calls', async () => {
        const executor = new FlashExecutor({
            apiKeys: ['keyA', 'keyB']
        });

        // Disable credit monitor for test
        executor.stop();

        // Mock _makeRequest to capture the URL used
        const requests = [];
        executor._makeRequest = (options, cb) => {
            requests.push(options.path);

            // Return a mock request object
            const req = new EventEmitter();
            req.setTimeout = () => {};
            req.write = () => {};
            req.end = () => {
                // Return a mock response
                const res = new EventEmitter();
                res.statusCode = 200;
                cb(res);
                process.nextTick(() => {
                    res.emit('data', JSON.stringify({
                        candidates: [{ content: { parts: [{ text: 'Response' }] } }],
                        usageMetadata: { totalTokenCount: 10 }
                    }));
                    res.emit('end');
                });
            };
            return req;
        };

        // First call
        await executor.execute({ title: 'Task 1' });
        // Second call
        await executor.execute({ title: 'Task 2' });
        // Third call (should loop back to A)
        await executor.execute({ title: 'Task 3' });

        assert.strictEqual(requests.length, 3);
        assert.match(requests[0], /key=keyA/);
        assert.match(requests[1], /key=keyB/);
        assert.match(requests[2], /key=keyA/);
    });

    it('should rotate key even if request fails', async () => {
        const executor = new FlashExecutor({
            apiKeys: ['key1', 'key2']
        });
        executor.stop();

        const requests = [];
        executor._makeRequest = (options, cb) => {
            requests.push(options.path);
            const req = new EventEmitter();
            req.setTimeout = () => {};
            req.write = () => {};
            req.end = () => {
                const res = new EventEmitter();
                res.statusCode = 500; // Fail
                cb(res);
                process.nextTick(() => {
                    res.emit('data', 'Error');
                    res.emit('end');
                });
            };
            return req;
        };

        await executor.execute({ title: 'Task 1' }); // Fails with key1
        await executor.execute({ title: 'Task 2' }); // Fails with key2

        assert.match(requests[0], /key=key1/);
        assert.match(requests[1], /key=key2/);
    });
});
