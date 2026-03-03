"use client";
import Link from "next/link";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import WeatherPremium from "../shared/WeatherPremium";
import { ClientDate } from "./StaffShared";

interface StaffProfile {
	id: string;
	nombre: string;
	apellidos: string;
	email: string;
	rol: string;
	telefono?: string;
	created_at?: string;
}

interface Rental {
	id: string;
	perfil_id: string;
	fecha_reserva: string;
	hora_inicio: string;
	monto_total: number;
	estado_entrega: string;
	profiles?: StaffProfile;
	servicios_alquiler?: {
		nombre_es: string;
	};
	log_seguimiento?: {
		timestamp: string;
		status: string;
		note: string;
		staff: string;
	}[];
}

interface AuditLog {
	id: string;
	staff_id: string;
	target_id: string;
	target_type: string;
	action_type: string;
	description: string;
	metadata?: Record<string, unknown>;
	created_at: string;
}

interface StaffStats {
	todayRevenue: number;
	monthlyRevenue: number;
	yearlyRevenue: number;
	studentCount: number;
	socioCount: number;
	studentRentersCount: number;
	nonStudentRentersCount: number;
}

interface GlobalLog {
	timestamp: string;
	userName: string;
	targetName?: string;
	status: string;
	rentalName?: string;
	note: string;
	type: "audit" | "rental";
	[key: string]: unknown;
}

interface OverviewTabProps {
	isAdmin: boolean;
	locale: string;
	displayStats: StaffStats;
	rentals: Rental[];
	globalLogs: GlobalLog[];
	auditLogs: AuditLog[];
	staffProfiles: StaffProfile[];
	staffNote: string;
	setStaffNote: (v: string) => void;
	setEditingLog: (v: AuditLog) => void;
	onViewReports?: (view: "today" | "month" | "year") => void;
	notionMetrics?: any;
	isSyncing?: boolean;
	onTriggerSync?: () => void;
	isUpdatingDashboard?: boolean;
	onUpdateDashboard?: () => void;
}

export default function OverviewTab({
	isAdmin,
	locale,
	displayStats,
	rentals,
	globalLogs,
	auditLogs,
	staffProfiles,
	staffNote,
	setStaffNote,
	setEditingLog,
	onViewReports,
	notionMetrics,
	isSyncing,
	onTriggerSync,
	isUpdatingDashboard,
	onUpdateDashboard,
}: OverviewTabProps) {
	const t = useTranslations("staff_panel");
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);

	return (
		<>
			{/* 1. FINANCIAL DASHBOARD */}
			{isAdmin && (
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div
						onClick={() => onViewReports?.("today")}
						title={t("overview.stats.tooltips.revenue_today")}
						className="glass-card p-6 rounded-sm group overflow-hidden relative cursor-pointer hover:border-accent/40 transition-all"
					>
						<div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full -mr-12 -mt-12 transition-all group-hover:bg-accent/10" />
						<p className="text-technical mb-2">
							{t("overview.stats.revenue_today")}
						</p>
						<h4 className="text-4xl font-display text-white italic tracking-tight">
							{mounted
								? (displayStats.todayRevenue || 0).toLocaleString()
								: "--"}
							€
						</h4>
						<div className="mt-4 w-full h-px bg-gradient-to-r from-accent/40 to-transparent" />
					</div>
					<div
						onClick={() => onViewReports?.("month")}
						title={t("overview.stats.tooltips.this_month")}
						className="glass-card p-6 rounded-sm group overflow-hidden relative border-white/10 cursor-pointer hover:border-accent/40 transition-all"
					>
						<p className="text-technical mb-2">
							{t("overview.stats.this_month")}
						</p>
						<h4 className="text-4xl font-display text-white italic tracking-tight">
							{mounted
								? (displayStats.monthlyRevenue || 0).toLocaleString()
								: "--"}
							€
						</h4>
						<div className="mt-4 w-full h-px bg-gradient-to-r from-white/20 to-transparent" />
					</div>
					<div
						onClick={() => onViewReports?.("year")}
						title={t("overview.stats.tooltips.yearly")}
						className="glass-card p-6 rounded-sm group overflow-hidden relative border-white/10 cursor-pointer hover:border-accent/40 transition-all"
					>
						<p className="text-technical mb-2">{t("overview.stats.yearly")}</p>
						<h4 className="text-4xl font-display text-white italic tracking-tight">
							{mounted
								? (displayStats.yearlyRevenue || 0).toLocaleString()
								: "--"}
							€
						</h4>
						<div className="mt-4 w-full h-px bg-gradient-to-r from-white/20 to-transparent" />
					</div>
				</div>
			)}

			{/* 2. USER ANALYTICS */}
			{isAdmin && (
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
					<div
						className="bg-white/5 border border-white/10 p-4 rounded-sm"
						title={t("overview.stats.tooltips.partners")}
					>
						<p className="text-2xs text-white/40 uppercase font-black tracking-widest mb-1">
							{t("overview.stats.partners")}
						</p>
						<p className="text-xl font-display text-brass-gold italic">
							{mounted ? (displayStats.socioCount || 0).toLocaleString() : "--"}
						</p>
					</div>
					<div
						className="bg-white/5 border border-white/10 p-4 rounded-sm"
						title={t("overview.stats.tooltips.students")}
					>
						<p className="text-2xs text-white/40 uppercase font-black tracking-widest mb-1">
							{t("overview.stats.students")}
						</p>
						<p className="text-xl font-display text-sea-foam italic">
							{mounted
								? (displayStats.studentCount || 0).toLocaleString()
								: "--"}
						</p>
					</div>
					<div
						className="bg-white/5 border border-white/10 p-4 rounded-sm"
						title={t("overview.stats.tooltips.students_water")}
					>
						<p className="text-2xs text-white/40 uppercase font-black tracking-widest mb-1">
							{t("overview.stats.students_water")}
						</p>
						<p className="text-xl font-display text-accent italic">
							{mounted
								? (displayStats.studentRentersCount || 0).toLocaleString()
								: "--"}
						</p>
					</div>
					<div
						className="bg-white/5 border border-white/10 p-4 rounded-sm"
						title={t("overview.stats.tooltips.individuals")}
					>
						<p className="text-2xs text-white/40 uppercase font-black tracking-widest mb-1">
							{t("overview.stats.individuals")}
						</p>
						<p className="text-xl font-display text-white italic">
							{mounted
								? (displayStats.nonStudentRentersCount || 0).toLocaleString()
								: "--"}
						</p>
					</div>
				</div>
			)}

			{/* OVERVIEW TAB CONTENT */}
			<div className="grid lg:grid-cols-3 gap-16 animate-premium-in">
				<div className="lg:col-span-2 space-y-12">
					<div className="flex justify-between items-end border-b border-white/5 pb-8">
						<h2 className="text-4xl font-display text-white italic">
							{t("overview.activity_log")}{" "}
							<span className="text-accent underline underline-offset-[12px] decoration-accent/30 decoration-1">
								{t("overview.today")}
							</span>
						</h2>
						<button
							onClick={() => window.location.reload()}
							className="text-technical hover:text-accent transition-all flex items-center gap-3"
						>
							<span className="w-2 h-2 bg-accent/40 rounded-full animate-pulse" />{" "}
							{t("overview.sync_log")}
						</button>
					</div>

					<div className="space-y-6">
						{(globalLogs || []).length > 0 ? (
							(globalLogs || []).slice(0, 8).map((log, idx) => (
								<div
									key={`log-${idx}`}
									className="flex gap-8 p-8 glass-card rounded-sm group"
								>
									<div className="text-sm font-mono text-accent font-black h-fit bg-accent/5 px-4 py-1 border border-accent/20 rounded-full">
										<ClientDate date={log?.timestamp} format="time" />
									</div>
									<div className="flex-1 space-y-3">
										<div className="flex justify-between items-start">
											<div className="space-y-1">
												<p className="text-3xs uppercase tracking-widest text-white/20 font-black">
													{t("overview.operator")}:{" "}
													<span className="text-white/60">
														{log?.userName || "N/A"}
													</span>
												</p>
												<p className="text-lg font-display text-white italic tracking-wide">
													{log?.type === "audit" && log?.targetName
														? `${t("overview.subject")}: ${log.targetName}`
														: log?.userName}
													—{" "}
													<span className="text-accent">
														{log?.status || t("overview.notice")}
													</span>
												</p>
											</div>
											<span className="text-technical opacity-20">
												REF:{" "}
												{log?.type === "audit"
													? t("overview.system")
													: t("overview.rental")}
											</span>
										</div>
										<p className="text-technical text-white/30">
											{log?.rentalName || t("overview.service")}
										</p>
										<p className="text-sm text-white/50 italic leading-relaxed pl-6 border-l border-white/10 mt-4">
											&quot;{log?.note || t("overview.no_notes")}&quot;
										</p>
									</div>
								</div>
							))
						) : (
							<div className="p-24 border border-dashed border-white/5 text-center flex flex-col items-center justify-center space-y-4">
								<p className="text-white/20 italic font-display text-xl">
									{t("overview.no_activity")}
								</p>
							</div>
						)}
					</div>

					{/* System Operations Log */}
					{isAdmin && (
						<div className="mt-20 space-y-8 animate-premium-in">
							<div className="flex justify-between items-end border-b border-white/5 pb-8">
								<h2 className="text-4xl font-display text-white italic">
									{t("overview.recent_ops")}
								</h2>
								<span className="text-technical opacity-40">
									{t("overview.real_time_audit")}
								</span>
							</div>

							<div className="space-y-4">
								{(auditLogs || []).length > 0 ? (
									(auditLogs || []).slice(0, 10).map((log, idx) => (
										<div
											key={`audit-${idx}`}
											className="flex items-center gap-6 p-6 glass-card border border-white/5 rounded-sm group hover:border-accent/40 transition-all relative"
										>
											{isAdmin && (
												<button
													onClick={() => setEditingLog({ ...log })}
													className="absolute top-4 right-4 text-[8px] uppercase tracking-widest text-accent opacity-0 group-hover:opacity-100 transition-all hover:underline"
												>
													{t("audit_editor.edit_btn")}
												</button>
											)}
											<div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-accent text-2xs font-mono border border-white/5 shrink-0">
												{log.action_type.split("_")[0][0]}
											</div>
											<div className="flex-1 min-w-0">
												<div className="flex justify-between items-center mb-1">
													<span className="text-3xs uppercase tracking-widest text-accent font-black">
														{log.action_type}
													</span>
													<span className="text-3xs text-white/20 font-mono">
														<ClientDate date={log.created_at} format="short" />
													</span>
												</div>
												<p className="text-sm text-white/70 italic truncate">
													{log.description}
												</p>
											</div>
											<div className="text-right shrink-0">
												<p className="text-3xs text-white/20 uppercase font-black">
													{t("overview.operator_label")}
												</p>
												<p className="text-3xs text-accent font-mono">
													{staffProfiles.find((p) => p.id === log.staff_id)
														?.nombre || "System"}
												</p>
											</div>
										</div>
									))
								) : (
									<div className="p-20 text-center border border-dashed border-white/5 text-white/20 italic">
										{t("overview.no_ops_recorded")}
									</div>
								)}
							</div>
						</div>
					)}
				</div>
				<div className="space-y-8">
					<WeatherPremium />

					{/* Notion Intelligence Hub - Rediseño Premium V3 (Restored) */}
					{isAdmin && (
						<div className="glass-card p-10 rounded-sm space-y-10 border-accent/20 relative overflow-hidden group/notion">
							{/* Ambient Glow */}
							<div className="absolute top-0 right-0 w-40 h-40 bg-accent/5 -mr-20 -mt-20 rounded-full blur-[100px] group-hover/notion:bg-accent/10 transition-all pointer-events-none" />

							<div className="relative z-10">
								<header className="flex justify-between items-start mb-10">
									<div className="space-y-1">
										<div className="flex items-center gap-2">
											<span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
											<span className="text-[10px] uppercase tracking-[0.4em] font-black text-white/30">
												Intelligence Hub
											</span>
										</div>
										<h3 className="text-3xl font-display text-white italic tracking-tight">
											Notion{" "}
											<span className="text-accent underline underline-offset-8 decoration-accent/20">
												Dashboard
											</span>
										</h3>
									</div>
									<div className="flex flex-col items-end opacity-40">
										<span className="text-[9px] font-mono text-white uppercase tracking-widest">
											Active Link
										</span>
										<span className="text-[9px] font-mono text-accent">
											SUPABASE ⇄ NOTION
										</span>
									</div>
								</header>

								{notionMetrics ? (
									<div className="space-y-8">
										<div className="grid grid-cols-2 gap-6">
											<div className="p-6 bg-white/[0.02] border border-white/5 rounded-sm hover:border-accent/30 transition-all relative group/stat">
												<p className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-3 group-hover/stat:text-accent transition-colors">
													Rendimiento ROI
												</p>
												<div className="flex items-baseline gap-2">
													<p className="text-4xl font-display text-sea-foam italic tracking-tighter">
														{notionMetrics.avgROI}%
													</p>
													<span className="text-sea-foam/40 text-sm animate-bounce">
														↑
													</span>
												</div>
											</div>
											<div className="p-6 bg-white/[0.02] border border-white/5 rounded-sm hover:border-accent/30 transition-all relative group/alert">
												<p className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-3 group-hover/alert:text-red-500 transition-colors">
													Alertas Activas
												</p>
												<p
													className={`text-4xl font-display ${notionMetrics.activeAlerts > 0 ? "text-red-500 text-shadow-glow-red" : "text-accent"}`}
												>
													{notionMetrics.activeAlerts
														.toString()
														.padStart(2, "0")}
												</p>
											</div>
										</div>

										<div className="p-6 bg-accent/[0.03] border border-accent/10 rounded-sm group/finance hover:bg-accent/5 transition-all">
											<div className="flex justify-between items-center mb-6">
												<div className="flex flex-col">
													<span className="text-[10px] text-accent font-black uppercase tracking-widest">
														Balance Neto Flota
													</span>
													<span className="text-[10px] text-white/20 font-mono">
														Consolidado desde Notion Database
													</span>
												</div>
												<span className="text-2xl font-display text-white italic tracking-tighter">
													{(notionMetrics.netProfit || 0).toLocaleString()}€
												</span>
											</div>
											<div className="grid grid-cols-2 gap-6 py-4 border-t border-white/5">
												<div className="space-y-1">
													<p className="text-[9px] text-white/20 font-black tracking-widest uppercase">
														INGRESOS
													</p>
													<p className="text-sm font-mono text-white/80">
														{(notionMetrics.totalRevenue || 0).toLocaleString()}
														€
													</p>
												</div>
												<div className="space-y-1 text-right">
													<p className="text-[9px] text-white/20 font-black tracking-widest uppercase">
														GASTOS
													</p>
													<p className="text-sm font-mono text-white/80">
														{(
															notionMetrics.totalExpenses || 0
														).toLocaleString()}
														€
													</p>
												</div>
											</div>
										</div>
									</div>
								) : (
									<div className="space-y-6">
										<div className="grid grid-cols-2 gap-6">
											<div className="h-24 bg-white/5 rounded-sm animate-pulse" />
											<div className="h-24 bg-white/5 rounded-sm animate-pulse" />
										</div>
										<div className="h-28 bg-white/5 rounded-sm animate-pulse" />
									</div>
								)}

								<div className="space-y-4 mt-10">
									<button
										onClick={onUpdateDashboard}
										disabled={isUpdatingDashboard}
										className={`w-full group/cmd py-6 px-8 rounded-sm transition-all border relative overflow-hidden flex items-center justify-between ${
											isUpdatingDashboard
												? "bg-brass-gold/10 border-brass-gold/30 text-brass-gold cursor-wait"
												: "bg-white/5 border-white/10 text-white/60 hover:border-accent hover:bg-accent hover:text-nautical-black"
										}`}
									>
										<div className="relative z-10 text-left">
											<div className="flex items-center gap-3 mb-1">
												<span
													className={`w-1.5 h-1.5 rounded-full ${isUpdatingDashboard ? "bg-brass-gold animate-ping" : "bg-accent group-hover/cmd:bg-nautical-black"}`}
												/>
												<span className="text-[10px] font-black uppercase tracking-[0.3em]">
													Comando de Sistema
												</span>
											</div>
											<p className="text-lg font-display italic tracking-wide group-hover/cmd:text-nautical-black">
												{isUpdatingDashboard
													? "Sincronizando Notion Premium..."
													: "Actualizar Premium Dashboard"}
											</p>
										</div>

										<div className="relative z-10">
											{isUpdatingDashboard ? (
												<div className="w-6 h-6 border-2 border-brass-gold border-t-transparent rounded-full animate-spin" />
											) : (
												<span className="text-3xl transition-transform group-hover/cmd:translate-x-2">
													🧭
												</span>
											)}
										</div>

										{!isUpdatingDashboard && (
											<div className="absolute inset-0 bg-gradient-to-r from-accent to-accent/90 opacity-0 group-hover/cmd:opacity-100 transition-opacity" />
										)}
									</button>

									<button
										onClick={onTriggerSync}
										disabled={isSyncing}
										className={`w-full py-4 text-[10px] font-black uppercase tracking-[0.4em] transition-all border border-dashed rounded-sm ${
											isSyncing
												? "border-accent/50 text-accent animate-pulse"
												: "border-white/5 text-white/20 hover:text-accent hover:border-accent/40"
										}`}
									>
										{isSyncing
											? "Ejecutando Puente de Datos..."
											: "Refrescar Sincronización Supabase"}
									</button>
								</div>

								<footer className="mt-10 pt-10 border-t border-white/5 flex flex-col items-center gap-6">
									<a
										href="https://notion.so"
										target="_blank"
										rel="noreferrer"
										className="inline-flex items-center gap-3 text-[10px] text-white/20 hover:text-accent transition-all group/link"
									>
										<span className="uppercase tracking-[0.3em] font-black">
											Acceder a Notion Workspace
										</span>
										<span className="group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform">
											↗
										</span>
									</a>

									<div className="flex flex-col items-center gap-2">
										<div className="flex gap-4 opacity-10 pointer-events-none grayscale">
											<span className="text-[7px] font-mono tracking-widest text-white uppercase">
												Sync Status: Active
											</span>
											<span className="text-[7px] font-mono tracking-widest text-white uppercase">
												Last Sync: {new Date().toLocaleTimeString()}
											</span>
										</div>
										<p className="text-[7px] font-mono text-white/5 uppercase tracking-[0.3em]">
											Operational Dashboard v3.0 // Gold Edition
										</p>
									</div>
								</footer>
							</div>
						</div>
					)}
				</div>
			</div>
		</>
	);
}
