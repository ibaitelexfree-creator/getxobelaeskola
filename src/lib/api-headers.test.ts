import { describe, it, expect } from 'vitest';
import { corsHeaders } from './api-headers';

describe('corsHeaders', () => {
    it('should allow production domain', () => {
        const request = new Request('http://example.com', {
            headers: { origin: 'https://getxobelaeskola.cloud' }
        });
        const headers = corsHeaders(request);
        expect(headers['Access-Control-Allow-Origin']).toBe('https://getxobelaeskola.cloud');
    });

    it('should allow capacitor://localhost', () => {
        const request = new Request('http://example.com', {
            headers: { origin: 'capacitor://localhost' }
        });
        const headers = corsHeaders(request);
        expect(headers['Access-Control-Allow-Origin']).toBe('capacitor://localhost');
    });

    it('should NOT allow malicious localhost subdomains (Vulnerability Reproduction)', () => {
        const request = new Request('http://example.com', {
            headers: { origin: 'http://localhost.attacker.com' }
        });
        const headers = corsHeaders(request);
        // Currently, it returns origin because it includes 'localhost'
        // We want it to NOT return origin, but default to production or something safe
        expect(headers['Access-Control-Allow-Origin']).not.toBe('http://localhost.attacker.com');
    });

    it('should NOT allow malicious 127.0.0.1 subdomains (Vulnerability Reproduction)', () => {
        const request = new Request('http://example.com', {
            headers: { origin: 'http://127.0.0.1.attacker.com' }
        });
        const headers = corsHeaders(request);
        expect(headers['Access-Control-Allow-Origin']).not.toBe('http://127.0.0.1.attacker.com');
    });

    it('should handle missing origin by defaulting to production domain', () => {
        const request = new Request('http://example.com');
        const headers = corsHeaders(request);
        expect(headers['Access-Control-Allow-Origin']).toBe('https://getxobelaeskola.cloud');
    });

    it('should have Access-Control-Allow-Credentials as true', () => {
        const request = new Request('http://example.com');
        const headers = corsHeaders(request);
        expect(headers['Access-Control-Allow-Credentials']).toBe('true');
    });
});
