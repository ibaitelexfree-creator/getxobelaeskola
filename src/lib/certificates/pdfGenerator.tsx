import { pdf } from '@react-pdf/renderer';
import QRCode from 'qrcode';
import React from 'react';
import { CertificateDocument, CertificateData as DocumentCertificateData } from '@/components/certificates/CertificateDocument';

// Re-export or use the interface matching the usage
export interface CertificateData {
    studentName: string;
    courseName: string;
    issueDate: string; // ISO string or formatted date
    certificateId: string; // The printable ID (e.g. CERT-2024-XXX)
    verificationHash: string; // The UUID or hash for URL
    distinction?: string;
    hours?: number;
    skills?: string[];
    instructorName?: string;
}

/**
 * Genera un PDF de certificado profesional A4 Horizontal usando @react-pdf/renderer
 */
export const generateCertificatePDF = async (data: CertificateData): Promise<void> => {
    try {
        // 1. Generar código QR
        // Asegurarse de que window.location.origin existe (lado del cliente)
        const origin = typeof window !== 'undefined' ? window.location.origin : 'https://getxobelaeskola.cloud';
        const verificationUrl = `${origin}/es/verify/${data.verificationHash}`;

        let qrCodeUrl = '';
        try {
            qrCodeUrl = await QRCode.toDataURL(verificationUrl, { margin: 1, width: 100 });
        } catch (e) {
            console.error('Failed to generate QR code', e);
        }

        // 2. Preparar datos para el documento
        const documentData: DocumentCertificateData = {
            studentName: data.studentName,
            courseName: data.courseName,
            issueDate: data.issueDate,
            certificateId: data.certificateId,
            verificationHash: data.verificationHash,
            distinction: data.distinction,
            hours: data.hours,
            qrCodeUrl: qrCodeUrl,
            instructorName: data.instructorName
        };

        // 3. Generar Blob
        const blob = await pdf(<CertificateDocument data={documentData} />).toBlob();

        // 4. Descargar (solo si estamos en el navegador)
        if (typeof window !== 'undefined') {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Certificado_${data.certificateId}.pdf`;
            document.body.appendChild(link);
            link.click();

            // Limpieza
            document.body.removeChild(link);
            setTimeout(() => URL.revokeObjectURL(url), 100);
        }

    } catch (err) {
        console.error('Error generating PDF with @react-pdf/renderer:', err);
        throw err;
    }
};
