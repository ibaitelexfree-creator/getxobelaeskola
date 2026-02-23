import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitizes HTML content to prevent XSS attacks.
 * Uses a whitelist approach to allow only safe tags and attributes.
 *
 * @param content - The raw HTML string to sanitize
 * @returns The sanitized HTML string
 */
export function sanitizeHtml(content: string): string {
    if (typeof content !== 'string') return '';

    return DOMPurify.sanitize(content, {
        ALLOWED_TAGS: [
            'p', 'br', 'b', 'i', 'em', 'strong', 'u', 'a', 'ul', 'ol', 'li',
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre',
            'img', 'span', 'div', 'table', 'thead', 'tbody', 'tr', 'td', 'th', 'hr'
        ],
        ALLOWED_ATTR: ['href', 'target', 'src', 'alt', 'title', 'class', 'width', 'height', 'style', 'rel'],
        ALLOW_DATA_ATTR: false,
        ADD_ATTR: ['target'], // Ensure target is allowed for external links
    });
}
