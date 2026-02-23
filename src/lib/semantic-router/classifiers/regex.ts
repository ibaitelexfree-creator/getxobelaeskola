import { Classifier, ClassificationResult } from '../types';

interface Pattern {
  regex: RegExp;
  intent: string;
  target: 'DETERMINISTIC' | 'JULES';
}

export class RegexClassifier implements Classifier {
  name = 'RegexHeuristic';
  private patterns: Pattern[];

  constructor() {
    this.patterns = [
      // Allow optional leading slash for all commands
      { regex: /^\/?weather/i, intent: 'get_weather', target: 'DETERMINISTIC' },
      { regex: /^\/?status/i, intent: 'get_status', target: 'DETERMINISTIC' },
      { regex: /^\/?version/i, intent: 'get_version', target: 'DETERMINISTIC' },
      { regex: /^\/?calculate/i, intent: 'calculator', target: 'DETERMINISTIC' },
      { regex: /^\/?echo/i, intent: 'echo', target: 'DETERMINISTIC' },
    ];
  }

  async classify(prompt: string): Promise<ClassificationResult | null> {
    const trimmed = prompt.trim();

    for (const pattern of this.patterns) {
      if (pattern.regex.test(trimmed)) {
        return {
          target: pattern.target,
          confidence: 1.0, // Regex is exact match
          intent: pattern.intent,
          metadata: {
            model: 'regex-heuristic'
          }
        };
      }
    }

    return null;
  }
}
