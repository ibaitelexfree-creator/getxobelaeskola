import DOMPurify from 'isomorphic-dompurify';

export function sanitizeHtml(html: string): string {
    if (typeof html !== 'string') return '';
    return DOMPurify.sanitize(html);
}
