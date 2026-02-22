"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
	AlertCircle,
	Book,
	CheckCircle2,
	ChevronRight,
	Smile,
	Sparkles,
	X,
} from "lucide-react";
import React, { useState } from "react";
import { useAcademyFeedback } from "@/hooks/useAcademyFeedback";
import { apiUrl } from "@/lib/api";

interface JourneyCompletionModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSaveSuccess: () => void;
}

export default function JourneyCompletionModal({
	isOpen,
	onClose,
	onSaveSuccess,
}: JourneyCompletionModalProps) {
	const [step, setStep] = useState(1);
	const [learned, setLearned] = useState("");
	const [improved, setImproved] = useState("");
	const [mistakes, setMistakes] = useState("");
	const [isSaving, setIsSaving] = useState(false);
	const { showMessage } = useAcademyFeedback();

	const handleSave = async () => {
		setIsSaving(true);
		try {
			const contenido = `🎓 APRENDIDO: ${learned}\n\n🚀 MEJORADO: ${improved}\n\n⚠️ EQUIVOCADO/RETOS: ${mistakes}`;

			const res = await fetch(apiUrl("/api/logbook/diary"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					contenido,
					tags: ["travesia_completada", "auto_reflexion"],
					estado_animo: "achieved",
				}),
			});

			if (res.ok) {
				showMessage(
					"¡Excelente!",
					"Tu reflexión ha sido guardada en la bitácora.",
					"success",
				);
				onSaveSuccess();
				onClose();
			} else {
				showMessage(
					"Error",
					"No pudimos guardar tu diario. Inténtalo de nuevo.",
					"error",
				);
			}
		} catch (error) {
			console.error("Error saving reflection:", error);
			showMessage("Error", "Error de conexión", "error");
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<AnimatePresence>
			{isOpen && (
				<div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
					<motion.div
						initial={{ opacity: 0, scale: 0.9, y: 20 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.9, y: 20 }}
						className="relative w-full max-w-2xl bg-[#0a1628] border border-accent/20 rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(255,191,0,0.15)]"
					>
						{/* Header Decoration */}
						<div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-accent/10 to-transparent pointer-events-none" />
						<div className="absolute top-10 right-10 opacity-10 blur-2xl w-32 h-32 bg-accent rounded-full animate-pulse" />

						<button
							onClick={onClose}
							className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors z-10"
						>
							<X size={24} />
						</button>

						<div className="p-12 relative z-10">
							{/* Step Indicator */}
							<div className="flex gap-2 mb-12">
								{[1, 2, 3].map((s) => (
									<div
										key={s}
										className={`h-1 duration-500 rounded-full transition-all ${step >= s ? "w-12 bg-accent" : "w-4 bg-white/10"}`}
									/>
								))}
							</div>

							{step === 1 && (
								<motion.div
									initial={{ opacity: 0, x: 20 }}
									animate={{ opacity: 1, x: 0 }}
									className="space-y-8"
								>
									<header>
										<div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/10 rounded-full border border-accent/20 mb-4">
											<Sparkles size={14} className="text-accent" />
											<span className="text-[10px] font-black uppercase tracking-widest text-accent">
												Travesía Finalizada
											</span>
										</div>
										<h2 className="text-4xl font-display italic text-white mb-2">
											¡Bienvenido a puerto!
										</h2>
										<p className="text-white/40 text-sm">
											Tu track ha sido registrado con éxito. Antes de terminar,
											cuéntanos qué has{" "}
											<span className="text-white font-bold italic">
												aprendido
											</span>{" "}
											hoy.
										</p>
									</header>

									<textarea
										value={learned}
										onChange={(e) => setLearned(e.target.value)}
										placeholder="Hoy comprendí mejor cómo trimar la vela mayor en ceñida..."
										className="w-full h-40 bg-white/5 border border-white/10 rounded-3xl p-6 text-white text-lg font-serif italic focus:outline-none focus:border-accent/40 placeholder:text-white/10 transition-all resize-none"
									/>

									<button
										onClick={() => setStep(2)}
										disabled={!learned.trim()}
										className="w-full py-5 bg-accent text-nautical-black font-black uppercase tracking-widest text-sm rounded-2xl flex items-center justify-center gap-3 shadow-xl hover:shadow-accent/20 transition-all active:scale-95 disabled:opacity-20"
									>
										Siguiente Paso <ChevronRight size={18} />
									</button>
								</motion.div>
							)}

							{step === 2 && (
								<motion.div
									initial={{ opacity: 0, x: 20 }}
									animate={{ opacity: 1, x: 0 }}
									className="space-y-8"
								>
									<header>
										<div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 rounded-full border border-blue-500/20 mb-4">
											<Smile size={14} className="text-blue-400" />
											<span className="text-[10px] font-black uppercase tracking-widest text-blue-400">
												Progreso Detectado
											</span>
										</div>
										<h2 className="text-4xl font-display italic text-white mb-2">
											¿En qué has mejorado?
										</h2>
										<p className="text-white/40 text-sm">
											Identificar tus avances es clave para subir de rango. ¿Qué
											maniobra te salió{" "}
											<span className="text-blue-400 font-bold italic">
												más fluida
											</span>{" "}
											hoy?
										</p>
									</header>

									<textarea
										value={improved}
										onChange={(e) => setImproved(e.target.value)}
										placeholder="Mi virada es ahora mucho más rápida y pierdo menos arrancada..."
										className="w-full h-40 bg-white/5 border border-white/10 rounded-3xl p-6 text-white text-lg font-serif italic focus:outline-none focus:border-blue-500/40 placeholder:text-white/10 transition-all resize-none"
									/>

									<div className="flex gap-4">
										<button
											onClick={() => setStep(1)}
											className="flex-1 py-5 bg-white/5 text-white/40 font-black uppercase tracking-widest text-sm rounded-2xl border border-white/10"
										>
											Atrás
										</button>
										<button
											onClick={() => setStep(3)}
											disabled={!improved.trim()}
											className="flex-[2] py-5 bg-accent text-nautical-black font-black uppercase tracking-widest text-sm rounded-2xl flex items-center justify-center gap-3 shadow-xl hover:shadow-accent/20 transition-all active:scale-95 disabled:opacity-20"
										>
											Último Paso <ChevronRight size={18} />
										</button>
									</div>
								</motion.div>
							)}

							{step === 3 && (
								<motion.div
									initial={{ opacity: 0, x: 20 }}
									animate={{ opacity: 1, x: 0 }}
									className="space-y-8"
								>
									<header>
										<div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 rounded-full border border-red-500/20 mb-4">
											<AlertCircle size={14} className="text-red-400" />
											<span className="text-[10px] font-black uppercase tracking-widest text-red-400">
												Análisis Crítico
											</span>
										</div>
										<h2 className="text-4xl font-display italic text-white mb-2">
											¿Qué salió mal?
										</h2>
										<p className="text-white/40 text-sm">
											Incluso los capitanes fallan. ¿Dónde te has{" "}
											<span className="text-red-400 font-bold italic">
												equivocado
											</span>{" "}
											o qué reto te ha costado superar?
										</p>
									</header>

									<textarea
										value={mistakes}
										onChange={(e) => setMistakes(e.target.value)}
										placeholder="Me costó leer la racha de viento al entrar en puerto y casi pierdo el control..."
										className="w-full h-40 bg-white/5 border border-white/10 rounded-3xl p-6 text-white text-lg font-serif italic focus:outline-none focus:border-red-500/40 placeholder:text-white/10 transition-all resize-none"
									/>

									<div className="flex gap-4">
										<button
											onClick={() => setStep(2)}
											className="flex-1 py-5 bg-white/5 text-white/40 font-black uppercase tracking-widest text-sm rounded-2xl border border-white/10"
										>
											Atrás
										</button>
										<button
											onClick={handleSave}
											disabled={!mistakes.trim() || isSaving}
											className="flex-[2] py-5 bg-emerald-500 text-white font-black uppercase tracking-widest text-sm rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/20 hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-20"
										>
											{isSaving ? (
												"Guardando..."
											) : (
												<>
													Guardar en Bitácora <CheckCircle2 size={18} />
												</>
											)}
										</button>
									</div>
								</motion.div>
							)}
						</div>

						{/* Footer branding */}
						<div className="bg-black/40 p-6 flex items-center justify-center gap-3 border-t border-white/5">
							<Book size={14} className="text-white/20" />
							<span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
								Getxo Bela Eskola Digital Logbook
							</span>
						</div>
					</motion.div>
				</div>
			)}
		</AnimatePresence>
	);
}
