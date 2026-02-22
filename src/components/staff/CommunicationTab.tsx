"use client";
import { useTranslations } from "next-intl";
import React from "react";
import { apiUrl } from "@/lib/api";
import CampaignManager from "./marketing/CampaignManager";
import { ClientDate } from "./StaffShared";

interface Newsletter {
	id: string;
	title: string;
	content: string;
	status: string;
	created_at: string;
	scheduled_for?: string;
	sent_at?: string;
	recipients_count?: number;
}

interface CommunicationTabProps {
	newsletters: Newsletter[];
	onSendMessage: (data: {
		title: string;
		content: string;
		scheduled_for?: string;
	}) => Promise<void>;
	isSending: boolean;
}

export default function CommunicationTab({
	newsletters,
	onSendMessage,
	isSending,
}: CommunicationTabProps) {
	const t = useTranslations("staff_panel");
	const [title, setTitle] = React.useState("");
	const [content, setContent] = React.useState("");
	const [scheduledFor, setScheduledFor] = React.useState("");

	// Marketing Automation State
	const [isProcessingMarketing, setIsProcessingMarketing] =
		React.useState(false);
	const [marketingResult, setMarketingResult] = React.useState<{
		success: boolean;
		totalSent?: number;
		error?: string;
	} | null>(null);

	const handleSubmit = async () => {
		if (!title || !content) {
			alert("Por favor rellena el título y contenido");
			return;
		}
		await onSendMessage({
			title,
			content,
			scheduled_for: scheduledFor || undefined,
		});
		setTitle("");
		setContent("");
		setScheduledFor("");
	};

	const handleRunMarketing = async () => {
		if (
			!confirm(
				"¿Deseas ejecutar las automatizaciones de marketing ahora? Esto enviará correos a los alumnos que cumplan los criterios.",
			)
		)
			return;

		setIsProcessingMarketing(true);
		setMarketingResult(null);
		try {
			const res = await fetch(apiUrl("/api/admin/marketing/process"), {
				method: "POST",
			});
			const data = await res.json();
			setMarketingResult({
				success: data.success,
				totalSent: data.totalSent,
				error: data.error,
			});
		} catch (err) {
			setMarketingResult({ success: false, error: "Error de red" });
		} finally {
			setIsProcessingMarketing(false);
		}
	};

	return (
		<div className="space-y-12 animate-premium-in">
			<header className="flex justify-between items-end border-b border-white/10 pb-12">
				<div className="space-y-2">
					<span className="text-accent uppercase tracking-[0.4em] text-3xs font-bold block">
						Central de Operaciones
					</span>
					<h2 className="text-6xl font-display text-white italic">
						{t("communication.title")}
					</h2>
					<p className="text-technical text-white/40 tracking-[0.2em] uppercase">
						{t("communication.subtitle")}
					</p>
				</div>
			</header>

			{/* MARKETING AUTOMATION PANEL */}
			<div className="glass-panel p-12 border-l-4 border-accent relative overflow-hidden">
				<div className="absolute top-0 right-0 p-8 opacity-10">
					<svg
						className="w-24 h-24 text-accent"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={1}
							d="M13 10V3L4 14h7v7l9-11h-7z"
						/>
					</svg>
				</div>
				<div className="relative z-10 space-y-6">
					<div className="flex justify-between items-start">
						<div className="space-y-2">
							<h3 className="text-2xl font-display text-white italic">
								Estrategia de Marketing Automatizado
							</h3>
							<p className="text-sm text-white/40 max-w-2xl font-mono">
								El sistema revisa automáticamente qué alumnos no han vuelto en 3
								meses desde su último curso de "Iniciación" y les envía un cupón
								de descuento personalizado para el curso de "Perfeccionamiento".
							</p>
						</div>
						<button
							onClick={handleRunMarketing}
							disabled={isProcessingMarketing}
							className="px-8 py-4 bg-white/5 border border-accent/30 text-accent text-[10px] uppercase tracking-[0.3em] font-black hover:bg-accent hover:text-nautical-black transition-all disabled:opacity-50"
						>
							{isProcessingMarketing ? "PROCESANDO..." : "EJECUTAR MANUALMENTE"}
						</button>
					</div>

					{marketingResult && (
						<div
							className={`p-6 border ${marketingResult.success ? "border-green-500/20 bg-green-500/5" : "border-red-500/20 bg-red-500/5"} rounded-sm animate-premium-in`}
						>
							<div className="flex items-center gap-4">
								<span
									className={`w-2 h-2 rounded-full ${marketingResult.success ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
								/>
								<span className="text-2xs uppercase tracking-widest font-bold text-white/80">
									{marketingResult.success
										? `Automatización completada con éxito. Se han enviado ${marketingResult.totalSent} correos.`
										: `Error en el proceso: ${marketingResult.error || "Desconocido"}`}
								</span>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* CAMPAIGN MANAGEMENT UI */}
			<CampaignManager />

			<div className="grid lg:grid-cols-2 gap-16">
				<div className="space-y-8 glass-panel p-12 relative overflow-hidden">
					<h3 className="text-2xl font-display text-white italic border-b border-white/5 pb-6">
						{t("communication.new_message")}
					</h3>
					<div className="space-y-6">
						<div className="space-y-2">
							<label className="text-3xs uppercase tracking-[0.3em] text-white/30 font-bold">
								{t("communication.subject")}
							</label>
							<input
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								className="w-full bg-white/5 border border-white/10 p-5 text-white font-display italic outline-none focus:border-accent"
							/>
						</div>
						<div className="space-y-2">
							<label className="text-3xs uppercase tracking-[0.3em] text-white/30 font-bold">
								{t("communication.content")}
							</label>
							<textarea
								value={content}
								onChange={(e) => setContent(e.target.value)}
								className="w-full h-64 bg-white/5 border border-white/10 p-5 text-white italic outline-none focus:border-accent resize-none custom-scrollbar"
							/>
						</div>
						<div className="space-y-2">
							<label className="text-3xs uppercase tracking-[0.3em] text-white/30 font-bold">
								{t("communication.schedule")}
							</label>
							<input
								type="datetime-local"
								value={scheduledFor}
								onChange={(e) => setScheduledFor(e.target.value)}
								className="w-full bg-white/5 border border-white/10 p-5 text-white font-mono text-2xs outline-none focus:border-accent"
							/>
						</div>
						<button
							onClick={handleSubmit}
							disabled={isSending}
							className="w-full py-6 bg-accent text-nautical-black text-2xs uppercase tracking-[0.5em] font-black hover:bg-white transition-all shadow-xl shadow-accent/20 disabled:opacity-50"
						>
							{isSending
								? "PROCESANDO..."
								: scheduledFor
									? t("communication.save_schedule")
									: "ENVIAR AHORA"}
						</button>
					</div>
				</div>

				<div className="space-y-8">
					<h3 className="text-2xl font-display text-white italic border-b border-white/5 pb-6">
						{t("communication.history")}
					</h3>
					<div className="space-y-6">
						{newsletters.length > 0 ? (
							newsletters.map((msg, i) => (
								<div
									key={i}
									className="p-8 border border-white/5 rounded-sm hover:bg-white/5 transition-all group"
								>
									<div className="flex justify-between items-start mb-4">
										<h4 className="text-lg font-display text-white italic group-hover:text-accent transition-colors">
											{msg.title}
										</h4>
										<span className="text-technical text-white/20">
											{msg.recipients_count || 0}{" "}
											{t("communication.messages_count")}
										</span>
									</div>
									<p className="text-sm text-white/40 font-mono mb-4 italic truncate">
										&quot;{msg.content}&quot;
									</p>
									<div className="flex justify-between items-center text-[8px] uppercase tracking-widest text-white/20 font-black">
										<span>
											<ClientDate date={msg.created_at} format="short" />
										</span>
										<span className="text-accent">
											{msg.status === "scheduled"
												? t("communication.scheduled_for")
												: "ENVIADO"}
										</span>
									</div>
								</div>
							))
						) : (
							<div className="p-24 border border-dashed border-white/5 text-center italic text-white/20 font-display text-xl">
								{t("communication.no_messages")}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
