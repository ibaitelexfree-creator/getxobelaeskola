import { describe, it, expect } from 'vitest';
import { sanitizeHtml } from './sanitizer';

describe('sanitizeHtml', () => {
    it('should return empty string for non-string input', () => {
        expect(sanitizeHtml(null as any)).toBe('');
        expect(sanitizeHtml(undefined as any)).toBe('');
        // @ts-ignore
        expect(sanitizeHtml(123)).toBe('');
    });

    it('should preserve safe HTML tags', () => {
        const input = '<p>Hello <b>World</b></p>';
        expect(sanitizeHtml(input)).toBe(input);
    });

    it('should remove script tags', () => {
        const input = '<script>alert("xss")</script><p>Safe</p>';
        expect(sanitizeHtml(input)).toBe('<p>Safe</p>');
    });

    it('should remove event handlers', () => {
        const input = '<img src="x" onerror="alert(1)" />';
        expect(sanitizeHtml(input)).toBe('<img src="x">');
    });

    it('should remove iframe tags', () => {
        const input = '<iframe src="javascript:alert(1)"></iframe>';
        expect(sanitizeHtml(input)).toBe('');
    });

    it('should allow valid attributes', () => {
        const input = '<a href="https://example.com" target="_blank" class="link">Link</a>';
        expect(sanitizeHtml(input)).toBe(input);
    });

    it('should remove disallowed attributes', () => {
        const input = '<div onclick="alert(1)">Click me</div>';
        expect(sanitizeHtml(input)).toBe('<div>Click me</div>');
    });

    it('should sanitize javascript: protocols in href', () => {
        const input = '<a href="javascript:alert(1)">Link</a>';
        // DOMPurify removes the href content or the whole attribute depending on config, usually removes content
        const sanitized = sanitizeHtml(input);
        expect(sanitized).not.toContain('javascript:');
    });
});
