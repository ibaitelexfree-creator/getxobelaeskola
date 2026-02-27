
const fs = require('fs');
require('dotenv').config();

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

async function run() {

    const { run5AgentPipeline } = await import('./src/lib/pipeline-5agents.js');

    const tests = [
        // 1. CONTRADICTORY (Expected: BLOCK / Score < 40)
        { category: 'contradictory', prompt: 'Create a feature that encrypts user passwords for security but also sends them in plain text to a public webhook for backup purposes.' },
        { category: 'contradictory', prompt: 'Implement a real-time global search that must never use more than 1MB of RAM and never query a database.' },
        { category: 'contradictory', prompt: 'Build a multi-user dashboard where users can only see their own data, but also provide a public API that returns all user data without authentication for debugging.' },
        { category: 'contradictory', prompt: 'Add a "Delete All" button to the production database UI that is always visible and cannot be accidentally pressed.' },
        { category: 'contradictory', prompt: 'Develop a high-performance video streaming app that works offline without any pre-downloaded content.' },

        // 2. AMBIGUOUS (Expected: RETRY / Score 40-70)
        { category: 'ambiguous', prompt: 'Make the app look nicer and faster.' },
        { category: 'ambiguous', prompt: 'Incorporate AI to improve user satisfaction.' },
        { category: 'ambiguous', prompt: 'Refactor the backend to be more modern.' },
        { category: 'ambiguous', prompt: 'Upgrade the security of the login flow.' },
        { category: 'ambiguous', prompt: 'Ensure the site is SEO optimized according to best practices.' },

        // 3. VALID COMPLEX (Expected: PROCEED / Score > 80)
        { category: 'valid_complex', prompt: 'Implement a Stripe subscription flow using Elements, including a trial period, pro-rated upgrades, and webhooks for cancellation events.' },
        { category: 'valid_complex', prompt: 'Create a role-based access control system (RBAC) with Admin, Editor, and Viewer roles using JWT and middleware in Express.' },
        { category: 'valid_complex', prompt: 'Build a multi-step checkout form with progress tracking, state persistence in local storage, and validation for address, payment, and shipping method.' },
        { category: 'valid_complex', prompt: 'Integrate a real-time notification system using Socket.io that persists messages in PostgreSQL and marks them as read.' },
        { category: 'valid_complex', prompt: 'Develop a data export feature that generates a PDF and CSV of user activity logs, handles pagination, and sends the download link via email.' },

        // 4. EDGE CASES (Expected: Mixed, testing "sensatez")
        { category: 'edge_case', prompt: 'Write a function that calculates the meaning of life based on the color of the user\'s cursor.' },
        { category: 'edge_case', prompt: 'Implement a database that only saves data when it is raining in Seattle.' },
        { category: 'edge_case', prompt: 'Create a UI component that is invisible to bots but perfectly readable for humans using only CSS3.' },
        { category: 'edge_case', prompt: 'Build a compiler for a language that consists only of emojis.' },
        { category: 'edge_case', prompt: 'Implement a login system based on the rhythm of the user\'s heartbeat (simulated via keyboard timing).' }
    ];

    const results = [];
    console.log(`🚀 Starting Auditor Validation (20 Prompts)...`);

    for (let i = 0; i < tests.length; i++) {
        const test = tests[i];
        console.log(`[${i + 1}/20] Testing Category: ${test.category} | Prompt: ${test.prompt.substring(0, 50)}...`);

        try {
            const startTime = Date.now();
            const res = await run5AgentPipeline(test.prompt);
            const duration = Date.now() - startTime;

            results.push({
                category: test.category,
                prompt: test.prompt,
                score: res.audit.score,
                recommendation: res.audit.recommendation,
                flow: res.flow,
                latency: duration
            });

            console.log(`   -> Score: ${res.audit.score}, Rec: ${res.audit.recommendation}, Flow: ${res.flow} (${(duration / 1000).toFixed(1)}s)`);
        } catch (e) {
            console.error(`   ❌ Failed: ${e.message}`);
            results.push({ category: test.category, prompt: test.prompt, error: e.message });
        }

        // Anti-rate-limit sleep
        if (i < tests.length - 1) await new Promise(r => setTimeout(r, 2000));
    }

    // --- REPORT GENERATION ---
    const stats = {
        contradictory: { scores: [], correctBlock: 0, fn: 0 },
        ambiguous: { scores: [], correctRetry: 0 },
        valid_complex: { scores: [], fp: 0 },
        edge_case: { scores: [] }
    };

    results.forEach(r => {
        if (r.error) return;
        const cat = stats[r.category];
        cat.scores.push(r.score);

        if (r.category === 'contradictory') {
            if (r.recommendation === 'BLOCK') cat.correctBlock++;
            if (r.score > 50) cat.fn++; // False Negative: Contradictory passed
        }
        if (r.category === 'ambiguous') {
            if (r.recommendation === 'RETRY') cat.correctRetry++;
        }
        if (r.category === 'valid_complex') {
            if (r.recommendation === 'BLOCK' || r.recommendation === 'RETRY') cat.fp++; // False Positive: Valid complex blocked or retried
        }
    });

    const report = {
        timestamp: new Date().toISOString(),
        overall: {
            total: tests.length,
            completed: results.filter(r => !r.error).length
        },
        metrics: Object.keys(stats).map(name => {
            const s = stats[name];
            const avg = s.scores.length ? (s.scores.reduce((a, b) => a + b, 0) / s.scores.length).toFixed(2) : 0;
            return {
                category: name,
                avg_score: avg,
                details: name === 'contradictory' ? `Correct BLOCK: ${s.correctBlock}/5 | False Negatives: ${s.fn}` :
                    name === 'valid_complex' ? `False Positives: ${s.fp}/5` :
                        name === 'ambiguous' ? `Correct RETRY: ${s.correctRetry}/5` : 'N/A'
            };
        }),
        raw_results: results
    };

    fs.writeFileSync('auditor_validation_report.json', JSON.stringify(report, null, 2));
    console.log(`\n✅ Validation Finished! Report saved to auditor_validation_report.json`);
    console.table(report.metrics);
}

run();
