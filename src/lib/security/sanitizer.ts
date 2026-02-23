import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitizes HTML content to prevent XSS attacks.
 * Uses isomorphic-dompurify to work in both Node.js and Browser environments.
 *
 * @param dirty - The potentially unsafe HTML string.
 * @returns The sanitized HTML string.
 */
export const sanitizeHtml = (dirty: string): string => {
    return DOMPurify.sanitize(dirty, {
        USE_PROFILES: { html: true },
        ADD_ATTR: ['target', 'class'], // Allow target for links and class for styling
        FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'base', 'head', 'link', 'meta'],
        FORBID_ATTR: ['on*', 'javascript:', 'data-*'], // Strip event handlers and data attributes
    });
};
