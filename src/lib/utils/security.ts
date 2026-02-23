import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitizes HTML to prevent XSS attacks.
 * @param html The HTML string to sanitize.
 * @returns The sanitized HTML string.
 */
export function sanitizeHtml(html: string): string {
    return DOMPurify.sanitize(html);
}
