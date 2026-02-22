import jsPDF from "jspdf";
import type { LogbookEntry } from "@/types/logbook";

/**
 * Genera un PDF detallado del Cuaderno de Bitácora
 */
export const generateLogbookPDF = (
	entries: LogbookEntry[],
	studentName: string,
): void => {
	const doc = new jsPDF({
		orientation: "portrait",
		unit: "mm",
		format: "a4",
	});

	const width = doc.internal.pageSize.getWidth();
	const height = doc.internal.pageSize.getHeight();
	const margin = 20;

	// Colores
	const navy = "#0a1628";
	const accent = "#ca8a04"; // Gold
	const grey = "#64748b";
	const lightGrey = "#f1f5f9";

	// 1. Header
	doc.setFillColor(navy);
	doc.rect(0, 0, width, 40, "F");

	doc.setTextColor(255, 255, 255);
	doc.setFont("helvetica", "bold");
	doc.setFontSize(22);
	doc.text("CUADERNO DE BITÁCORA", margin, 20);

	doc.setFont("helvetica", "normal");
	doc.setFontSize(10);
	doc.setTextColor(200, 200, 200);
	doc.text("GETXO BELA ESKOLA - REGISTRO DE SALIDAS", margin, 28);

	// Titular
	doc.setTextColor(navy);
	doc.setFontSize(14);
	doc.setFont("helvetica", "bold");
	doc.text("TITULAR:", margin, 55);

	doc.setFont("times", "italic");
	doc.setFontSize(16);
	doc.text(studentName, margin + 25, 55);

	// Línea separadora
	doc.setDrawColor(accent);
	doc.setLineWidth(0.5);
	doc.line(margin, 62, width - margin, 62);

	let currentY = 75;

	// 2. Iterar Entradas
	entries.forEach((entry, index) => {
		// Verificar espacio en página
		// Un bloque ocupa aprox 40-60mm dependiendo del contenido.
		// Si queda poco espacio, nueva página.
		if (currentY > height - 60) {
			doc.addPage();
			currentY = margin + 10;
		}

		const date = new Date(entry.fecha).toLocaleDateString("es-ES", {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
		});

		// Bloque de Entrada
		doc.setFillColor(lightGrey);
		doc.roundedRect(margin, currentY, width - margin * 2, 45, 3, 3, "F");

		// Fecha y Puerto
		doc.setTextColor(navy);
		doc.setFont("helvetica", "bold");
		doc.setFontSize(12);
		doc.text(date.toUpperCase(), margin + 5, currentY + 10);

		if (entry.puerto_salida) {
			doc.setFontSize(10);
			doc.setTextColor(grey);
			doc.text(
				`Salida: ${entry.puerto_salida}`,
				width - margin - 5,
				currentY + 10,
				{ align: "right" },
			);
		}

		// Datos Técnicos (Viento, Tripulación)
		doc.setFont("helvetica", "normal");
		doc.setFontSize(10);
		doc.setTextColor(0, 0, 0);

		let detailsY = currentY + 20;

		// Viento
		if (entry.viento_nudos || entry.viento_direccion) {
			const windText = `Viento: ${entry.viento_nudos || "--"} kn ${entry.viento_direccion || ""}`;
			doc.text(windText, margin + 5, detailsY);
		}

		// Tripulación
		if (entry.tripulacion) {
			doc.text(`Tripulación: ${entry.tripulacion}`, margin + 60, detailsY);
		}

		// Maniobras
		if (entry.maniobras) {
			detailsY += 7;
			doc.setFont("helvetica", "bold");
			doc.setFontSize(9);
			doc.setTextColor(navy);
			doc.text("Maniobras:", margin + 5, detailsY);

			doc.setFont("helvetica", "normal");
			doc.setTextColor(0, 0, 0);
			doc.text(entry.maniobras, margin + 30, detailsY, {
				maxWidth: width - margin * 2 - 35,
			});
		}

		// Observaciones (si existen y caben, o si es el contenido principal)
		const obs = entry.observaciones || entry.contenido;
		if (obs) {
			detailsY += 7;
			doc.setFont("helvetica", "italic");
			doc.setFontSize(9);
			doc.setTextColor(grey);
			// Truncar si es muy largo para este formato simple, o ajustar altura rectángulo
			// Por simplicidad, mostramos una línea o dos
			const splitObs = doc.splitTextToSize(obs, width - margin * 2 - 10);
			doc.text(
				splitObs[0] + (splitObs.length > 1 ? "..." : ""),
				margin + 5,
				detailsY,
			);
		}

		currentY += 55; // Salto al siguiente bloque
	});

	// Footer
	const footerY = height - 10;
	doc.setFontSize(8);
	doc.setTextColor(grey);
	doc.text(
		`Generado el ${new Date().toLocaleDateString("es-ES")}`,
		margin,
		footerY,
	);
	doc.text(
		"Cuaderno de Bitácora Digital - Getxo Bela Eskola",
		width - margin,
		footerY,
		{ align: "right" },
	);

	doc.save(`Bitacora_${studentName.replace(/\s+/g, "_")}.pdf`);
};
