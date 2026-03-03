import { describe, it, expect } from 'vitest';
import { sanitizeHtml } from './html-sanitizer';

describe('sanitizeHtml', () => {
    it('should strip script tags', () => {
        const dirty = '<p>Hello</p><script>alert("xss")</script>';
        const clean = sanitizeHtml(dirty);
        expect(clean).toBe('<p>Hello</p>');
    });

    it('should strip onclick handlers', () => {
        const dirty = '<button onclick="alert(\'xss\')">Click me</button>';
        const clean = sanitizeHtml(dirty);
        expect(clean).toBe('<button>Click me</button>');
    });

    it('should preserve safe tags and attributes', () => {
        const dirty = '<h1 class="title">Title</h1><p>Some text with <strong>bold</strong> and <a href="https://example.com">links</a>.</p>';
        const clean = sanitizeHtml(dirty);
        expect(clean).toBe(dirty);
    });

    it('should handle empty input', () => {
        expect(sanitizeHtml('')).toBe('');
    });
});
