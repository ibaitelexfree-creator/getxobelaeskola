
import React from 'react';
import { pdf } from '@react-pdf/renderer';
import QRCode from 'qrcode';
import CertificateDocument, { CertificateDocumentProps } from '@/components/academy/CertificateDocument';

// Re-export interface for existing code compatibility
export interface CertificateData {
    studentName: string;
    courseName: string;
    issueDate: string; // ISO string or formatted date
    certificateId: string; // The printable ID (e.g. CERT-2024-XXX)
    verificationHash: string; // The UUID or hash for URL
    distinction?: 'standard' | 'merit' | 'excellence'; // This matches the type in CertificateCard
    hours?: number;
    skills?: string[];
}

/**
 * Genera un PDF de certificado profesional A4 Horizontal
 * usando @react-pdf/renderer
 */
export const generateCertificatePDF = async (data: CertificateData): Promise<void> => {
    try {
        // 1. Generate QR Code
        const verificationUrl = `${window.location.origin}/es/verify/${data.verificationHash}`;
        let qrCodeDataUrl: string | undefined;
        try {
            qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, { margin: 1, width: 100 });
        } catch (err) {
            console.error('Error generando QR', err);
        }

        // 2. Prepare props for the document
        // Map CertificateData to CertificateDocumentProps
        const docProps: CertificateDocumentProps = {
            studentName: data.studentName,
            courseName: data.courseName,
            issueDate: data.issueDate,
            certificateId: data.certificateId,
            verificationHash: data.verificationHash,
            qrCodeDataUrl: qrCodeDataUrl,
            distinction: data.distinction,
            hours: data.hours,
        };

        // 3. Generate Blob
        // Note: pdf() returns an instance which has toBlob() method
        const instance = pdf(<CertificateDocument {...docProps} />);
        const blob = await instance.toBlob();

        // 4. Trigger Download
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Certificado_${data.certificateId}.pdf`;
        document.body.appendChild(link);
        link.click();

        // Clean up
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

    } catch (err) {
        console.error('Error generating PDF', err);
        throw err;
    }
};
