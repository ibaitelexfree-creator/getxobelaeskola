import { describe, it, expect } from 'vitest';
import { corsHeaders, withCors } from './api-headers';
import type { NextResponse } from 'next/server';

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

describe('withCors', () => {
    it('should apply cors headers to a NextResponse object', () => {
        const request = new Request('http://example.com', {
            headers: { origin: 'http://localhost:3000' }
        });

        // Mock NextResponse structure manually to avoid importing next/server which might fail in vitest
        const mockResponse = {
            headers: new Headers()
        } as unknown as NextResponse;

        const responseWithCors = withCors(mockResponse, request);

        expect(responseWithCors).toBe(mockResponse); // Should return the same object
        expect(responseWithCors.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3000');
        expect(responseWithCors.headers.get('Access-Control-Allow-Methods')).toBe('GET, POST, PUT, DELETE, OPTIONS');
        expect(responseWithCors.headers.get('Access-Control-Allow-Credentials')).toBe('true');
    });

    it('should apply default cors headers if no origin is provided', () => {
        const request = new Request('http://example.com');

        const mockResponse = {
            headers: new Headers()
        } as unknown as NextResponse;

        const responseWithCors = withCors(mockResponse, request);

        expect(responseWithCors.headers.get('Access-Control-Allow-Origin')).toBe('https://getxobelaeskola.cloud');
    });

    it('should apply default cors headers if unauthorized origin is provided', () => {
        const request = new Request('http://example.com', {
            headers: { origin: 'http://unauthorized.com' }
        });

        const mockResponse = {
            headers: new Headers()
        } as unknown as NextResponse;

        const responseWithCors = withCors(mockResponse, request);

        expect(responseWithCors.headers.get('Access-Control-Allow-Origin')).toBe('https://getxobelaeskola.cloud');
    });
});
