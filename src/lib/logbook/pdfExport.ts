
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface LogbookData {
    user: {
        full_name: string;
        avatar_url?: string;
    };
    estadisticas: {
        horas_totales: number;
        puntos_totales: number;
        niveles_completados: number;
        [key: string]: any;
    };
    horas: any[]; // Official sessions
    diaryEntries: any[]; // Diary entries
}

/**
 * Generates a Premium Nautical PDF Logbook
 */
export const generateLogbookPDF = async (data: LogbookData): Promise<void> => {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const width = doc.internal.pageSize.getWidth();
    const height = doc.internal.pageSize.getHeight();
    const margin = 20;

    // Colors
    const colors = {
        navy: '#0a1628',
        accent: '#ca8a04',
        grey: '#64748b',
        lightGrey: '#f1f5f9',
        white: '#ffffff'
    };

    // Helper to add footer
    const addFooter = (pageNumber: number) => {
        doc.setFontSize(8);
        doc.setTextColor(colors.grey);
        const footerY = height - 10;
        doc.text(`Generado el ${new Date().toLocaleDateString('es-ES')}`, margin, footerY);
        doc.text(`Página ${pageNumber}`, width - margin, footerY, { align: 'right' });
    };

    // --- COVER PAGE ---
    doc.setFillColor(colors.navy);
    doc.rect(0, 0, width, height, 'F'); // Full background

    // Decorative border
    doc.setDrawColor(colors.accent);
    doc.setLineWidth(1);
    doc.rect(margin, margin, width - (margin * 2), height - (margin * 2));

    // Title
    doc.setTextColor(colors.white);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(36);
    doc.text('CUADERNO DE', width / 2, 80, { align: 'center' });
    doc.text('BITÁCORA', width / 2, 95, { align: 'center' });

    // Icon Placeholder (Anchor or similar) - simplified as text for now or draw lines
    doc.setDrawColor(colors.accent);
    doc.setLineWidth(2);
    doc.line(width / 2 - 20, 110, width / 2 + 20, 110);

    // User Info
    doc.setFontSize(18);
    doc.setFont('helvetica', 'normal');
    doc.text('CAPITÁN:', width / 2, 140, { align: 'center' });
    doc.setFont('times', 'italic');
    doc.setFontSize(24);
    doc.setTextColor(colors.accent);
    doc.text(data.user.full_name || 'Navegante', width / 2, 155, { align: 'center' });

    // Date range or Generation Date
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(colors.grey);
    doc.text(`Fecha de Emisión: ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}`, width / 2, height - 40, { align: 'center' });

    // Logo / Brand
    doc.setFontSize(10);
    doc.setTextColor(colors.white);
    doc.text('GETXO BELA ESKOLA', width / 2, height - 30, { align: 'center' });

    // --- PAGE 2: STATISTICS ---
    doc.addPage();
    let currentY = margin;

    // Header
    doc.setFillColor(colors.navy);
    doc.rect(0, 0, width, 40, 'F');
    doc.setTextColor(colors.white);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('RESUMEN DE NAVEGACIÓN', margin, 25);

    currentY = 55;

    // Calculate Marinas
    const uniqueMarinas = new Set(
        data.horas
            .map(h => h.zona_nombre)
            .filter(n => n && typeof n === 'string' && n !== 'Zona Desconocida')
    ).size;

    // Stats Grid
    const stats = [
        { label: 'Total Millas (est.)', value: `${(data.estadisticas.horas_totales * 5.2).toFixed(1)} nm` },
        { label: 'Horas de Mar', value: `${data.estadisticas.horas_totales.toFixed(1)} h` },
        { label: 'Marinas Visitadas', value: `${uniqueMarinas}` },
        { label: 'Sesiones Totales', value: `${data.horas.length}` }
    ];

    const boxWidth = (width - (margin * 2) - 10) / 2;
    const boxHeight = 30;

    stats.forEach((stat, index) => {
        const x = margin + (index % 2) * (boxWidth + 10);
        const y = currentY + Math.floor(index / 2) * (boxHeight + 10);

        doc.setFillColor(colors.lightGrey);
        doc.roundedRect(x, y, boxWidth, boxHeight, 3, 3, 'F');

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(colors.grey);
        doc.text(stat.label, x + 5, y + 10);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(colors.navy);
        doc.text(stat.value, x + 5, y + 22);
    });

    currentY += (Math.ceil(stats.length / 2) * (boxHeight + 10)) + 20;

    // --- OFFICIAL LOG TABLE ---
    doc.setFontSize(16);
    doc.setTextColor(colors.navy);
    doc.text('Registro Oficial de Travesías', margin, currentY);
    currentY += 10;

    const tableHeaders = [['Fecha', 'Tipo', 'Embarcación', 'Duración', 'Estado']];
    const tableData = data.horas.map(session => [
        new Date(session.fecha).toLocaleDateString('es-ES'),
        session.tipo || 'Práctica',
        session.embarcacion || '---',
        `${session.duracion_h}h`,
        session.verificado ? 'Verificado' : 'Pendiente'
    ]);

    autoTable(doc, {
        startY: currentY,
        head: tableHeaders,
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: colors.navy, textColor: colors.white },
        styles: { fontSize: 10, cellPadding: 3 },
        columnStyles: {
            0: { cellWidth: 30 },
            4: { cellWidth: 30, fontStyle: 'bold' }
        },
        didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 4) {
                const text = data.cell.raw as string;
                if (text === 'Verificado') {
                    data.cell.styles.textColor = [0, 100, 0]; // Green
                } else {
                    data.cell.styles.textColor = [200, 150, 0]; // Amber
                }
            }
        }
    });

    // Capture Y after table
    // @ts-ignore
    currentY = doc.lastAutoTable.finalY + 20;
    addFooter(2);

    // --- PAGE 3+: DIARY ENTRIES ---
    if (data.diaryEntries.length > 0) {
        doc.addPage();
        currentY = margin;

        // Header for Diary
        doc.setFillColor(colors.navy);
        doc.rect(0, 0, width, 30, 'F');
        doc.setTextColor(colors.white);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.text('DIARIO DE A BORDO', margin, 20);

        currentY = 45;

        data.diaryEntries.forEach((entry, index) => {
            // Check if we need a new page
            if (currentY > height - 40) {
                addFooter(doc.getNumberOfPages());
                doc.addPage();
                currentY = margin + 10;
            }

            // Entry Date
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.setTextColor(colors.accent);
            doc.text(new Date(entry.fecha).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), margin, currentY);

            currentY += 8;

            // Entry Content
            doc.setFont('times', 'italic');
            doc.setFontSize(11);
            doc.setTextColor(colors.navy);

            const splitText = doc.splitTextToSize(`"${entry.contenido}"`, width - (margin * 2));
            doc.text(splitText, margin, currentY);

            currentY += (splitText.length * 5) + 5;

            // Tags
            if (entry.tags && entry.tags.length > 0) {
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8);
                doc.setTextColor(colors.grey);
                const tagsText = entry.tags.map((t: string) => `#${t}`).join('  ');
                doc.text(tagsText, margin, currentY);
                currentY += 8;
            }

            // Separator
            doc.setDrawColor(colors.lightGrey);
            doc.line(margin, currentY, width - margin, currentY);
            currentY += 10;
        });

        addFooter(doc.getNumberOfPages());
    }

    // Save
    const filename = `Bitacora_${data.user.full_name.replace(/\s+/g, '_')}_${new Date().getFullYear()}.pdf`;
    doc.save(filename);
};
