import React from 'react';

interface JsonLdProps {
    data: any;
}

export default function JsonLd({ data }: JsonLdProps) {
    if (!data) {
        return null;
    }

    // Sanitize the JSON string to prevent XSS attacks.
    // Specifically, we escape the '<' character to prevent attackers from closing the script tag
    // using '</script>' and executing arbitrary code.
    const __html = JSON.stringify(data).replace(/</g, '\\u003c');

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html }}
        />
    );
}
