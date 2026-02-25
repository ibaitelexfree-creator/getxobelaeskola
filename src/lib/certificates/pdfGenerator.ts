
import jsPDF from 'jspdf';
import QRCode from 'qrcode';

interface CertificateData {
    studentName: string;
    courseName: string;
    issueDate: string; // ISO string or formatted date
    certificateId: string; // The printable ID (e.g. CERT-2024-XXX)
    verificationHash: string; // The UUID or hash for URL
    distinction?: 'standard' | 'merit' | 'excellence';
    hours?: number;
    skills?: string[];
}

/**
 * Genera un PDF de certificado profesional A4 Horizontal
 */
export const generateCertificatePDF = async (data: CertificateData): Promise<void> => {
    // 1. Configuración del documento (A4 Horizontal = 297mm x 210mm)
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
    });

    const width = doc.internal.pageSize.getWidth();
    const height = doc.internal.pageSize.getHeight();
    const centerX = width / 2;

    // Colores corporativos (basados en Getxo Bela Eskola)
    const primaryColor = '#1e3a8a'; // Azul marino (blue-900)
    const accentColor = '#ca8a04'; // Dorado (yellow-600)
    const secondaryColor = '#64748b'; // Slate-500

    // 2. Fondo y Borde Decorativo
    // Fondo crema suave
    doc.setFillColor(252, 250, 245); // #fffbeb (amber-50 equivalent)
    doc.rect(0, 0, width, height, 'F');

    // Borde exterior doble
    doc.setDrawColor(accentColor);
    doc.setLineWidth(1);
    doc.rect(10, 10, width - 20, height - 20); // Borde externo

    doc.setLineWidth(0.5);
    doc.rect(12, 12, width - 24, height - 24); // Borde interno

    // Esquinas decorativas
    const cornerSize = 15;
    // Top-Left
    doc.triangle(10, 10, 10 + cornerSize, 10, 10, 10 + cornerSize, 'F');
    // Top-Right
    doc.triangle(width - 10, 10, width - 10 - cornerSize, 10, width - 10, 10 + cornerSize, 'F');
    // Bottom-Left
    doc.triangle(10, height - 10, 10 + cornerSize, height - 10, 10, height - 10 - cornerSize, 'F');
    // Bottom-Right
    doc.triangle(width - 10, height - 10, width - 10 - cornerSize, height - 10, width - 10, height - 10 - cornerSize, 'F');

    // 3. Encabezado
    // Título Principal
    doc.setTextColor(primaryColor);
    doc.setFont('helvetica', 'bold'); // Fallback font
    doc.setFontSize(40);
    doc.text('CERTIFICADO DE LOGRO', centerX, 50, { align: 'center' });

    // Subtítulo
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(secondaryColor);
    doc.text('Este documento certifica que', centerX, 65, { align: 'center' });

    // 4. Nombre del Alumno (Destacado)
    doc.setFont('times', 'bolditalic'); // Times da un toque más "oficial"
    doc.setTextColor(0, 0, 0); // Negro puro
    doc.setFontSize(36);
    doc.text(data.studentName, centerX, 85, { align: 'center' });

    // Línea separadora debajo del nombre
    doc.setDrawColor(accentColor);
    doc.setLineWidth(0.5);
    doc.line(centerX - 60, 92, centerX + 60, 92);

    // 5. Detalles del Curso
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(secondaryColor);
    doc.setFontSize(14);
    doc.text('Ha completado satisfactoriamente el curso', centerX, 105, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor);
    doc.setFontSize(24);
    doc.text(data.courseName, centerX, 120, { align: 'center' });

    // 6. Información Adicional (Horas, Distinción)
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(secondaryColor);
    doc.setFontSize(12);

    let detailsText = `Completado el ${new Date(data.issueDate).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}`;

    if (data.hours) {
        detailsText += ` • ${data.hours} horas de formación`;
    }

    // Distinción especial
    if (data.distinction && data.distinction !== 'standard') {
        const distinctionLabel = data.distinction === 'excellence' ? 'EXCELENCIA ACADÉMICA' : 'MÉRITO DISTINGUIDO';
        doc.setTextColor(accentColor);
        doc.setFont('helvetica', 'bold');
        doc.text(distinctionLabel, centerX, 135, { align: 'center' });
        doc.setTextColor(secondaryColor);
        doc.setFont('helvetica', 'normal');
        doc.text(detailsText, centerX, 142, { align: 'center' });
    } else {
        doc.text(detailsText, centerX, 135, { align: 'center' });
    }

    // 7. Código QR de Verificación
    // Generar URL de verificación
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://getxobelaeskola.cloud');
    const verificationUrl = `${baseUrl}/es/verify/${data.verificationHash}`;

    try {
        const qrDataUrl = await QRCode.toDataURL(verificationUrl, { margin: 1, width: 100 });
        doc.addImage(qrDataUrl, 'PNG', 20, height - 50, 30, 30);

        // Texto ID debajo del QR
        doc.setFontSize(8);
        doc.setTextColor(primaryColor);
        doc.text(`ID: ${data.certificateId}`, 35, height - 18, { align: 'center' });
        doc.text('ESCANEA PARA VERIFICAR', 35, height - 14, { align: 'center' });
    } catch (err) {
        console.error('Error generando QR', err);
    }

    // 8. Firmas (Placeholders visuales)
    const signatureY = height - 40;

    // Firma 1: Director Académico
    doc.setDrawColor(0);
    doc.line(centerX - 80, signatureY, centerX - 20, signatureY);
    doc.setFontSize(10);
    doc.text('Director Académico', centerX - 50, signatureY + 5, { align: 'center' });
    doc.setFontSize(8);
    doc.setTextColor(secondaryColor);
    doc.text('Getxo Bela Eskola', centerX - 50, signatureY + 9, { align: 'center' });

    // Firma 2: Instructor Jefe
    doc.setDrawColor(0);
    doc.line(centerX + 20, signatureY, centerX + 80, signatureY);
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text('Instructor Jefe', centerX + 50, signatureY + 5, { align: 'center' });
    doc.setFontSize(8);
    doc.setTextColor(secondaryColor);
    doc.text('Departamento de Vela', centerX + 50, signatureY + 9, { align: 'center' });

    // 9. Sello de marca de agua (esquina inferior derecha)
    doc.setTextColor(200, 200, 200);
    doc.setFontSize(60);
    doc.text('GBE', width - 40, height - 20, { align: 'center', angle: 45 });

    // 10. Guardar PDF
    const fileName = `Certificado_${data.certificateId}.pdf`;
    doc.save(fileName);
};
