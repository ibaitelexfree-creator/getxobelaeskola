import Image from "next/image";
import React, { useEffect, useState } from "react";
import MotivationalMessages from "@/components/academy/MotivationalMessages";
import type { EvaluationResult } from "./types";

interface ResultScreenProps {
	result: EvaluationResult;
	onRetry: () => void;
	onClose: () => void;
	maxAttemptsExceeded?: boolean;
	cooldownActive?: boolean;
}

/**
 * Componente para animar el conteo de números
 */
const CountingNumber = ({
	value,
	duration = 2000,
}: {
	value: number;
	duration?: number;
}) => {
	const [count, setCount] = useState(0);

	useEffect(() => {
		let startTimestamp: number | null = null;
		const step = (timestamp: number) => {
			if (!startTimestamp) startTimestamp = timestamp;
			const progress = Math.min((timestamp - startTimestamp) / duration, 1);
			setCount(Math.floor(progress * value));
			if (progress < 1) {
				window.requestAnimationFrame(step);
			}
		};
		window.requestAnimationFrame(step);
	}, [value, duration]);

	return <>{count}</>;
};

export default function ResultScreen({
	result,
	onRetry,
	onClose,
	maxAttemptsExceeded = false,
	cooldownActive = false,
}: ResultScreenProps) {
	const isPassing = result.passed;
	const [showDetails, setShowDetails] = useState(false);

	return (
		<>
			<MotivationalMessages
				type={isPassing ? "quiz_passed" : "quiz_failed"}
				context={{ score: Math.round(result.score) }}
			/>
			<div className="flex flex-col items-center justify-center p-6 md:p-12 space-y-10 animate-in zoom-in-95 fade-in duration-700 max-w-4xl mx-auto text-center bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
				{/* Success Decoration */}
				{isPassing && (
					<div className="absolute inset-0 z-0 pointer-events-none opacity-30">
						<Image
							src="/images/feedback-success-confetti.webp"
							alt="Celebración"
							fill
							className="object-cover scale-110 opacity-60"
							aria-hidden="true"
						/>
					</div>
				)}

				{/* Background Glow */}
				<div
					className={`absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 blur-[100px] pointer-events-none opacity-20 ${isPassing ? "bg-green-500" : "bg-red-500"}`}
				/>

				<div className="relative z-10 w-full flex flex-col items-center space-y-10">
					{/* Status Decoration */}
					<div
						className={`relative w-32 h-32 rounded-full flex items-center justify-center shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] ${
							isPassing
								? "bg-green-500/10 ring-1 ring-green-500/30 shadow-green-500/10"
								: "bg-red-500/10 ring-1 ring-red-500/30 shadow-red-500/10"
						}`}
					>
						<div className="relative w-20 h-20">
							<Image
								src={
									isPassing
										? "/images/icon-result-success.svg"
										: "/images/icon-result-fail.svg"
								}
								alt={isPassing ? "Aprobado" : "Suspenso"}
								fill
								className="object-contain"
							/>
						</div>
						<div
							className={`absolute inset-[-8px] border border-dashed rounded-full animate-[spin_15s_linear_infinite] opacity-20 ${isPassing ? "border-green-500" : "border-red-500"}`}
						/>
					</div>

					{/* Score Display */}
					<div className="space-y-4">
						<h2
							className={`text-3xl md:text-4xl font-black uppercase tracking-tighter ${isPassing ? "text-green-400" : "text-red-400"}`}
						>
							{isPassing ? "¡Objetivo Logrado!" : "Revisión Necesaria"}
						</h2>
						<div className="flex items-baseline justify-center gap-1">
							<span className="text-7xl md:text-8xl font-black text-white tracking-tighter tabular-nums">
								<CountingNumber value={Math.round(result.score)} />
							</span>
							<span className="text-2xl md:text-3xl text-slate-500 font-medium lowercase">
								/ 100
							</span>
						</div>
						<p className="text-slate-300 text-sm md:text-base max-w-md mx-auto font-light leading-relaxed">
							{result.feedback}
						</p>
					</div>

					{/* Detailed Review Section */}
					{result.details && result.details.length > 0 && (
						<div className="w-full space-y-4">
							<button
								onClick={() => setShowDetails(!showDetails)}
								aria-expanded={showDetails}
								aria-controls="detailed-review-section"
								className="text-2xs uppercase tracking-widest font-bold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2 mx-auto focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm outline-none px-2 py-1"
							>
								{showDetails ? "Ocultar Revisión" : "Ver Revisión Detallada"}
								<svg
									className={`w-3 h-3 transition-transform duration-300 ${showDetails ? "rotate-180" : ""}`}
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									aria-hidden="true"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={3}
										d="M19 9l-7 7-7-7"
									/>
								</svg>
							</button>

							{showDetails && (
								<div
									id="detailed-review-section"
									className="w-full space-y-3 text-left animate-in slide-in-from-top-4 duration-500 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar"
									role="region"
									aria-label="Revisión detallada de preguntas"
								>
									{result.details.map((detail, idx) => (
										<div
											key={idx}
											className={`p-5 rounded-2xl border backdrop-blur-sm ${
												detail.isCorrect
													? "bg-green-500/5 border-green-500/20"
													: "bg-red-500/5 border-red-500/20"
											}`}
										>
											<div className="flex items-start gap-4">
												<div
													className={`mt-1 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-3xs font-bold ${
														detail.isCorrect
															? "bg-green-500 text-green-950"
															: "bg-red-500 text-red-950"
													}`}
												>
													{idx + 1}
												</div>
												<div className="flex-1 space-y-3">
													<p className="text-sm font-medium text-white/90">
														{detail.enunciado_es}
													</p>

													<div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-2xs">
														<div className="space-y-1">
															<span className="text-slate-400 uppercase tracking-wider font-bold text-3xs">
																Tu respuesta
															</span>
															<p
																className={`font-semibold ${detail.isCorrect ? "text-green-400" : "text-red-400"}`}
															>
																{detail.userAnswer || "(Sin respuesta)"}
															</p>
														</div>
														{!detail.isCorrect && (
															<div className="space-y-1">
																<span className="text-slate-400 uppercase tracking-wider font-bold text-3xs">
																	Respuesta correcta
																</span>
																<p className="text-green-400 font-semibold">
																	{detail.correctAnswer}
																</p>
															</div>
														)}
													</div>

													{detail.explicacion_es && (
														<div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/5 italic text-2xs text-slate-400 leading-relaxed">
															<span className="block not-italic font-bold text-blue-400 mb-1 tracking-widest uppercase text-3xs">
																💡 Nota técnica
															</span>
															"{detail.explicacion_es}"
														</div>
													)}
												</div>
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					)}

					{/* Action Buttons */}
					<div className="flex flex-col sm:flex-row gap-4 w-full pt-4">
						{!isPassing && (
							<button
								onClick={onRetry}
								disabled={maxAttemptsExceeded || cooldownActive}
								className={`flex flex-1 items-center justify-center gap-3 py-4 px-6 rounded-xl font-bold text-2xs uppercase tracking-widest transition-all ${
									maxAttemptsExceeded || cooldownActive
										? "bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5"
										: "bg-white text-black hover:bg-slate-200 shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95"
								}`}
							>
								<span>
									{maxAttemptsExceeded
										? "Intentos Agotados"
										: cooldownActive
											? "Cooldown Activo"
											: "Reintentar Evaluación"}
								</span>
								{cooldownActive && (
									<span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
								)}
							</button>
						)}

						<button
							onClick={onClose}
							className={`flex-1 py-4 px-6 rounded-xl font-bold text-2xs uppercase tracking-widest transition-all border ${
								isPassing
									? "bg-blue-600 border-blue-500 hover:bg-blue-500 text-white shadow-[0_0_30px_rgba(37,99,235,0.3)] active:scale-95"
									: "bg-transparent border-white/10 text-slate-400 hover:text-white hover:bg-white/5"
							}`}
						>
							{isPassing ? "Siguiente Unidad →" : "Volver al Curso"}
						</button>
					</div>
				</div>
			</div>
		</>
	);
}
