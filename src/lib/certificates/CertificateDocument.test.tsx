import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { pdf } from '@react-pdf/renderer';

// Mock @react-pdf/renderer to avoid font loading issues in test environment
vi.mock('@react-pdf/renderer', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@react-pdf/renderer')>();
    return {
        ...actual,
        // Disable Font.register to prevent network requests
        Font: {
            ...actual.Font,
            register: vi.fn(),
        },
        // Intercept StyleSheet to remove 'Roboto' font family, falling back to default (Helvetica)
        StyleSheet: {
            ...actual.StyleSheet,
            create: (styles: any) => {
                const newStyles = JSON.parse(JSON.stringify(styles)); // Deep copy simple object
                for (const key in newStyles) {
                    if (newStyles[key].fontFamily === 'Roboto') {
                        delete newStyles[key].fontFamily;
                    }
                }
                return actual.StyleSheet.create(newStyles);
            },
        },
    };
});

import CertificateDocument, { CertificateData } from './CertificateDocument';

describe('CertificateDocument', () => {
    it('renders without crashing', async () => {
        const mockData: CertificateData = {
            studentName: 'Juan Pérez',
            courseName: 'Curso de Vela',
            issueDate: '2023-10-25',
            certificateId: 'CERT-123',
            verificationHash: 'hash-123',
            distinction: 'excellence',
            hours: 20
        };

        const consoleSpy = vi.spyOn(console, 'error');

        try {
            const instance = pdf(<CertificateDocument data={mockData} qrCodeUrl="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" />);
            const blob = await instance.toBlob();

            expect(blob).toBeDefined();
            expect(blob.size).toBeGreaterThan(0);
        } catch (error) {
            console.error('Test failed with error:', error);
            throw error;
        } finally {
            consoleSpy.mockRestore();
        }
    });
});
