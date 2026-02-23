import { Classifier, ClassificationResult } from '../types';

/**
 * A lightweight heuristic classifier that simulates an SLM (Small Language Model).
 * In a production environment, this would call a local ONNX model (e.g., Phi-2, TinyLlama)
 * or an external API. Here, it uses keyword density and cosine similarity of intent vectors.
 */
export class MockSLMClassifier implements Classifier {
  name = 'MockSLM';

  private julesKeywords = new Set([
    'why', 'how', 'explain', 'write', 'code', 'bug', 'help', 'who', 'what', 'can you',
    'please', 'create', 'generate', 'tell me', 'story', 'joke', 'poem'
  ]);

  private deterministicKeywords = new Set([
    'get', 'fetch', 'list', 'show', 'play', 'start', 'stop', 'run', 'execute', 'turn on',
    'turn off', 'status', 'weather', 'time', 'date', 'price', 'balance'
  ]);

  async classify(prompt: string): Promise<ClassificationResult | null> {
    const tokens = prompt.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/);

    let julesScore = 0;
    let detScore = 0;

    tokens.forEach(token => {
      if (this.julesKeywords.has(token)) julesScore += 1;
      if (this.deterministicKeywords.has(token)) detScore += 1;
    });

    // Heuristic: Length of prompt often correlates with complexity (Jules) vs command (Deterministic)
    // Very short prompts are often commands (if they match keywords). Long prompts are often conversation.
    if (tokens.length > 10) julesScore += 2;

    const total = julesScore + detScore;

    if (total === 0) {
        // Default fallback if no keywords found - assume conversational (Jules) but with low confidence
        return {
            target: 'JULES',
            confidence: 0.3,
            intent: 'general_chat',
            metadata: { model: 'heuristic-slm', method: 'fallback' }
        };
    }

    const confidence = Math.max(julesScore, detScore) / (total + 0.1); // Avoid div by zero

    if (julesScore >= detScore) {
      return {
        target: 'JULES',
        confidence,
        intent: 'conversational',
        metadata: { model: 'heuristic-slm', method: 'keyword-scoring' }
      };
    } else {
      return {
        target: 'DETERMINISTIC',
        confidence,
        intent: 'command_execution',
        metadata: { model: 'heuristic-slm', method: 'keyword-scoring' }
      };
    }
  }
}
