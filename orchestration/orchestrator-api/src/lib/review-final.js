import { callOpenRouter } from './openrouter-client.js';

/**
 * Final Code Reviewer for SWARM CI/CD 2.0
 */
export async function performFinalReview(diff, prompt) {
    const systemPrompt = `
You are the Senior Swarm Reviewer.
Review the code changes against the original request.
Ensure there are no security vulnerabilities, syntax errors, or design inconsistencies.

RESPONSE FORMAT: JSON
{
  "approved": true | false,
  "score": 0-100,
  "feedback": "...",
  "critical_fixes": ["..."]
}
`;

    const userPrompt = `
Original Request: ${prompt}
Code Diff:
${diff}
`;

    try {
        return await callOpenRouter({
            model: process.env.OPENROUTER_REVIEW_MODEL || process.env.OPENROUTER_MODEL,
            prompt: userPrompt,
            systemPrompt,
            temperature: 0.1,
            jsonMode: true
        });
    } catch (error) {
        console.error('Final Review Failed:', error.message);
        return { approved: false, score: 0, feedback: "Review system error" };
    }
}
