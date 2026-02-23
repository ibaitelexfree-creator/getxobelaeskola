export * from './types';
export * from './classifiers/regex';
export * from './classifiers/slm';

import { RegexClassifier } from './classifiers/regex';
import { MockSLMClassifier } from './classifiers/slm';
import { ClassificationResult } from './types';

export class SemanticRouter {
  private regexClassifier: RegexClassifier;
  private slmClassifier: MockSLMClassifier;
  private defaultConfidenceThreshold = 0.5;

  constructor() {
    this.regexClassifier = new RegexClassifier();
    this.slmClassifier = new MockSLMClassifier();
  }

  /**
   * Routes the incoming prompt to either 'JULES' or 'DETERMINISTIC'.
   * Strategy:
   * 1. Check Regex (Exact Pattern Match) -> High Precision.
   * 2. Check SLM (Heuristic/AI) -> General Intent.
   * 3. Fallback -> 'JULES' (Default handler for unclassified inputs).
   */
  async route(prompt: string): Promise<ClassificationResult> {
    // 1. Regex Classification (Fast, Deterministic)
    const regexResult = await this.regexClassifier.classify(prompt);
    if (regexResult) {
        // Regex is high confidence
        return regexResult;
    }

    // 2. SLM Classification (Flexible, Probabilistic)
    const slmResult = await this.slmClassifier.classify(prompt);
    if (slmResult && slmResult.confidence >= this.defaultConfidenceThreshold) {
        return slmResult;
    }

    // 3. Fallback (Default to Jules for conversation)
    return {
        target: 'JULES',
        confidence: 0.1,
        intent: 'fallback_chat',
        metadata: { method: 'default-fallback' }
    };
  }
}

export const semanticRouter = new SemanticRouter();
