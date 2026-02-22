"use client";

import confetti from "canvas-confetti";
import { AnimatePresence, motion } from "framer-motion";
import {
	ArrowRight,
	BookOpen,
	Check,
	HelpCircle,
	MousePointer2,
	RotateCcw,
	X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { BOAT_PARTS, type BoatPart } from "@/lib/academy/boat-parts-data";
import BoatDiagram from "./BoatDiagram";

type Period = 1 | 2 | 3;

export default function NomenclatureActivity() {
	const [period, setPeriod] = useState<Period>(1);
	const [currentPartIndex, setCurrentPartIndex] = useState(0);
	const [score, setScore] = useState(0);
	const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
	const [selectedId, setSelectedId] = useState<string | null>(null); // For Period 2
	const [shuffledOptions, setShuffledOptions] = useState<BoatPart[]>([]); // For Period 3
	const [completed, setCompleted] = useState(false);

	const currentPart = BOAT_PARTS[currentPartIndex];

	// Reset feedback when changing parts
	useEffect(() => {
		setFeedback(null);
		setSelectedId(null);
		if (period === 3) {
			generateOptions();
		}
	}, [currentPartIndex, period]);

	const generateOptions = () => {
		// Get 2 random wrong answers + correct answer
		const wrong = BOAT_PARTS.filter((p) => p.id !== currentPart.id)
			.sort(() => 0.5 - Math.random())
			.slice(0, 2);
		const options = [...wrong, currentPart].sort(() => 0.5 - Math.random());
		setShuffledOptions(options);
	};

	const handleNext = () => {
		if (currentPartIndex < BOAT_PARTS.length - 1) {
			setCurrentPartIndex((prev) => prev + 1);
		} else {
			// End of Period
			if (period < 3) {
				setPeriod((prev) => (prev + 1) as Period);
				setCurrentPartIndex(0);
				setScore(0);
			} else {
				// End of Activity
				setCompleted(true);
				confetti({
					particleCount: 200,
					spread: 100,
					origin: { y: 0.6 },
				});
			}
		}
	};

	// ... previous handlers ...

	// ... renderCompleted, renderPeriod1, renderPeriod2, renderPeriod3 ...
	// Note: I will only replace the return block and state initialization in this tool call to be safe with line numbers,
	// but the previous tool call already added renderCompleted.
	// Wait, I need to be careful. The previous tool call modified `handleNext` and added `renderCompleted`.
	// I just need to add the state and modify the main return.

	// Let's look at the context again.
	// I need to add `const [completed, setCompleted] = useState(false);` near the top.
	// And update the return block.

	// I will use multi_replace for this to be precise.

	const handlePeriod2Click = (partId: string) => {
		if (feedback) return; // Already answered

		setSelectedId(partId);
		if (partId === currentPart.id) {
			setFeedback("correct");
			setScore((prev) => prev + 1);
			confetti({
				particleCount: 30,
				spread: 30,
				origin: { y: 0.8 },
				colors: ["#34D399"],
			});
			setTimeout(handleNext, 1500);
		} else {
			setFeedback("wrong");
		}
	};

	const handlePeriod3Option = (partId: string) => {
		if (feedback) return;

		if (partId === currentPart.id) {
			setFeedback("correct");
			setScore((prev) => prev + 1);
			confetti({
				particleCount: 30,
				spread: 30,
				origin: { y: 0.8 },
				colors: ["#34D399"],
			});
			setTimeout(handleNext, 1500);
		} else {
			setFeedback("wrong");
		}
	};

	// --- RENDER HELPERS ---

	const renderCompleted = () => (
		<div className="flex flex-col items-center justify-center py-12 text-center h-full">
			<div className="w-24 h-24 bg-accent rounded-full flex items-center justify-center mb-6 animate-bounce">
				<BookOpen className="w-12 h-12 text-nautical-black" />
			</div>
			<h2 className="text-4xl md:text-5xl font-display text-white mb-4">
				¡Lección Completada!
			</h2>
			<p className="text-xl text-white/60 mb-8 max-w-md">
				Has dominado la nomenclatura básica de las partes del barco.
			</p>
			<div className="flex gap-4">
				<button
					onClick={() => {
						setPeriod(1);
						setCurrentPartIndex(0);
						setCompleted(false);
					}}
					className="px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full font-bold uppercase tracking-widest transition-colors flex items-center gap-2"
				>
					<RotateCcw className="w-4 h-4" /> Repetir
				</button>
				{/*
                <button
                    onClick={() => window.location.href = '/academy/dashboard'}
                    className="px-8 py-3 bg-accent text-nautical-black rounded-full font-bold uppercase tracking-widest hover:bg-white transition-colors flex items-center gap-2"
                >
                    Continuar <ArrowRight className="w-4 h-4" />
                </button>
                */}
			</div>
		</div>
	);

	const renderPeriod1 = () => (
		<div className="flex flex-col md:flex-row items-center gap-8 h-full">
			<div className="flex-1 w-full max-w-md aspect-square bg-blue-950/20 rounded-xl p-4 border border-white/5 relative">
				<BoatDiagram highlightId={currentPart.id} />
			</div>

			<div className="flex-1 flex flex-col gap-6 text-center md:text-left">
				<div className="space-y-2">
					<span className="text-accent text-xs font-black uppercase tracking-widest">
						{currentPart.category}
					</span>
					<h2 className="text-4xl md:text-5xl font-display text-white">
						{currentPart.name}
					</h2>
				</div>

				<p className="text-lg text-white/70 leading-relaxed font-light">
					{currentPart.definition}
				</p>

				<button
					onClick={handleNext}
					className="mt-8 self-center md:self-start flex items-center gap-3 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all group"
				>
					<span className="uppercase tracking-widest text-sm font-bold">
						Siguiente
					</span>
					<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
				</button>
			</div>
		</div>
	);

	const renderPeriod2 = () => (
		<div className="flex flex-col h-full items-center">
			<div className="text-center mb-8">
				<h3 className="text-2xl font-light text-white mb-2">
					¿Cuál es:{" "}
					<span className="font-bold text-accent">{currentPart.name}</span>?
				</h3>
				<p className="text-sm text-white/40">
					Toca la parte correcta en el esquema
				</p>
			</div>

			<div className="w-full max-w-lg aspect-square bg-blue-950/20 rounded-xl p-4 border border-white/5 relative">
				<BoatDiagram
					onPartClick={handlePeriod2Click}
					highlightId={feedback === "correct" ? currentPart.id : selectedId} // Provide visual feedback on click
				/>

				{/* Feedback Overlay */}
				<AnimatePresence>
					{feedback === "wrong" && (
						<motion.div
							initial={{ opacity: 0, scale: 0.8 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0 }}
							className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-xl"
						>
							<div className="text-center">
								<X className="w-16 h-16 text-red-500 mx-auto mb-2" />
								<p className="text-white font-bold">Inténtalo de nuevo</p>
								<button
									onClick={() => {
										setFeedback(null);
										setSelectedId(null);
									}}
									className="mt-4 text-sm underline text-white/60"
								>
									Cerrar
								</button>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);

	const renderPeriod3 = () => (
		<div className="flex flex-col md:flex-row items-center gap-8 h-full">
			<div className="flex-1 w-full max-w-md aspect-square bg-blue-950/20 rounded-xl p-4 border border-white/5 relative">
				<BoatDiagram highlightId={currentPart.id} />
			</div>

			<div className="flex-1 flex flex-col items-center w-full">
				<h3 className="text-2xl font-light text-white mb-8">
					¿Qué parte es esta?
				</h3>

				<div className="grid gap-4 w-full max-w-sm">
					{shuffledOptions.map((option) => (
						<button
							key={option.id}
							onClick={() => handlePeriod3Option(option.id)}
							disabled={feedback === "correct"}
							className={`
                                p-4 rounded-lg border text-left flex items-center justify-between transition-all
                                ${
																	feedback === "correct" &&
																	option.id === currentPart.id
																		? "bg-green-500/20 border-green-500 text-green-400"
																		: feedback === "wrong" &&
																				option.id !== currentPart.id // Don't highlight correct one on wrong guess to keep challenge? Or should we? Montessori is self-correcting.
																			? "opacity-50 border-white/10"
																			: "bg-white/5 hover:bg-white/10 border-white/10"
																}
                            `}
						>
							<span className="font-bold tracking-wide">{option.name}</span>
							{feedback === "correct" && option.id === currentPart.id && (
								<Check className="w-5 h-5" />
							)}
						</button>
					))}
				</div>

				{feedback === "wrong" && (
					<p className="mt-4 text-red-400 animate-pulse">Inténtalo de nuevo</p>
				)}
			</div>
		</div>
	);

	return (
		<div className="w-full max-w-5xl mx-auto p-4 md:p-8">
			{/* Header / Progress */}
			<header className="flex items-center justify-between mb-8 md:mb-12">
				<div className="flex items-center gap-4">
					<div
						className={`p-2 rounded-lg ${period === 1 ? "bg-accent text-nautical-black" : "bg-white/5 text-white/40"}`}
					>
						<BookOpen className="w-5 h-5" />
					</div>
					<div
						className={`w-8 h-[1px] ${period >= 2 ? "bg-accent" : "bg-white/10"}`}
					/>
					<div
						className={`p-2 rounded-lg ${period === 2 ? "bg-accent text-nautical-black" : period > 2 ? "bg-green-500 text-nautical-black" : "bg-white/5 text-white/40"}`}
					>
						<MousePointer2 className="w-5 h-5" />
					</div>
					<div
						className={`w-8 h-[1px] ${period >= 3 ? "bg-accent" : "bg-white/10"}`}
					/>
					<div
						className={`p-2 rounded-lg ${period === 3 ? "bg-accent text-nautical-black" : "bg-white/5 text-white/40"}`}
					>
						<HelpCircle className="w-5 h-5" />
					</div>
				</div>

				<div className="text-right">
					<div className="text-2xs uppercase tracking-widest text-white/40 mb-1">
						Lección {period} de 3
					</div>
					<div className="text-sm font-bold text-white">
						{period === 1 && "Asociación"}
						{period === 2 && "Reconocimiento"}
						{period === 3 && "Recuerdo"}
					</div>
				</div>
			</header>

			{/* Main Content Area */}
			<div className="min-h-[500px] bg-nautical-panel rounded-3xl border border-white/5 p-6 md:p-12 shadow-2xl relative overflow-hidden">
				<AnimatePresence mode="wait">
					<motion.div
						key={completed ? "completed" : `${period}-${currentPartIndex}`}
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: -20 }}
						className="h-full"
					>
						{completed && renderCompleted()}
						{!completed && period === 1 && renderPeriod1()}
						{!completed && period === 2 && renderPeriod2()}
						{!completed && period === 3 && renderPeriod3()}
					</motion.div>
				</AnimatePresence>
			</div>

			{/* Footer Progress Bar */}
			{!completed && (
				<div className="mt-8 flex items-center gap-4">
					<div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
						<div
							className="h-full bg-accent transition-all duration-500"
							style={{
								width: `${((currentPartIndex + 1) / BOAT_PARTS.length) * 100}%`,
							}}
						/>
					</div>
					<span className="text-xs font-mono text-white/40">
						{currentPartIndex + 1} / {BOAT_PARTS.length}
					</span>
				</div>
			)}
		</div>
	);
}
