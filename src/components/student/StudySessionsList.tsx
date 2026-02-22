"use client";

import {
	BookOpen,
	Calendar,
	Clock,
	Download,
	HelpCircle,
	Trophy,
} from "lucide-react";
import React, { useMemo, useState } from "react";

interface StudySession {
	date: string;
	duration: number; // in seconds
	modulesVisited: number;
	questionsAnswered: number;
	xpEarned: number;
}

interface StudySessionsListProps {
	sessions: StudySession[];
	locale: string;
}

export default function StudySessionsList({
	sessions,
	locale,
}: StudySessionsListProps) {
	const [selectedMonth, setSelectedMonth] = useState<string>("all");

	const months = useMemo(() => {
		const uniqueMonths = Array.from(
			new Set(sessions.map((s) => s.date.substring(0, 7))),
		)
			.sort()
			.reverse();
		return uniqueMonths;
	}, [sessions]);

	const filteredSessions = useMemo(() => {
		if (selectedMonth === "all") return sessions;
		return sessions.filter((s) => s.date.startsWith(selectedMonth));
	}, [sessions, selectedMonth]);

	const formatDuration = (seconds: number) => {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);

		if (hours > 0) return `${hours}h ${minutes}m`;
		return `${minutes}m`;
	};

	const formatDate = (dateStr: string) => {
		return new Date(dateStr).toLocaleDateString(
			locale === "es" ? "es-ES" : "en-GB",
			{
				day: "2-digit",
				month: "2-digit",
				year: "numeric",
			},
		);
	};

	const exportCSV = () => {
		const headers = [
			"Fecha",
			"Duración (min)",
			"Módulos Visitados",
			"Preguntas Respondidas",
			"XP Ganado",
		];
		const rows = filteredSessions.map((s) => [
			s.date,
			Math.round(s.duration / 60),
			s.modulesVisited,
			s.questionsAnswered,
			s.xpEarned,
		]);

		const csvContent =
			"data:text/csv;charset=utf-8," +
			headers.join(",") +
			"\n" +
			rows.map((e) => e.join(",")).join("\n");

		const encodedUri = encodeURI(csvContent);
		const link = document.createElement("a");
		link.setAttribute("href", encodedUri);
		link.setAttribute(
			"download",
			`sesiones_estudio_${new Date().toISOString().split("T")[0]}.csv`,
		);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	if (sessions.length === 0) {
		return null;
	}

	return (
		<section className="bg-card border border-card-border rounded-sm p-6 md:p-8">
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
				<div>
					<h2 className="text-xs uppercase tracking-widest text-accent font-bold mb-2">
						Historial de Estudio
					</h2>
					<p className="text-foreground/60 text-sm">
						Resumen de tu actividad académica
					</p>
				</div>

				<div className="flex gap-3">
					<select
						value={selectedMonth}
						onChange={(e) => setSelectedMonth(e.target.value)}
						className="bg-nautical-black border border-white/10 rounded px-3 py-2 text-xs text-white focus:border-accent outline-none appearance-none cursor-pointer hover:border-white/20 transition-colors"
					>
						<option value="all">Todos los meses</option>
						{months.map((m) => (
							<option key={m} value={m}>
								{new Date(m + "-01").toLocaleDateString(
									locale === "es" ? "es-ES" : "en-GB",
									{ month: "long", year: "numeric" },
								)}
							</option>
						))}
					</select>

					<button
						onClick={exportCSV}
						className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-xs text-white transition-colors"
					>
						<Download size={14} />
						<span>CSV</span>
					</button>
				</div>
			</div>

			<div className="overflow-x-auto">
				<table className="w-full text-left border-collapse">
					<thead>
						<tr className="border-b border-white/10 text-[10px] uppercase tracking-widest text-foreground/40">
							<th className="pb-4 font-medium pl-4">Fecha</th>
							<th className="pb-4 font-medium">Duración</th>
							<th className="pb-4 font-medium">Módulos</th>
							<th className="pb-4 font-medium">Preguntas</th>
							<th className="pb-4 font-medium pr-4 text-right">XP</th>
						</tr>
					</thead>
					<tbody className="text-sm">
						{filteredSessions.map((session, index) => (
							<tr
								key={index}
								className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors group"
							>
								<td className="py-4 pl-4 text-white font-medium flex items-center gap-3">
									<div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
										<Calendar size={14} />
									</div>
									{formatDate(session.date)}
								</td>
								<td className="py-4 text-foreground/80">
									<div className="flex items-center gap-2">
										<Clock size={14} className="text-foreground/40" />
										{formatDuration(session.duration)}
									</div>
								</td>
								<td className="py-4 text-foreground/80">
									<div className="flex items-center gap-2">
										<BookOpen size={14} className="text-foreground/40" />
										{session.modulesVisited}
									</div>
								</td>
								<td className="py-4 text-foreground/80">
									<div className="flex items-center gap-2">
										<HelpCircle size={14} className="text-foreground/40" />
										{session.questionsAnswered}
									</div>
								</td>
								<td className="py-4 pr-4 text-right">
									<div className="inline-flex items-center gap-1 text-accent font-bold">
										<span>+{session.xpEarned}</span>
										<Trophy size={12} />
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>

				{filteredSessions.length === 0 && (
					<div className="text-center py-12 text-foreground/40 text-sm">
						No hay sesiones registradas para este periodo.
					</div>
				)}
			</div>
		</section>
	);
}
