import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitizes an HTML string to prevent XSS attacks.
 *
 * @param html The HTML string to sanitize.
 * @returns A sanitized HTML string.
 */
export function sanitizeHtml(html: string): string {
    return DOMPurify.sanitize(html);
}
