import { searchContext, storeContext } from './qdrant-client.js';
import axios from 'axios';

async function callOpenRouter(prompt, systemPrompt) {
    const apiKey = process.env.OPEN_ROUTER_API_KEY;
    if (!apiKey) throw new Error('OPEN_ROUTER_API_KEY is missing');

    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
        model: process.env.OPENROUTER_RCA_MODEL || process.env.OPENROUTER_MODEL || 'qwen/qwen3-next-80b-a3b-instruct:free',
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
        ]
    }, {
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        }
    });
    return response.data.choices[0].message.content;
}

async function callGroq(prompt, systemPrompt) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error('GROQ_API_KEY is missing');

    const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
        model: 'llama-3.3-70b-versatile',
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
        ]
    }, {
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        }
    });
    return response.data.choices[0].message.content;
}

async function callXAI(prompt, systemPrompt) {
    const { callGrok } = await import('./xai-client.js');
    return await callGrok({ prompt, systemPrompt });
}

export async function analyzeWithRcaEngine(errorLog, taskDescription, phase = 'UNKNOWN', swarmId = null) {
    const provider = process.env.RCA_PROVIDER || 'openrouter';
    const contextRows = await searchContext('audit-history', errorLog, 3);
    const context = contextRows.map(r => r.content || r.text).join('\n---\n');

    const systemPrompt = `You are the RCA (Root Cause Analyzer) Engine. 
Your task is to identify WHY an AI agent failed and provide a surgical fix.
PRINCIPLE: Intellectual Honesty. If the Error Log is truncated or insufficient, explicitly state uncertainty.
ECONOMY PRINCIPLE: Prioritize surgical, minimal fixes. Avoid suggesting re-architecting if a simple index or small code tweak suffices. 
Keep recommendations under 150 words to minimize token burn.`;

    const prompt = `Original Task: ${taskDescription}
Error Log: ${errorLog}
Historical Context: ${context}

Explain the root cause and provide a specific correction for the next agent iteration.`;

    let rcaContent = "";

    try {
        console.log(`[RCA Engine] Dispatching RCA analysis using provider: ${provider}`);
        if (provider === 'groq') {
            rcaContent = await callGroq(prompt, systemPrompt);
        } else if (provider === 'xai') {
            rcaContent = await callXAI(prompt, systemPrompt);
        } else {
            rcaContent = await callOpenRouter(prompt, systemPrompt);
        }
    } catch (error) {
        console.error(`[RCA Engine] ${provider.toUpperCase()} RCA Failed:`, error.message);

        // Generate Minimal Structural RCA
        const isTimeout = errorLog.includes('timed out');
        const autoDiagnosis = isTimeout
            ? "Agent exceeded time limit without emitting FAIL. Timeout triggered."
            : "Agent crashed or hit an infrastructure error.";

        const minimalStruct = JSON.stringify({
            type: isTimeout ? 'TIMEOUT' : 'INFRA_ERROR',
            phase,
            auto_diagnosis: autoDiagnosis,
            rca_provider: provider
        });

        rcaContent = `${provider.toUpperCase()} Fallback failed. Generated Minimal Structural RCA: ${minimalStruct}`;

        // Force store the fallback in Qdrant right away
        await storeContext('audit-history', null, rcaContent, {
            type: isTimeout ? 'TIMEOUT' : 'INFRA_ERROR',
            phase,
            swarm_id: swarmId || 'unknown',
            rca_provider: provider
        });

        return rcaContent;
    }

    // Try storing the successful RCA to Qdrant
    try {
        await storeContext('audit-history', null, rcaContent, {
            type: 'SEMANTIC_RCA',
            phase,
            swarm_id: swarmId || 'unknown',
            rca_provider: provider
        });
    } catch (e) {
        console.warn('[RCA Engine] Failed to persist valid RCA to Qdrant:', e.message);
    }

    return rcaContent;
}
