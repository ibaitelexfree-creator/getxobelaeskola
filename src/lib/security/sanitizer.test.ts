import { describe, it, expect } from 'vitest';
import { sanitizeHtml } from './sanitizer';

describe('sanitizeHtml', () => {
    it('should allow safe HTML tags', () => {
        const input = '<p>This is <strong>safe</strong> HTML.</p>';
        expect(sanitizeHtml(input)).toBe(input);
    });

    it('should remove script tags', () => {
        const input = '<div><script>alert("xss")</script>Content</div>';
        expect(sanitizeHtml(input)).toBe('<div>Content</div>');
    });

    it('should remove onclick attributes', () => {
        const input = '<button onclick="alert(\'xss\')">Click me</button>';
        // DOMPurify removes the attribute but keeps the tag
        expect(sanitizeHtml(input)).toBe('<button>Click me</button>');
    });

    it('should remove javascript: links', () => {
        const input = '<a href="javascript:alert(\'xss\')">Link</a>';
        // DOMPurify removes the href with javascript:
        expect(sanitizeHtml(input)).toBe('<a>Link</a>');
    });

    it('should remove iframe tags', () => {
        const input = '<iframe src="http://evil.com"></iframe>';
        expect(sanitizeHtml(input)).toBe('');
    });

    it('should allow class attributes', () => {
        const input = '<span class="text-red-500">Error</span>';
        expect(sanitizeHtml(input)).toBe(input);
    });
});
