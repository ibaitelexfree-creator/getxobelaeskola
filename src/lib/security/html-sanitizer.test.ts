import { describe, it, expect } from 'vitest';
import { sanitizeHtml } from './html-sanitizer';

describe('sanitizeHtml', () => {
    it('should strip script tags', () => {
        const dirty = '<p>Hello</p><script>alert("xss")</script>';
        const clean = sanitizeHtml(dirty);
        expect(clean).toBe('<p>Hello</p>');
    });

    it('should preserve safe tags', () => {
        const dirty = '<strong>Bold</strong>';
        expect(sanitizeHtml(dirty)).toBe(dirty);
    });
});
