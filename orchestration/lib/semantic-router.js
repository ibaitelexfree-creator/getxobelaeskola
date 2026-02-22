/**
 * Semantic Router Module
 * Routes tasks to Local (Ollama) or Cloud (Jules) based on complexity.
 */

import { ollamaCompletion } from './ollama.js';

// Keywords indicating simple/local tasks
const LOCAL_KEYWORDS = [
  'typo', 'fix typo', 'spelling', 'format', 'lint', 'rename', 'comment',
  'log', 'print', 'console.log', 'variable name', 'small fix', 'simple',
  'function name', 'syntax error', 'indentation'
];

// Keywords indicating complex/cloud tasks
const CLOUD_KEYWORDS = [
  'refactor', 'architect', 'design pattern', 'rewrite', 'restructure',
  'optimize', 'performance', 'security', 'migration', 'database', 'schema',
  'api design', 'integration', 'multi-file', 'feature', 'implement',
  'complex', 'reasoning', 'plan', 'strategy', 'auth', 'authentication'
];

/**
 * Route a task to LOCAL or CLOUD based on complexity
 * @param {string} task - The task description or prompt
 * @param {object} context - Additional context (optional)
 * @param {Function} [completionFn=ollamaCompletion] - Function to use for LLM completion (dependency injection for testing)
 * @returns {Promise<{route: 'LOCAL'|'CLOUD', reason: string, method: 'heuristic'|'llm', confidence: number}>}
 */
export async function routeTask(task, context = {}, completionFn = ollamaCompletion) {
  const taskLower = task.toLowerCase();

  // 1. Heuristic Check (Fast)

  // Check for Cloud keywords (prioritize complexity)
  const cloudMatch = CLOUD_KEYWORDS.find(k => taskLower.includes(k));
  if (cloudMatch) {
    return {
      route: 'CLOUD',
      reason: `Detected complex keyword: "${cloudMatch}"`,
      method: 'heuristic',
      confidence: 0.8
    };
  }

  // Check for Local keywords
  const localMatch = LOCAL_KEYWORDS.find(k => taskLower.includes(k));
  if (localMatch) {
    return {
      route: 'LOCAL',
      reason: `Detected simple keyword: "${localMatch}"`,
      method: 'heuristic',
      confidence: 0.8
    };
  }

  // Check length (very short tasks are usually local, very long are cloud)
  if (task.length < 50) {
    return {
      route: 'LOCAL',
      reason: 'Task description is very short',
      method: 'heuristic',
      confidence: 0.6
    };
  }

  if (task.length > 500) {
    return {
      route: 'CLOUD',
      reason: 'Task description is detailed/long',
      method: 'heuristic',
      confidence: 0.7
    };
  }

  // 2. Semantic Check (LLM) - if enabled and ambiguous
  // We use a small local model to classify
  try {
    const systemPrompt = `You are a routing assistant for a coding agent.
Classify the following task as either 'LOCAL' (simple, single-file, syntax, minor fix) or 'CLOUD' (complex, multi-file, architecture, new feature).
Respond with a JSON object: { "route": "LOCAL" | "CLOUD", "reason": "short explanation" }`;

    const response = await completionFn({
      prompt: task,
      systemPrompt,
      model: 'qwen2.5-coder:7b' // Use a fast local model
    });

    if (response.success && response.content) {
      try {
        // extract JSON from response (handling potential markdown blocks)
        const jsonMatch = response.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const result = JSON.parse(jsonMatch[0]);
          if (result.route && (result.route === 'LOCAL' || result.route === 'CLOUD')) {
            return {
              route: result.route,
              reason: result.reason || 'LLM classification',
              method: 'llm',
              confidence: 0.9
            };
          }
        }
      } catch (parseError) {
        // Fallback if JSON parsing fails
      }
    }
  } catch (error) {
    // Fallback to Cloud if LLM fails (safest option)
    return {
      route: 'CLOUD',
      reason: 'Ambiguous task and LLM classification failed',
      method: 'fallback',
      confidence: 0.5
    };
  }

  // Default fallback
  return {
    route: 'CLOUD',
    reason: 'Ambiguous task, defaulted to Cloud',
    method: 'default',
    confidence: 0.5
  };
}
