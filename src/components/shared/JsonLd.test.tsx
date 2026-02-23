import { render } from '@testing-library/react';
import JsonLd from './JsonLd';
import { describe, it, expect } from 'vitest';
import React from 'react';

describe('JsonLd Component', () => {
    it('should render the provided data as JSON', () => {
        const data = { name: 'Test' };
        const { container } = render(<JsonLd data={data} />);
        const scriptTag = container.querySelector('script[type="application/ld+json"]');
        expect(scriptTag).toBeTruthy();
        expect(scriptTag?.innerHTML).toContain('{"name":"Test"}');
    });

    it('should escape unsafe script tags to prevent XSS', () => {
        const maliciousData = {
            key: '</script><script>alert(1)</script>'
        };

        const { container } = render(<JsonLd data={maliciousData} />);

        const scriptTag = container.querySelector('script[type="application/ld+json"]');
        expect(scriptTag).toBeTruthy();

        // The raw closing script tag should NOT be present
        expect(scriptTag?.innerHTML).not.toContain('</script>');

        // Instead, the opening bracket should be escaped
        expect(scriptTag?.innerHTML).toContain('\\u003c/script>');

        // Verify that the content is still valid JSON and can be parsed back correctly
        const content = scriptTag?.innerHTML || '';
        const parsed = JSON.parse(content);
        expect(parsed).toEqual(maliciousData);
    });

    it('should handle undefined data gracefully', () => {
        const { container } = render(<JsonLd data={undefined} />);
        const scriptTag = container.querySelector('script[type="application/ld+json"]');
        // It returns null if data is falsy
        expect(scriptTag).toBeNull();
    });
});
