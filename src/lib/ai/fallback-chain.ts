import { AIModelClient } from './types';

export class FallbackChain implements AIModelClient {
    name = 'FallbackChain';
    private clients: AIModelClient[];

    constructor(clients: AIModelClient[]) {
        if (clients.length === 0) {
            throw new Error('FallbackChain requires at least one client.');
        }
        this.clients = clients;
    }

    async generateContent(prompt: string): Promise<string> {
        const errors: Error[] = [];
        for (const client of this.clients) {
            try {
                // console.log(`Attempting to use model: ${client.name}`);
                return await client.generateContent(prompt);
            } catch (error) {
                console.warn(`Model ${client.name} failed:`, error);
                errors.push(error instanceof Error ? error : new Error(String(error)));
            }
        }

        throw new Error(`All models in the chain failed. Errors: ${errors.map(e => e.message).join(', ')}`);
    }
}
