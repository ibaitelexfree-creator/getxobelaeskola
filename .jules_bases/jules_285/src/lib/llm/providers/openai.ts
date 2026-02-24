import { LLMProvider, LLMMessage, LLMRequestConfig, LLMResponse, LLMError } from '../types';

export class OpenAIProvider implements LLMProvider {
    private readonly API_URL = 'https://api.openai.com/v1/chat/completions';
    private readonly DEFAULT_MODEL = 'gpt-3.5-turbo';

    async chatCompletion(messages: LLMMessage[], config?: LLMRequestConfig): Promise<LLMResponse> {
        if (!config?.apiKey) {
            throw new Error('API key is required for OpenAI provider');
        }

        const payload = {
            model: config.model || this.DEFAULT_MODEL,
            messages: messages,
            temperature: config.temperature ?? 0.7,
            max_tokens: config.max_tokens,
            top_p: config.top_p,
            frequency_penalty: config.frequency_penalty,
            presence_penalty: config.presence_penalty,
            stream: config.stream ?? false
        };

        try {
            const response = await fetch(this.API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${config.apiKey}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const error = new Error(`OpenAI API Error: ${response.status} ${response.statusText}`) as LLMError;
                error.status = response.status;
                error.code = errorData?.error?.code || 'unknown_error';

                // Determine if retryable
                // 429: Rate Limit
                // 500, 503: Server Error
                if (response.status === 429 || response.status >= 500) {
                    error.isRetryable = true;
                } else {
                    error.isRetryable = false;
                }

                throw error;
            }

            const data = await response.json();
            const choice = data.choices[0];

            return {
                content: choice.message.content,
                role: choice.message.role,
                model: data.model,
                usage: data.usage
            };

        } catch (err: any) {
            // Re-throw if it's already an LLMError
            if ((err as LLMError).status) {
                throw err;
            }

            // Network errors or other fetch failures are generally retryable
            const error = new Error(err.message || 'Unknown network error') as LLMError;
            error.isRetryable = true;
            throw error;
        }
    }
}
