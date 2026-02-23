import { pdf } from '@react-pdf/renderer';
import QRCode from 'qrcode';
import React from 'react';
import CertificateDocument, { CertificateData } from './CertificateDocument';

export type { CertificateData };

/**
 * Genera un PDF de certificado profesional A4 Horizontal
 */
export const generateCertificatePDF = async (data: CertificateData): Promise<void> => {
    // 1. Generar Código QR de Verificación
    const verificationUrl = `${window.location.origin}/es/verify/${data.verificationHash}`;
    let qrCodeUrl: string | undefined;

    try {
        qrCodeUrl = await QRCode.toDataURL(verificationUrl, { margin: 1, width: 100 });
    } catch (err) {
        console.error('Error generando QR', err);
    }

    // 2. Generar el Blob del PDF
    // Nota: El uso de fuentes externas (Roboto) se maneja automáticamente en CertificateDocument
    const blob = await pdf(<CertificateDocument data={data} qrCodeUrl={qrCodeUrl} />).toBlob();

    // 3. Descargar el archivo
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Certificado_${data.certificateId}.pdf`;
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
