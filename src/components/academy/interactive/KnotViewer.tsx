"use client";

import { ChevronLeft, ChevronRight, PlayCircle } from "lucide-react";
import React, { useState } from "react";
import type { Knot } from "@/lib/academy/knots-data";

interface KnotViewerProps {
	knot: Knot;
}

export default function KnotViewer({ knot }: KnotViewerProps) {
	const [currentStep, setCurrentStep] = useState(0);

	const handleNext = () => {
		if (currentStep < knot.steps.length - 1) {
			setCurrentStep((prev) => prev + 1);
		}
	};

	const handlePrev = () => {
		if (currentStep > 0) {
			setCurrentStep((prev) => prev - 1);
		}
	};

	return (
		<div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden flex flex-col md:flex-row shadow-2xl">
			{/* Visual Area */}
			<div className="flex-1 bg-gradient-to-br from-nautical-black to-[#1a2c42] relative min-h-[300px] flex items-center justify-center p-8">
				{/* Step Indicator (Top) */}
				<div className="absolute top-4 left-0 right-0 flex justify-center gap-2">
					{knot.steps.map((_, idx) => (
						<div
							key={idx}
							className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentStep ? "w-8 bg-accent" : "w-2 bg-white/20"}`}
						/>
					))}
				</div>

				{/* Animated Placeholder for Step */}
				<div className="text-center">
					<div className="w-48 h-48 rounded-full border-4 border-white/10 flex items-center justify-center bg-white/5 mb-6 mx-auto relative group cursor-pointer hover:scale-105 transition-transform">
						{/* If we had images, they would go here. For now, using step number art */}
						<span className="text-8xl font-black text-white/5 select-none">
							{currentStep + 1}
						</span>
						<div className="absolute inset-0 flex items-center justify-center">
							<span className="text-4xl">🪢</span>
						</div>
						{knot.video_url && (
							<div className="absolute bottom-2 right-2 p-2 bg-red-600 rounded-full shadow-lg">
								<PlayCircle className="w-4 h-4 text-white" />
							</div>
						)}
					</div>
					<p className="text-white/40 text-2xs uppercase tracking-widest">
						Paso {currentStep + 1} de {knot.steps.length}
					</p>
				</div>
			</div>

			{/* Instruction Area */}
			<div className="w-full md:w-80 bg-white/5 border-t md:border-t-0 md:border-l border-white/10 p-8 flex flex-col justify-between">
				<div>
					<div className="flex items-center justify-between mb-4">
						<h3 className="text-2xl font-display italic text-white">
							{knot.name}
						</h3>
						<span
							className={`text-3xs font-black uppercase px-2 py-1 rounded bg-white/10 ${
								knot.difficulty === "facil"
									? "text-green-400"
									: knot.difficulty === "medio"
										? "text-yellow-400"
										: "text-red-400"
							}`}
						>
							{knot.difficulty}
						</span>
					</div>

					<p className="text-white/60 text-sm mb-8 leading-relaxed">
						{knot.description}
					</p>

					<div className="bg-nautical-black/50 p-4 rounded-lg border border-white/5 min-h-[100px]">
						<h4 className="text-accent text-2xs font-bold uppercase tracking-widest mb-2">
							Instrucción:
						</h4>
						<p className="text-white text-lg font-light leading-snug animate-fade-in key={currentStep}">
							{knot.steps[currentStep].description}
						</p>
					</div>
				</div>

				<div className="flex items-center justify-between mt-8 gap-4">
					<button
						onClick={handlePrev}
						disabled={currentStep === 0}
						className={`flex-1 py-3 flex items-center justify-center gap-2 rounded border border-white/10 transition-colors
                            ${currentStep === 0 ? "opacity-30 cursor-not-allowed" : "hover:bg-white/10 hover:border-white/30 text-white"}
                        `}
					>
						<ChevronLeft className="w-4 h-4" /> Anterior
					</button>
					<button
						onClick={handleNext}
						disabled={currentStep === knot.steps.length - 1}
						className={`flex-1 py-3 flex items-center justify-center gap-2 rounded border transition-colors
                            ${
															currentStep === knot.steps.length - 1
																? "bg-green-500/20 border-green-500/30 text-green-400 cursor-default"
																: "bg-accent text-nautical-black border-accent hover:bg-white hover:border-white font-bold"
														}
                         `}
					>
						{currentStep === knot.steps.length - 1 ? "Completado" : "Siguiente"}
						{currentStep < knot.steps.length - 1 && (
							<ChevronRight className="w-4 h-4" />
						)}
					</button>
				</div>
			</div>
		</div>
	);
}
