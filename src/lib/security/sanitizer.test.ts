import { describe, it, expect } from 'vitest';
import { sanitizeHtml } from './sanitizer';

describe('sanitizeHtml', () => {
    it('should return empty string for empty input', () => {
        expect(sanitizeHtml('')).toBe('');
        // @ts-ignore
        expect(sanitizeHtml(null)).toBe('');
        // @ts-ignore
        expect(sanitizeHtml(undefined)).toBe('');
    });

    it('should allow safe HTML', () => {
        const safeHtml = '<p>Hello <strong>world</strong></p>';
        expect(sanitizeHtml(safeHtml)).toBe(safeHtml);
    });

    it('should remove script tags', () => {
        const unsafeHtml = '<p>Hello</p><script>alert("XSS")</script>';
        expect(sanitizeHtml(unsafeHtml)).toBe('<p>Hello</p>');
    });

    it('should remove event handlers', () => {
        const unsafeHtml = '<img src="x" onerror="alert(\'XSS\')">';
        expect(sanitizeHtml(unsafeHtml)).toBe('<img src="x">');
    });

    it('should remove javascript: pseudo-protocol', () => {
        const unsafeHtml = '<a href="javascript:alert(\'XSS\')">Click me</a>';
        expect(sanitizeHtml(unsafeHtml)).toBe('<a>Click me</a>');
    });

    it('should handle nested malicious tags', () => {
        const unsafeHtml = '<div><svg><g onload="javascript:alert(1)"></g></svg></div>';
        // DOMPurify removes the whole SVG if it contains malicious content usually, or strips the attribute
        const sanitized = sanitizeHtml(unsafeHtml);
        expect(sanitized).not.toContain('onload');
        expect(sanitized).not.toContain('javascript');
    });
});
