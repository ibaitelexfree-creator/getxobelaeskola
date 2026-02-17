
import jsPDF from 'jspdf';

interface LogbookReportData {
    studentName: string;
    totalHours: number;
    totalMiles: number;
    sessions: any[];
}

/**
 * Genera un Resumen de Horas de Navegación Profesional
 */
export const generateLogbookReportPDF = async (data: LogbookReportData): Promise<void> => {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const width = doc.internal.pageSize.getWidth();
    const height = doc.internal.pageSize.getHeight();
    const margin = 20;

    // Colores
    const navy = '#0a1628';
    const accent = '#ca8a04';
    const grey = '#64748b';

    // 1. Header con diseño premium
    doc.setFillColor(10, 22, 40); // Navy background for header
    doc.rect(0, 0, width, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('RESUMEN DE NAVEGACIÓN', margin, 20);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(200, 200, 200);
    doc.text('GETXO BELA ESKOLA - REGISTRO OFICIAL', margin, 28);

    // 2. Información del Alumno
    doc.setTextColor(navy);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('TITULAR:', margin, 55);

    doc.setFont('times', 'italic');
    doc.setFontSize(18);
    doc.text(data.studentName, margin + 25, 55);

    // 3. Cuadro de Totales
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.1);
    doc.rect(margin, 65, width - (margin * 2), 25);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(grey);
    doc.text('TOTAL HORAS NAVEGACIÓN', margin + 10, 75);
    doc.text('TOTAL MILLAS NÁUTICAS (est.)', margin + 80, 75);

    doc.setTextColor(navy);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(`${data.totalHours.toFixed(1)} h`, margin + 10, 85);
    doc.text(`${data.totalMiles.toFixed(1)} nm`, margin + 80, 85);

    // 4. Listado de Sesiones (Tabla Manual)
    doc.setFontSize(12);
    doc.text('DETALLE DE TRAVESÍAS Y PRÁCTICAS', margin, 105);

    // Headers de tabla
    const tableY = 115;
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, tableY, width - (margin * 2), 8, 'F');

    doc.setFontSize(9);
    doc.setTextColor(navy);
    doc.text('FECHA', margin + 2, tableY + 5);
    doc.text('TIPO', margin + 30, tableY + 5);
    doc.text('BARCO', margin + 70, tableY + 5);
    doc.text('DURACIÓN', margin + 110, tableY + 5);
    doc.text('ESTADO', margin + 140, tableY + 5);

    let currentY = tableY + 15;

    data.sessions.forEach((session, index) => {
        if (currentY > height - 30) {
            doc.addPage();
            currentY = margin;
        }

        const date = new Date(session.fecha).toLocaleDateString('es-ES');
        const type = session.tipo || 'Práctica';
        const boat = session.embarcacion || '---';
        const duration = `${session.duracion_h}h`;
        const status = session.verificado ? 'VERIFICADO' : 'PENDIENTE';

        doc.setTextColor(0, 0, 0);
        doc.text(date, margin + 2, currentY);
        doc.text(type, margin + 30, currentY);
        doc.text(boat, margin + 70, currentY);
        doc.text(duration, margin + 110, currentY);

        if (session.verificado) {
            doc.setTextColor(0, 100, 0);
        } else {
            doc.setTextColor(150, 150, 0);
        }
        doc.text(status, margin + 140, currentY);

        // Línea divisoria
        doc.setDrawColor(230, 230, 230);
        doc.line(margin, currentY + 3, width - margin, currentY + 3);

        currentY += 10;
    });

    // 5. Pie de página
    doc.setFontSize(8);
    doc.setTextColor(grey);
    const footerY = height - 15;
    doc.text(`Generado el ${new Date().toLocaleString('es-ES')}`, margin, footerY);
    doc.text('Este documento es un resumen informativo basado en los registros de Getxo Bela Eskola.', width - margin, footerY, { align: 'right' });

    doc.save(`Bitacora_${data.studentName.replace(/\s+/g, '_')}.pdf`);
};
