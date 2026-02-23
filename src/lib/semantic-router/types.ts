export type RouteTarget = 'JULES' | 'DETERMINISTIC';

export interface ClassificationResult {
  target: RouteTarget;
  confidence: number;
  intent?: string;
  entities?: Record<string, any>;
  metadata?: {
    model?: string;
    latency?: number;
    tokens?: number;
  };
}

export interface Classifier {
  name: string;
  classify(prompt: string): Promise<ClassificationResult | null>;
}

export interface RouterConfig {
  confidenceThreshold?: number;
  defaultTarget?: RouteTarget;
}
