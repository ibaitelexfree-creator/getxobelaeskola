import { AIModelClient } from './types';

export class MockClient implements AIModelClient {
    name = 'MockClient';
    private shouldFail: boolean;
    private response: string;

    constructor(shouldFail: boolean = false, response: string = 'Mock response') {
        this.shouldFail = shouldFail;
        this.response = response;
    }

    async generateContent(prompt: string): Promise<string> {
        if (this.shouldFail) {
            throw new Error('MockClient configured to fail.');
        }
        return this.response;
    }
}
