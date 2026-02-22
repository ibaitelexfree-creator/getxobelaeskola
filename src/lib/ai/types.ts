export interface AIModelClient {
    name: string;
    generateContent(prompt: string): Promise<string>;
}

export interface AIModelConfig {
    apiKey: string;
    modelName?: string;
}
