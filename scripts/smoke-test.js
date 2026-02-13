// @ts-check
const fetch = globalThis.fetch;

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://getxobelaeskola.cloud';

async function checkUrl(path) {
    const url = `${BASE_URL}${path}`;
    try {
        const start = Date.now();
        const response = await fetch(url);
        const duration = Date.now() - start;

        const status = response.status;
        const ok = response.ok;

        console.log(`[${ok ? 'PASS' : 'FAIL'}] ${path} - Status: ${status} (${duration}ms)`);

        if (!ok) {
            console.error(`      -> Error details: ${response.statusText}`);
        }

        return ok;
    } catch (error) {
        console.error(`[ERROR] ${path} - Connection failed: ${error.message}`);
        return false;
    }
}

async function runSmokeTest() {
    console.log('--- Starting Smoke Test ---');
    console.log(`Target: ${BASE_URL}\n`);

    // Give server a moment to be ready if just started
    // await new Promise(r => setTimeout(r, 2000));

    const paths = [
        '/',
        '/es',
        '/es/login',
        '/es/about',
        '/sitemap.xml',
        '/robots.txt'
    ];

    let passed = 0;
    let failed = 0;

    for (const path of paths) {
        const isOk = await checkUrl(path);
        if (isOk) passed++;
        else failed++;
    }

    console.log('\n--- Test Summary ---');
    console.log(`Total: ${paths.length}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);

    if (failed > 0) {
        console.error('Smoke Test FAILED');
        process.exit(1);
    } else {
        console.log('Smoke Test PASSED');
        process.exit(0);
    }
}

runSmokeTest();
