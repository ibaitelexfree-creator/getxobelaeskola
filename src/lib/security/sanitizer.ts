import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitizes an HTML string to prevent XSS attacks.
 * Uses isomorphic-dompurify which works in both browser and Node.js environments.
 *
 * @param html The HTML string to sanitize.
 * @returns The sanitized HTML string.
 */
export function sanitizeHtml(html: string): string {
    if (!html) return '';

    return DOMPurify.sanitize(html, {
        USE_PROFILES: { html: true },
        // Add specific allowed tags or attributes if necessary
        // For example, to allow target="_blank" on links:
        // ADD_ATTR: ['target']
    });
}
