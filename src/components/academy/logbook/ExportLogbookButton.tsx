"use client";

import { Download } from "lucide-react";
import React, { useState } from "react";

interface ExportLogbookButtonProps {
	officialData: any;
	diaryEntries: any[];
}

export default function ExportLogbookButton({
	officialData,
	diaryEntries,
}: ExportLogbookButtonProps) {
	const [isExporting, setIsExporting] = useState(false);

	const handleExport = async () => {
		setIsExporting(true);
		try {
			// Prepare data structure expected by generateLogbookPDF
			const exportData = {
				user: {
					full_name: officialData?.user?.full_name || "Navegante",
					avatar_url: officialData?.user?.avatar_url,
				},
				estadisticas: officialData?.estadisticas || {
					horas_totales: 0,
					puntos_totales: 0,
					niveles_completados: 0,
				},
				horas: officialData?.horas || [],
				diaryEntries: diaryEntries || [],
			};

			// Dynamically import the PDF generator to reduce bundle size
			const { generateLogbookPDF } = await import("@/lib/logbook/pdfExport");
			await generateLogbookPDF(exportData);
		} catch (error) {
			console.error("Error generating PDF:", error);
			alert("Hubo un error al generar el PDF. Por favor, inténtalo de nuevo.");
		} finally {
			setIsExporting(false);
		}
	};

	return (
		<button
			onClick={handleExport}
			disabled={isExporting}
			className={`flex items-center gap-2 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all
                bg-accent text-nautical-black shadow-lg shadow-accent/20 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}
		>
			{isExporting ? (
				<div className="w-3 h-3 border-2 border-nautical-black/30 border-t-nautical-black rounded-full animate-spin" />
			) : (
				<Download size={14} />
			)}
			{isExporting ? "Generando..." : "Exportar Bitácora"}
		</button>
	);
}
