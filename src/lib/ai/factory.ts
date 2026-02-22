import { FallbackChain } from './fallback-chain';
import { GeminiClient } from './gemini-client';
import { MockClient } from './mock-client';
import { AIModelClient } from './types';

export function createAIClient(): AIModelClient {
    const clients: AIModelClient[] = [];

    // Primary: Gemini
    const googleApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY;
    if (googleApiKey) {
        try {
            clients.push(new GeminiClient({ apiKey: googleApiKey }));
        } catch (error) {
            console.error('Failed to initialize GeminiClient:', error);
        }
    } else {
        console.warn('No GOOGLE_GENERATIVE_AI_API_KEY found, skipping GeminiClient.');
    }

    // Secondary: Mock (always available as last resort in dev, or if configured)
    if (process.env.NODE_ENV === 'development' || process.env.ENABLE_MOCK_AI === 'true') {
        clients.push(new MockClient(false, 'This is a mock response from the fallback chain.'));
    }

    if (clients.length === 0) {
        // If no clients are available, we must return a MockClient that explains the situation
        // or throw an error. For robustness, a MockClient with an error message might be better
        // to prevent crash on startup, but generateContent will return that message.
        console.warn('No AI clients configured. Using a fallback MockClient.');
        clients.push(new MockClient(false, 'AI Service is currently unavailable (No providers configured).'));
    }

    return new FallbackChain(clients);
}
