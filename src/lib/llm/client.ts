import { KeyRotator, LLMProvider, LLMMessage, LLMRequestConfig, LLMResponse, LLMError } from './types';
import { OpenAIProvider } from './providers/openai';

export class LLMClient {
    private rotator: KeyRotator;
    private provider: LLMProvider;
    private maxRetries: number;

    constructor(rotator: KeyRotator, provider?: LLMProvider, maxRetries: number = 3) {
        this.rotator = rotator;
        this.provider = provider || new OpenAIProvider();
        this.maxRetries = maxRetries;
    }

    async chatCompletion(messages: LLMMessage[], config?: LLMRequestConfig): Promise<LLMResponse> {
        let lastError: LLMError | null = null;

        // Try up to maxRetries times
        for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
            let currentKey: string;
            try {
                currentKey = this.rotator.getNextKey();
            } catch (e) {
                // If no keys available at all
                throw e;
            }

            try {
                // Inject the current key into the config
                const requestConfig: LLMRequestConfig = {
                    ...config,
                    apiKey: currentKey
                };

                const response = await this.provider.chatCompletion(messages, requestConfig);

                // If successful, report success and return
                this.rotator.reportSuccess(currentKey);
                return response;

            } catch (error: any) {
                const llmError = error as LLMError;
                lastError = llmError;

                // Report failure to rotator
                this.rotator.reportFailure(currentKey);

                const isRetryable = llmError.isRetryable ||
                                   llmError.status === 429 ||
                                   (llmError.status && llmError.status >= 500);

                // If strictly not retryable (like 401 Unauthorized - invalid key?),
                // actually 401 *might* be retryable with a DIFFERENT key!
                // So if it's 401, we SHOULD retry with next key.
                // 400 (Bad Request) is usually not retryable (invalid prompt).

                if (llmError.status === 401) {
                    console.warn(`[LLMClient] Key ...${currentKey.slice(-4)} unauthorized. Retrying with next key.`);
                    continue; // Retry with next key
                }

                if (!isRetryable) {
                    throw llmError;
                }

                console.warn(`[LLMClient] Attempt ${attempt + 1}/${this.maxRetries + 1} failed with key ...${currentKey.slice(-4)}. Error: ${llmError.message}`);

                // If this was the last attempt, throw
                if (attempt === this.maxRetries) {
                    throw lastError;
                }

                // Otherwise continue to next iteration (new key)
            }
        }

        throw lastError || new Error('Unknown error in LLMClient');
    }
}
