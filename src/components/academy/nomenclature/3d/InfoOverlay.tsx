"use client";

import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Check, HelpCircle, RotateCcw, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { BOAT_PARTS, BoatPart } from "@/lib/academy/boat-parts-data";

interface InfoOverlayProps {
	selectedId: string | null;
	hoveredId: string | null;
	onClose: () => void;
}

export default function InfoOverlay({
	selectedId,
	hoveredId,
	onClose,
}: InfoOverlayProps) {
	const [quizMode, setQuizMode] = useState(false);
	const [quizResult, setQuizResult] = useState<"correct" | "wrong" | null>(
		null,
	);

	// Reset local state when selected part changes
	useEffect(() => {
		setQuizMode(false);
		setQuizResult(null);
	}, [selectedId]);

	// Determine which part to show info for (prioritize selected, then hovered)
	// Actually, hovered info should be subtle (tooltip), selected info should be the full card.
	// Let's create a tooltip for hover and a card for selection.

	const selectedPart = selectedId
		? BOAT_PARTS.find((p) => p.id === selectedId)
		: null;
	const hoveredPart = hoveredId
		? BOAT_PARTS.find((p) => p.id === hoveredId)
		: null;

	const handleQuizOption = (index: number) => {
		if (!selectedPart) return;
		if (index === selectedPart.quiz.answer) {
			setQuizResult("correct");
		} else {
			setQuizResult("wrong");
		}
	};

	return (
		<>
			{/* HOVER TOOLTIP (Mouse follower or fixed position) */}
			<AnimatePresence>
				{hoveredPart && !selectedPart && (
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0 }}
						className="fixed bottom-8 left-1/2 -translate-x-1/2 z-10 bg-black/80 backdrop-blur-md text-white px-4 py-2 rounded-full pointer-events-none border border-white/10 shadow-xl"
					>
						<span className="font-bold text-sm tracking-widest uppercase">
							{hoveredPart.name}
						</span>
					</motion.div>
				)}
			</AnimatePresence>

			{/* SELECTED PART CARD */}
			<AnimatePresence>
				{selectedPart && (
					<motion.div
						initial={{ opacity: 0, x: "100%" }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: "100%" }}
						transition={{ type: "spring", damping: 25, stiffness: 200 }}
						className="fixed top-24 right-4 bottom-4 w-full max-w-md bg-nautical-panel backdrop-blur-xl border-l border-white/10 shadow-2xl z-20 overflow-y-auto rounded-l-3xl p-6 md:p-8 flex flex-col"
					>
						{/* HEADER */}
						<div className="flex justify-between items-start mb-6">
							<div>
								<span className="text-xs font-mono text-accent uppercase tracking-widest block mb-2">
									{selectedPart.category === "structure" && "Estructura"}
									{selectedPart.category === "rigging" && "Aparejo"}
									{selectedPart.category === "sails" && "Velas"}
									{selectedPart.category === "deck" && "Maniobra"}
								</span>
								<h2 className="text-3xl font-display text-white">
									{selectedPart.name}
								</h2>
							</div>
							<button
								onClick={onClose}
								className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white"
							>
								<X className="w-6 h-6" />
							</button>
						</div>

						{/* CONTENT */}
						<div className="flex-1 space-y-8">
							{!quizMode ? (
								<>
									{/* DEFINITION & FUNCTION */}
									<div className="space-y-6">
										<div className="bg-blue-950/30 p-4 rounded-xl border border-blue-500/20">
											<div className="flex items-center gap-2 mb-2 text-blue-300">
												<BookOpen className="w-4 h-4" />
												<h3 className="text-xs font-bold uppercase tracking-widest">
													Definición
												</h3>
											</div>
											<p className="text-white/80 leading-relaxed font-light">
												{selectedPart.definition}
											</p>
										</div>

										<div className="bg-emerald-950/30 p-4 rounded-xl border border-emerald-500/20">
											<div className="flex items-center gap-2 mb-2 text-emerald-300">
												<RotateCcw className="w-4 h-4" />{" "}
												{/* Icon representing function/action */}
												<h3 className="text-xs font-bold uppercase tracking-widest">
													Función
												</h3>
											</div>
											<p className="text-white/80 leading-relaxed font-light">
												{selectedPart.function}
											</p>
										</div>
									</div>

									{/* QUIZ CTA */}
									<button
										onClick={() => setQuizMode(true)}
										className="w-full py-4 bg-accent hover:bg-white text-nautical-black font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-accent/20 flex items-center justify-center gap-2 group"
									>
										<HelpCircle className="w-5 h-5 group-hover:rotate-12 transition-transform" />
										Pregunta de Repaso
									</button>
								</>
							) : (
								/* QUIZ MODE */
								<motion.div
									initial={{ opacity: 0, scale: 0.95 }}
									animate={{ opacity: 1, scale: 1 }}
									className="h-full flex flex-col"
								>
									<div className="mb-6">
										<button
											onClick={() => setQuizMode(false)}
											className="text-xs text-white/40 hover:text-white mb-4 flex items-center gap-1 transition-colors"
										>
											← Volver a información
										</button>
										<h3 className="text-xl font-light text-white mb-6">
											{selectedPart.quiz.question}
										</h3>

										<div className="space-y-3">
											{selectedPart.quiz.options.map((option, index) => {
												const isSelected = quizResult !== null;
												const isCorrect = index === selectedPart.quiz.answer;

												let btnClass =
													"w-full p-4 text-left rounded-xl border transition-all relative overflow-hidden ";

												if (!isSelected) {
													btnClass +=
														"bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white";
												} else {
													if (isCorrect) {
														btnClass +=
															"bg-green-500/20 border-green-500 text-green-300";
													} else if (quizResult === "wrong" && !isCorrect) {
														// Dim incorrect options
														btnClass +=
															"opacity-50 bg-white/5 border-transparent text-white/40";
													}
												}

												return (
													<button
														key={index}
														onClick={() =>
															!isSelected && handleQuizOption(index)
														}
														className={btnClass}
														disabled={isSelected}
													>
														<span className="relative z-10 font-medium">
															{option}
														</span>
														{isSelected && isCorrect && (
															<Check className="absolute right-4 top-1/2 -translate-y-1/2 text-green-400 w-5 h-5" />
														)}
													</button>
												);
											})}
										</div>
									</div>

									{/* FEEDBACK */}
									{quizResult === "correct" && (
										<motion.div
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											className="mt-auto p-4 bg-green-500/20 border border-green-500/30 rounded-xl text-center"
										>
											<p className="text-green-300 font-bold mb-2">
												¡Correcto!
											</p>
											<button
												onClick={onClose}
												className="text-xs underline text-green-200/60 hover:text-green-200"
											>
												Explorar otra parte
											</button>
										</motion.div>
									)}

									{quizResult === "wrong" && (
										<motion.div
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											className="mt-auto p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-center"
										>
											<p className="text-red-300 font-bold mb-2">Incorrecto</p>
											<button
												onClick={() => setQuizResult(null)}
												className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors text-white"
											>
												Intentar de nuevo
											</button>
										</motion.div>
									)}
								</motion.div>
							)}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}
