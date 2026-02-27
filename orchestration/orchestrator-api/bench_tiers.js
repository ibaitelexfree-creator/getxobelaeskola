
import { run5AgentPipeline } from './src/lib/pipeline-5agents.js';
import { getTierReport } from './src/lib/operational-monitor.js';

async function runTest() {
    console.log("🚀 Starting Tier Distribution Validation...\n");

    const prompts = [
        "Fix a small typo in the header", // Tier 1 (Short)
        "Implement a Stripe subscription flow using Elements, including a trial period and pro-rated upgrades.", // Tier 2 (Long)
        "Hello", // Tier 1
        "What is the capital of France?", // Tier 1
        "Build a multi-agent orchestration platform that routes tasks, handles database persistence via Supabase, integrates open-source LLMs running locally, and provides a real-time React dashboard with WebSockets for tracing token usage and error logs.", // Tier 2 (Long)
    ];

    for (let i = 0; i < prompts.length; i++) {
        console.log(`[${i + 1}/${prompts.length}] Testing: ${prompts[i].substring(0, 50)}...`);
        try {
            await run5AgentPipeline(prompts[i]);
        } catch (e) {
            console.error(e.message);
        }
    }

    console.log("\n📊 Simulated 4H Distribution Report:");
    console.log(JSON.stringify(getTierReport(), null, 2));

    process.exit(0);
}
runTest();
