import { describe, it, expect } from 'vitest';
import { sanitizeHtml } from './security';

describe('sanitizeHtml', () => {
    it('should remove script tags', () => {
        const dirty = '<script>alert("XSS")</script><p>Hello</p>';
        const clean = sanitizeHtml(dirty);
        expect(clean).not.toContain('<script>');
        expect(clean).toContain('<p>Hello</p>');
    });

    it('should remove event handlers', () => {
        const dirty = '<img src="x" onerror="alert(1)">';
        const clean = sanitizeHtml(dirty);
        expect(clean).not.toContain('onerror');
        expect(clean).toContain('<img src="x">');
    });

    it('should preserve safe HTML tags', () => {
        const dirty = '<div><h1>Title</h1><p>Paragraph with <strong>bold</strong> and <em>italic</em>.</p></div>';
        const clean = sanitizeHtml(dirty);
        expect(clean).toBe(dirty);
    });

    it('should handle empty strings', () => {
        expect(sanitizeHtml('')).toBe('');
    });
});
