import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitizes HTML content to prevent XSS attacks.
 * Allows a safe set of tags and attributes suitable for educational content.
 *
 * @param html - The potentially unsafe HTML string.
 * @returns The sanitized HTML string.
 */
export function sanitizeHtml(html: string): string {
    if (!html) return '';

    return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: [
            'b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li',
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre',
            'img', 'span', 'div', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
            'u', 's', 'strike', 'hr'
        ],
        ALLOWED_ATTR: [
            'href', 'target', 'src', 'alt', 'title', 'class', 'width', 'height', 'style'
        ],
        FORBID_TAGS: [
            'script', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'applet', 'meta'
        ],
        // Default behavior of DOMPurify handles javascript: in href, but being explicit helps
        ADD_ATTR: ['target'],
    });
}
