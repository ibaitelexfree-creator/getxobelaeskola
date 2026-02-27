import axios from 'axios';
import { recordJobEvent } from './canary-controller.js';
import fs from 'fs';
import path from 'path';
import { ACCOUNTS_MAP, ACCOUNT_ROLES, buildAuthHeaders } from '../account-health.js';
import { searchContext } from './qdrant-client.js';
import { RateGuard } from './rate-guard.js';
import { analyzeWithRcaEngine } from './rca-engine.js';
import { run5AgentPipeline } from './pipeline-5agents.js';

const JULES_API_URL = 'https://jules.googleapis.com/v1alpha/sessions';

/**
 * Jules specialized executor for CI/CD 2.0
 */
export async function executeSpecializedJules(role, taskDescription, swarmId, taskId, accumulatedContext = '') {
    // 1. Resolve Account by Role
    const email = resolveAccountByRole(role);
    const apiKey = ACCOUNTS_MAP[email];

    if (!apiKey) throw new Error(`API Key for ${email} (Role: ${role}) not found.`);

    // 2. Load specialized prompt
    const promptTemplate = fs.readFileSync(path.join(process.cwd(), 'prompts', `jules-${role.toLowerCase()}.md`), 'utf8');

    // 3. Get RAG Context
    const contextRows = await searchContext(`jules-${role.toLowerCase()}`, taskDescription);
    const context = contextRows.map(r => r.content || r.text).join('\n---\n');

    // 4. Rate Guard Check (Active Waiting)
    await RateGuard.waitIfNeeded('google/gemini-2.0-flash-001', 'Google');

    // 5. Build Final Prompt (with Context Trimming to avoid token limits)
    // Trim accumulated context to last 5000 characters if too long
    const trimmedAccumulated = accumulatedContext.length > 5000
        ? '... (truncated) ...' + accumulatedContext.slice(-5000)
        : accumulatedContext;

    const finalPrompt = `
${promptTemplate}

CONTEXTO ADICIONAL (RAG):
${context}

${trimmedAccumulated ? `RESULTADOS DE AGENTES PREVIOS:\n${trimmedAccumulated}\n` : ''}

TAREA ACTUAL:
${taskDescription}

SWARM_ID: ${swarmId}
TASK_ID: ${taskId}

Recuerda responder estrictamente en el formato JSON solicitado.
`;

    let sessionId = null;
    let finalSession = null;

    try {
        const response = await axios.post(JULES_API_URL, {
            prompt: finalPrompt,
            sourceContext: {
                source: process.env.JULES_DEFAULT_SOURCE || 'sources/github/ibaitelexfree-creator/getxobelaeskola',
                githubRepoContext: { startingBranch: 'main' }
            },
            automationMode: 'AUTO_CREATE_PR'
        }, {
            headers: buildAuthHeaders(apiKey),
            timeout: 45000
        });

        await RateGuard.register('google/gemini-2.0-flash-001', 'Google', true);

        sessionId = response.data.name;
        console.log(`[Swarm] Phase ${role} started: ${sessionId}. Waiting for completion...`);

        // 6. Polling for Completion (Configurable Timeout)
        const startTime = Date.now();
        const timeout = role === 'ARCHITECT' ? 180000 : parseInt(process.env.JULES_POLLING_TIMEOUT) || 600000; // 180s max for Architect


        while (Date.now() - startTime < timeout) {
            // Exponential Backoff Polling (3s -> 6s -> 12s -> 20s max)
            const elapsed = Date.now() - startTime;
            let pollInterval = 3000;
            if (elapsed > 60000) pollInterval = 20000;
            else if (elapsed > 30000) pollInterval = 10000;
            else if (elapsed > 10000) pollInterval = 5000;

            await new Promise(r => setTimeout(r, pollInterval));

            const statusRes = await axios.get(`https://jules.googleapis.com/v1alpha/${sessionId}`, {
                headers: buildAuthHeaders(apiKey)
            });

            finalSession = statusRes.data;

            // Early Fast-Fail or Success Interception
            const hasFail = finalSession.result && (finalSession.result.includes('"vote": "FAIL"') || finalSession.result.includes('"vote":"FAIL"'));
            const hasOk = finalSession.result && (finalSession.result.includes('"vote": "OK"') || finalSession.result.includes('"vote":"OK"'));

            if (hasFail || hasOk) {
                console.log(`[Swarm] Decisive vote detected in partial stream for ${role}. Finishing session...`);
                try {
                    await axios.post(`https://jules.googleapis.com/v1alpha/${sessionId}:cancel`, {}, { headers: buildAuthHeaders(apiKey) });
                } catch (e) { }
                break;
            }

            if (['COMPLETED', 'FAILED', 'CANCELLED'].includes(finalSession.state)) break;
        }

        if (finalSession.state !== 'COMPLETED' && !finalSession.result?.includes('FAIL')) {
            throw new Error(`Jules ${role} failed or timed out with state: ${finalSession.state}`);
        }

        // 7. Extract Result and Vote
        const resultText = finalSession.result || '';
        let resultJson = {};
        try {
            const jsonMatch = resultText.match(/```json\n([\s\S]*?)\n```/) || [null, resultText];
            resultJson = JSON.parse(jsonMatch[1].trim());
        } catch (e) {
            console.warn(`[Swarm] Failed to parse JSON from ${role} response. Using raw text.`);
            resultJson = { raw: resultText };
        }

        const vote = (resultJson.vote || resultJson.Vote || 'FAIL').toUpperCase();
        const category = resultJson.category || resultJson.Category || (vote === 'FAIL' ? 'SEMANTIC_FAIL' : null);
        const reason = resultJson.reason || resultJson.vote_reason || resultJson.Reason || (vote === 'FAIL' ? 'Agent rejected task' : 'No reason provided');

        if (vote === 'FAIL') {
            console.log(`[RCA] Agent ${role} voted FAIL semantically. Enhancing diagnosis with RCA Engine...`);
            const rca = await analyzeWithRcaEngine(`Vote: FAIL | Category: ${category} | Reason: ${reason}`, taskDescription, role, swarmId);

            return {
                success: false,
                vote: 'FAIL',
                vote_reason: reason,
                rca, // Attach enhanced RCA analysis
                category,
                sessionId,
                result: resultJson,
                email,
                role
            };
        }

        const cost = resultJson.cost_usd || 0.001; // Default min cost if not provided
        const tokensUsed = resultJson.tokens_used || resultJson.token_usage?.total_tokens || 0;
        const tokensOutput = resultJson.tokens_output || resultJson.token_usage?.output_tokens || (resultText.length / 4);
        recordJobEvent(false, cost, tokensUsed, tokensOutput);
        return {
            success: true,
            vote: 'OK',
            vote_reason: reason,
            category,
            sessionId: sessionId,
            result: resultJson,
            email,
            role
        };
    } catch (error) {
        const statusCode = error.response?.status;
        const errorMessage = error.message;
        const partialResult = finalSession?.result ? ` | Partial Result: ${finalSession.result}` : '';

        // Trigger RCA for any execution or polling failure (except Auth 401)
        if (statusCode !== 401) {
            console.log(`[Fallback] Jules Phase ${role} failed. Triggering RCA Engine for diagnosis...`);
            const rca = await analyzeWithRcaEngine(`${errorMessage}${partialResult} (Role: ${role}, Session: ${sessionId})`, taskDescription, role, swarmId);

            return {
                success: false,
                vote: 'FAIL',
                vote_reason: rca, // Use RCA as the reason
                rca,
                fallback_active: true,
                error: errorMessage,
                category: errorMessage.includes('timed out') ? 'TIMEOUT' : 'EXECUTION_ERROR'
            };
        }

        throw error;
    }
}

function resolveAccountByRole(role) {
    // Mapping roles to specific accounts for specialization
    // Jules 1 (Architect): getxobelaeskola@gmail.com
    // Jules 2 (Data):      ibaitnt@gmail.com
    // Jules 3 (UI):        ibaitelexfree@gmail.com

    const mapping = {
        'ARCHITECT': 'getxobelaeskola@gmail.com',
        'DATA': 'ibaitnt@gmail.com',
        'UI': 'ibaitelexfree@gmail.com'
    };

    return mapping[role.toUpperCase()] || 'ibaitelexfree@gmail.com';
}
