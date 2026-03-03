import { describe, it, expect } from 'vitest';
import { getSafeRedirectUrl } from './url';

describe('getSafeRedirectUrl', () => {
    it('returns the fallback for null, undefined, or empty string', () => {
        expect(getSafeRedirectUrl(null, '/default')).toBe('/default');
        expect(getSafeRedirectUrl(undefined, '/default')).toBe('/default');
        expect(getSafeRedirectUrl('', '/default')).toBe('/default');
    });

    it('returns the URL if it is a valid relative path', () => {
        expect(getSafeRedirectUrl('/dashboard', '/default')).toBe('/dashboard');
        expect(getSafeRedirectUrl('/es/student/dashboard', '/default')).toBe('/es/student/dashboard');
        expect(getSafeRedirectUrl('/auth/login?test=1', '/default')).toBe('/auth/login?test=1');
        expect(getSafeRedirectUrl('/api/test', '/default')).toBe('/api/test');
    });

    it('returns the fallback for absolute URLs (prevent open redirect)', () => {
        expect(getSafeRedirectUrl('http://example.com', '/default')).toBe('/default');
        expect(getSafeRedirectUrl('https://evil.com/login', '/default')).toBe('/default');
        expect(getSafeRedirectUrl('ftp://server.com', '/default')).toBe('/default');
        expect(getSafeRedirectUrl('javascript:alert(1)', '/default')).toBe('/default');
        expect(getSafeRedirectUrl('data:text/html,<script>alert(1)</script>', '/default')).toBe('/default');
    });

    it('returns the fallback for protocol-relative URLs (prevent open redirect)', () => {
        expect(getSafeRedirectUrl('//evil.com', '/default')).toBe('/default');
        expect(getSafeRedirectUrl('///evil.com', '/default')).toBe('/default');
        expect(getSafeRedirectUrl('////evil.com', '/default')).toBe('/default');
    });

    it('returns the fallback for non-relative paths (prevent open redirect)', () => {
        expect(getSafeRedirectUrl('dashboard', '/default')).toBe('/default');
        expect(getSafeRedirectUrl('a/b/c', '/default')).toBe('/default');
    });
});
