export type LLMRole = 'system' | 'user' | 'assistant';

export interface LLMMessage {
    role: LLMRole;
    content: string;
}

export interface LLMResponse {
    content: string;
    usage?: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
    model: string;
    role: LLMRole;
}

export interface LLMRequestConfig {
    temperature?: number;
    max_tokens?: number;
    top_p?: number;
    frequency_penalty?: number;
    presence_penalty?: number;
    model?: string;
    stream?: boolean;
    apiKey?: string; // Added apiKey here
}

export interface LLMError extends Error {
    status?: number;
    code?: string;
    isRetryable?: boolean;
}

export interface KeyRotator {
    getNextKey(): string;
    reportFailure(key: string): void;
    reportSuccess(key: string): void;
}

export interface LLMProvider {
    chatCompletion(messages: LLMMessage[], config?: LLMRequestConfig): Promise<LLMResponse>;
}
