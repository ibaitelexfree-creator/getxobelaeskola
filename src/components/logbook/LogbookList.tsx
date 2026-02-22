"use client";

import { useState } from "react";
import { generateLogbookPDF } from "@/lib/logbook/logbook-pdf";
import type { LogbookEntry } from "@/types/logbook";

interface LogbookListProps {
	entries: LogbookEntry[];
	studentName: string;
}

export default function LogbookList({
	entries,
	studentName,
}: LogbookListProps) {
	const [isExporting, setIsExporting] = useState(false);

	const handleExport = async () => {
		setIsExporting(true);
		try {
			// Tiny delay to show loading state if needed, but jsPDF is sync mostly.
			await new Promise((resolve) => setTimeout(resolve, 100));
			generateLogbookPDF(entries, studentName);
		} catch (error) {
			console.error("Error generating PDF:", error);
			alert("Error al generar el PDF");
		} finally {
			setIsExporting(false);
		}
	};

	if (entries.length === 0) {
		return (
			<div className="text-center p-12 border border-dashed border-white/10 rounded-lg bg-navy-800/30">
				<p className="text-white/40 italic">
					Tu bitácora está vacía. Registra tu primera salida al mar.
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center border-b border-white/10 pb-4">
				<h3 className="text-xl font-display text-white">
					Historial de Navegación
				</h3>
				<button
					onClick={handleExport}
					disabled={isExporting}
					className="bg-white/5 hover:bg-white/10 text-accent hover:text-accent/80 border border-accent/20 px-4 py-2 rounded text-sm transition-all flex items-center gap-2 disabled:opacity-50"
				>
					{isExporting ? "Generando..." : "📥 Descargar Bitácora (PDF)"}
				</button>
			</div>

			<div className="grid gap-4">
				{entries.map((entry) => (
					<div
						key={entry.id}
						className="bg-nautical-deep border-l-2 border-accent/50 p-5 rounded-r-lg hover:bg-navy-800/80 transition-colors group"
					>
						<div className="flex justify-between items-start mb-3">
							<div>
								<h4 className="text-white font-semibold text-lg">
									{new Date(entry.fecha).toLocaleDateString("es-ES", {
										weekday: "long",
										year: "numeric",
										month: "long",
										day: "numeric",
									})}
								</h4>
								{entry.puerto_salida && (
									<p className="text-sea-foam/80 text-sm">
										📍 {entry.puerto_salida}
									</p>
								)}
							</div>
							{entry.viento_nudos !== undefined && entry.viento_nudos > 0 && (
								<div className="text-right">
									<div className="text-accent font-bold text-lg">
										{entry.viento_nudos} kn
									</div>
									<div className="text-xs text-white/40 uppercase">
										{entry.viento_direccion || "VAR"}
									</div>
								</div>
							)}
						</div>

						<div className="space-y-3">
							{/* Tripulación */}
							{entry.tripulacion && (
								<div className="text-sm">
									<span className="text-white/40 uppercase text-xs tracking-wider mr-2">
										Tripulación:
									</span>
									<span className="text-white/80">{entry.tripulacion}</span>
								</div>
							)}

							{/* Maniobras */}
							{entry.maniobras && (
								<div className="text-sm bg-black/20 p-2 rounded border border-white/5">
									<span className="text-accent/70 uppercase text-xs tracking-wider block mb-1">
										Maniobras:
									</span>
									<span className="text-white/70 italic">
										{entry.maniobras}
									</span>
								</div>
							)}

							{/* Observaciones / Contenido */}
							{(entry.observaciones || entry.contenido) && (
								<div className="text-sm pt-2 border-t border-white/5 mt-2">
									<p className="text-sea-foam/70 line-clamp-3 group-hover:line-clamp-none transition-all">
										{entry.observaciones || entry.contenido}
									</p>
								</div>
							)}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
