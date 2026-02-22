import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { AIModelClient, AIModelConfig } from './types';

export class GeminiClient implements AIModelClient {
    name = 'Gemini';
    private model: GenerativeModel;

    constructor(config: AIModelConfig) {
        if (!config.apiKey) {
            throw new Error('GeminiClient requires an apiKey.');
        }
        const genAI = new GoogleGenerativeAI(config.apiKey);
        this.model = genAI.getGenerativeModel({ model: config.modelName || 'gemini-1.5-flash' });
    }

    async generateContent(prompt: string): Promise<string> {
        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error('Gemini API Error:', error);
            throw error;
        }
    }
}
