import { KeyRotator } from './types';

// Global index to maintain state across warm starts in serverless environment
let globalKeyIndex = 0;

export class RoundRobinRotator implements KeyRotator {
    private keys: string[];

    constructor(keys?: string[]) {
        if (keys && keys.length > 0) {
            this.keys = keys;
        } else {
            // Load from environment variables
            const envKeys = process.env.OPENAI_API_KEYS;
            if (envKeys) {
                this.keys = envKeys.split(',').map(k => k.trim()).filter(k => k.length > 0);
            } else {
                const singleKey = process.env.OPENAI_API_KEY;
                if (singleKey) {
                    this.keys = [singleKey];
                } else {
                    console.warn('No OpenAI API keys found in environment variables (OPENAI_API_KEYS or OPENAI_API_KEY).');
                    this.keys = [];
                }
            }
        }
    }

    public getNextKey(): string {
        if (this.keys.length === 0) {
            throw new Error('No API keys available for rotation.');
        }

        const key = this.keys[globalKeyIndex % this.keys.length];

        // Advance index for next call (Round Robin)
        globalKeyIndex++;

        return key;
    }

    public reportFailure(key: string): void {
        // Optional: Implement logic to temporarily disable a key if it fails consistently.
        // For simple Round Robin, we just log it.
        console.warn(`[KeyRotator] Key ending in ...${key.slice(-4)} reported failure.`);
    }

    public reportSuccess(key: string): void {
        // Optional: Track success metrics.
    }

    public get availableKeysCount(): number {
        return this.keys.length;
    }
}
