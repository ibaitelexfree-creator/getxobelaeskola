import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';

export const generateCertificatePDF = async (elementId: string, filename: string, verificationUrl: string) => {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error('Element not found:', elementId);
        return;
    }

    try {
        // Generar QR Code como data URL
        const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
            margin: 1,
            width: 200,
            color: {
                dark: '#050a14',
                light: '#ffffff'
            }
        });

        // Insertar QR en el elemento si existe el contenedor
        const qrContainer = element.querySelector('.qr-container');
        if (qrContainer) {
            const img = document.createElement('img');
            img.src = qrDataUrl;
            img.style.width = '100%';
            qrContainer.innerHTML = '';
            qrContainer.appendChild(img);
        }

        // Pequeña espera para asegurar que el QR se ha renderizado
        await new Promise(resolve => setTimeout(resolve, 100));

        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#050a14',
            logging: false,
        });

        const imgData = canvas.toDataURL('image/png');

        // Formato A4 Paisaje (297mm x 210mm)
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });

        const imgWidth = 297;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save(`${filename}.pdf`);
    } catch (error) {
        console.error('Error generating PDF:', error);
    }
};
