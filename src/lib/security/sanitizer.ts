import sanitize from 'sanitize-html';

/**
 * Sanitizes an HTML string to prevent XSS attacks.
 * Uses sanitize-html which is more lightweight and avoids jsdom issues in CI environments.
 *
 * @param html The HTML string to sanitize.
 * @returns The sanitized HTML string.
 */
export function sanitizeHtml(html: string): string {
    if (!html) return '';

    return sanitize(html, {
        allowedTags: sanitize.defaults.allowedTags.concat([ 'img', 'details', 'summary' ]),
        allowedAttributes: {
            ...sanitize.defaults.allowedAttributes,
            'img': [ 'src', 'alt', 'width', 'height' ],
            '*': [ 'class' ]
        }
    });
}
