import { describe, it, expect } from 'vitest';
import { SemanticRouter } from './index';
import { RegexClassifier } from './classifiers/regex';
import { MockSLMClassifier } from './classifiers/slm';

describe('SemanticRouter', () => {
    it('should classify strict regex commands as DETERMINISTIC', async () => {
        const router = new SemanticRouter();
        const result = await router.route('/weather Bilbao');

        expect(result.target).toBe('DETERMINISTIC');
        expect(result.intent).toBe('get_weather');
        expect(result.confidence).toBe(1.0);
    });

    it('should classify strict regex commands (status) as DETERMINISTIC', async () => {
        const router = new SemanticRouter();
        const result = await router.route('/status');

        expect(result.target).toBe('DETERMINISTIC');
        expect(result.intent).toBe('get_status');
    });

    it('should use SLM Heuristic for natural language (Jules)', async () => {
        const router = new SemanticRouter();
        const result = await router.route('Can you explain the theory of relativity?');

        expect(result.target).toBe('JULES');
        expect(result.intent).toBe('conversational');
        expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should use SLM Heuristic for natural language commands (Deterministic)', async () => {
        const router = new SemanticRouter();
        const result = await router.route('Please fetch the latest price list');

        // "fetch", "list", "price" are deterministic keywords
        expect(result.target).toBe('DETERMINISTIC');
        expect(result.intent).toBe('command_execution');
    });

    it('should handle fallback for ambiguous input', async () => {
         const router = new SemanticRouter();
         // Short, weird input that matches nothing
         const result = await router.route('blorp');

         // Should default to Jules (chat)
         expect(result.target).toBe('JULES');
         expect(result.intent).toBe('fallback_chat'); // Or 'general_chat' depending on implementation details
    });
});

describe('Classifiers', () => {
    it('RegexClassifier should return null for non-matches', async () => {
        const classifier = new RegexClassifier();
        const result = await classifier.classify('hello world');
        expect(result).toBeNull();
    });

    it('MockSLMClassifier should score keywords', async () => {
        const classifier = new MockSLMClassifier();
        const result = await classifier.classify('why is the sky blue');
        expect(result).not.toBeNull();
        if (result) {
            expect(result.target).toBe('JULES');
        }
    });
});
