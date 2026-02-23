
import { strict as assert } from 'assert';
import { FallbackChain } from '../src/lib/fallback-chain.js';

// Mocks
const mockSuccess = {
    post: async () => ({ status: 200, data: 'primary_ok' }),
    get: async () => ({ status: 200, data: 'primary_ok' })
};

const mockFail429 = {
    post: async () => {
        const err = new Error('Too Many Requests');
        err.response = { status: 429 };
        throw err;
    },
    get: async () => {
        const err = new Error('Too Many Requests');
        err.response = { status: 429 };
        throw err;
    }
};

const mockFail500 = {
    post: async () => {
        const err = new Error('Server Error');
        err.response = { status: 500 };
        throw err;
    }
};

const mockSecondary = {
    post: async () => ({ status: 200, data: 'secondary_ok' }),
    get: async () => ({ status: 200, data: 'secondary_ok' })
};

async function runTests() {
    console.log('Running FallbackChain tests...');

    // Test 1: Primary Success
    {
        const chain = new FallbackChain(mockSuccess, mockSecondary);
        const res = await chain.post('/test', {});
        assert.equal(res.data, 'primary_ok');
        console.log('✅ Test 1 Passed: Primary Success');
    }

    // Test 2: Primary 429 -> Secondary Success
    {
        const chain = new FallbackChain(mockFail429, mockSecondary);
        const res = await chain.post('/test', {});
        assert.equal(res.data, 'secondary_ok');
        console.log('✅ Test 2 Passed: Primary 429 -> Secondary Success');
    }

    // Test 3: Primary 500 -> Throw
    {
        const chain = new FallbackChain(mockFail500, mockSecondary);
        try {
            await chain.post('/test', {});
            console.error('❌ Test 3 Failed: Should have thrown');
            process.exit(1);
        } catch (err) {
            assert.equal(err.response.status, 500);
            console.log('✅ Test 3 Passed: Primary 500 -> Throw');
        }
    }

    // Test 4: GET Primary 429 -> Secondary
    {
        const chain = new FallbackChain(mockFail429, mockSecondary);
        const res = await chain.get('/test');
        assert.equal(res.data, 'secondary_ok');
        console.log('✅ Test 4 Passed: GET Primary 429 -> Secondary');
    }

    console.log('All tests passed!');
}

runTests().catch(err => {
    console.error('Test Runner Failed:', err);
    process.exit(1);
});
