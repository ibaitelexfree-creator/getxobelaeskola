import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitizes HTML content to prevent XSS attacks while preserving safe tags.
 * @param html The raw HTML string.
 * @returns The sanitized HTML string.
 */
export function sanitizeHTML(html: string): string {
    if (!html) return '';
    return DOMPurify.sanitize(html, {
        USE_PROFILES: { html: true },
        ALLOWED_TAGS: [
            'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'ul', 'ol', 'li', 'span', 'div', 'img', 'blockquote', 'pre', 'code',
            'table', 'thead', 'tbody', 'tr', 'th', 'td', 'a'
        ],
        ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'style', 'target']
    });
}
