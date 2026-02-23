import { describe, it, expect } from 'vitest';
import { sanitizeHtml } from './sanitizer';

describe('sanitizeHtml', () => {
    it('should return empty string for null/undefined/empty input', () => {
        expect(sanitizeHtml('')).toBe('');
        // @ts-ignore
        expect(sanitizeHtml(null)).toBe('');
        // @ts-ignore
        expect(sanitizeHtml(undefined)).toBe('');
    });

    it('should allow safe HTML tags', () => {
        const input = '<p>Hello <b>World</b></p>';
        expect(sanitizeHtml(input)).toBe(input);
    });

    it('should strip script tags', () => {
        const input = '<p>Hello <script>alert("xss")</script>World</p>';
        expect(sanitizeHtml(input)).toBe('<p>Hello World</p>');
    });

    it('should strip iframe tags', () => {
        const input = '<iframe src="javascript:alert(1)"></iframe>';
        expect(sanitizeHtml(input)).toBe('');
    });

    it('should strip event handlers', () => {
        const input = '<img src="x" onerror="alert(1)" />';
        expect(sanitizeHtml(input)).toBe('<img src="x">');
    });

    it('should strip javascript: protocol in href', () => {
        const input = '<a href="javascript:alert(1)">Click me</a>';
        const output = sanitizeHtml(input);
        expect(output).not.toContain('javascript:');
    });

    it('should allow safe attributes', () => {
        const input = '<a href="https://example.com" target="_blank" class="link">Link</a>';
        expect(sanitizeHtml(input)).toBe(input);
    });

    it('should handle complex nesting', () => {
         const input = '<div><p>Test <span><script>bad</script></span></p></div>';
         expect(sanitizeHtml(input)).toBe('<div><p>Test <span></span></p></div>');
    });
});
