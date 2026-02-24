# Server-Side Sanitization

## Overview
We have implemented server-side sanitization for the Unit Reader API (`/api/unit/[id]`) using `isomorphic-dompurify`. This ensures that content retrieved from the database is sanitized before being sent to the client, preventing XSS attacks.

## Implementation
The sanitization logic is located in `src/app/api/unit/[id]/route.ts`. It uses `isomorphic-dompurify` with the following configuration:

```javascript
const sanitize = (content: string) => {
    return DOMPurify.sanitize(content, {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4'],
        ALLOWED_ATTR: [] // Strip all attributes
    });
};
```

This configuration:
- Allows only safe formatting tags.
- Strips all attributes (including `style`, `onclick`, etc.).
- Strips `<script>`, `<iframe>`, and other dangerous tags.

## Usage
The sanitization is applied to the following fields of the `unidad` object:
- `contenido_teorico_es`
- `contenido_teorico_eu`
- `contenido_practico_es`
- `contenido_practico_eu`

## Verification
A test script `scripts/test-sanitization.ts` was created to verify the sanitization logic against various inputs, including malicious payloads.
