import { describe, it, expect, vi } from 'vitest';
import { corsHeaders, withCors } from './api-headers';
import { NextResponse } from 'next/server';

describe('corsHeaders', () => {
    it('returns allowed origin when request origin is in allowed list', () => {
        const request = new Request('https://api.example.com', {
            headers: { 'origin': 'https://getxobelaeskola.cloud' }
        });
        const headers = corsHeaders(request);
        expect(headers['Access-Control-Allow-Origin']).toBe('https://getxobelaeskola.cloud');
    });

    it('returns "*" when request origin is missing', () => {
        const request = new Request('https://api.example.com');
        const headers = corsHeaders(request);
        expect(headers['Access-Control-Allow-Origin']).toBe('*');
    });

    it('returns request origin when it is localhost', () => {
        const request = new Request('https://api.example.com', {
            headers: { 'origin': 'http://localhost:4000' }
        });
        const headers = corsHeaders(request);
        expect(headers['Access-Control-Allow-Origin']).toBe('http://localhost:4000');
    });

    it('returns request origin when it is 127.0.0.1', () => {
        const request = new Request('https://api.example.com', {
            headers: { 'origin': 'http://127.0.0.1:8080' }
        });
        const headers = corsHeaders(request);
        expect(headers['Access-Control-Allow-Origin']).toBe('http://127.0.0.1:8080');
    });

    it('returns production domain when origin is not allowed and not localhost', () => {
        const request = new Request('https://api.example.com', {
            headers: { 'origin': 'https://evil.com' }
        });
        const headers = corsHeaders(request);
        expect(headers['Access-Control-Allow-Origin']).toBe('https://getxobelaeskola.cloud');
    });

    it('includes all required CORS headers', () => {
        const request = new Request('https://api.example.com');
        const headers = corsHeaders(request);
        expect(headers['Access-Control-Allow-Methods']).toBe('GET, POST, PUT, DELETE, OPTIONS');
        expect(headers['Access-Control-Allow-Headers']).toBe('Content-Type, Authorization, x-client-info');
        expect(headers['Access-Control-Allow-Credentials']).toBe('true');
    });
});

describe('withCors', () => {
    it('applies CORS headers to NextResponse', () => {
        const request = new Request('https://api.example.com', {
            headers: { 'origin': 'https://getxobelaeskola.cloud' }
        });

        // Mock NextResponse
        const mockResponse = {
            headers: {
                set: vi.fn()
            }
        } as unknown as NextResponse;

        withCors(mockResponse, request);

        expect(mockResponse.headers.set).toHaveBeenCalledWith('Access-Control-Allow-Origin', 'https://getxobelaeskola.cloud');
        expect(mockResponse.headers.set).toHaveBeenCalledWith('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        expect(mockResponse.headers.set).toHaveBeenCalledWith('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-client-info');
        expect(mockResponse.headers.set).toHaveBeenCalledWith('Access-Control-Allow-Credentials', 'true');
    });
});
