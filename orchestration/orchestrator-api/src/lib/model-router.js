import { RateGuard } from './rate-guard.js';

/**
 * Model Router for SWARM CI/CD 2.0
 * Decides the optimal execution path based on complexity and availability.
 */
export async function getOptimalPath(classification) {
    const { complexity, domain } = classification;

    // Complexity thresholds
    const GROK_THRESHOLD = 0.75;
    const PIPELINE_5AGENT_THRESHOLD = 0.90;

    // 1. Check Primary: Gemini Flash
    const geminiStatus = await RateGuard.check('google/gemini-2.0-flash-001');

    if (complexity < GROK_THRESHOLD && geminiStatus.allowed) {
        return { path: 'GEMINI_FLASH', model: 'google/gemini-2.0-flash-001' };
    }

    // 2. Check Fallback: Grok
    const grokStatus = await RateGuard.check('grok-beta', 'xAI');

    if (complexity < PIPELINE_5AGENT_THRESHOLD && grokStatus.allowed) {
        return { path: 'GROK_FALLBACK', model: 'grok-beta' };
    }

    // 3. Last Resort or High Complexity: 5-Agent Pipeline (Self-correcting)
    // Even if Gemini is rate limited, the pipeline can wait or use different accounts
    return { path: 'PIPELINE_5AGENTS', model: 'multi-agent-swarm' };
}
