import { callOpenRouter } from './openrouter-client.js';
import { searchContext } from './qdrant-client.js';

/**
 * Task Classifier for SWARM CI/CD 2.0
 * Analyzes prompts to determine complexity, required agents, and context.
 */
export async function classifyTask(prompt) {
    // 1. Get similar past errors or solutions from RAG
    const contextRows = await searchContext('errors-solutions', prompt, 3);
    const context = contextRows.map(r => r.content).join('\n---\n');

    const systemPrompt = `
You are the Swarm Intelligence Classifier (v2.1).
Analyze the developer request carefully. Use the provided context to see how similar tasks were handled.

CRITERIA:
- Complexity > 0.7: If the task involves structural changes, multiple files, or security implications.
- Complexity < 0.3: For simple bug fixes, UI tweaks, or documentation.
- Domain "Architect": Project structure, core logic, DevOps, security.
- Domain "Data": DB schemas, API endpoints, JSON handling, logic.
- Domain "UI": Components, CSS, React hooks, accessibility.

REQUIRED OUTPUT:
JSON matching exactly this schema:
{
  "domain": "Architect | Data | UI",
  "complexity": 0.0-1.0,
  "suggested_agents": ["ARCHITECT", "DATA", "UI"],
  "criticality": "HIGH | MEDIUM | LOW",
  "chain_of_thought": "Your internal logic step-by-step",
  "reasoning": "Final user-facing explanation",
  "rag_relevance": "How helpful the context was (0-1)"
}

Context from memory (RAG):
${context || 'No relevant context found.'}
`;

    try {
        const result = await callOpenRouter({
            model: process.env.OPENROUTER_CLASSIFIER_MODEL || process.env.OPENROUTER_MODEL,
            prompt: `Analyze this request: "${prompt}"`,
            systemPrompt,
            temperature: 0.1,
            jsonMode: true
        });

        return result;
    } catch (error) {
        console.error('Classification Error:', error.message);
        // Fallback safe classification
        return {
            domain: "Architect",
            complexity: 0.5,
            suggested_agents: ["ARCHITECT"],
            criticality: "MEDIUM",
            reasoning: "Fallback due to classification error"
        };
    }
}
