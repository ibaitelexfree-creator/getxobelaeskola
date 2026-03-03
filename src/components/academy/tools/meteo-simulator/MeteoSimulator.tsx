"use client";

import { Anchor, CloudRain, Trophy } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
import { METEO_SCENARIOS, MeteoScenario } from "@/data/academy/meteo-scenarios";
import DecisionForm, { type UserDecision } from "./DecisionForm";
import FeedbackResult from "./FeedbackResult";
import ScenarioDisplay from "./ScenarioDisplay";

export default function MeteoSimulator() {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [userDecision, setUserDecision] = useState<UserDecision | null>(null);
	const [submitted, setSubmitted] = useState(false);
	const [completed, setCompleted] = useState(false);
	const [score, setScore] = useState(0);

	const currentScenario = METEO_SCENARIOS[currentIndex];

	const handleSubmit = (decision: UserDecision) => {
		setUserDecision(decision);
		setSubmitted(true);

		// Calculate points (1 point per correct decision part)
		let points = 0;
		if (decision.navigable === currentScenario.correctAnswer.navigable)
			points++;
		if (decision.route_idx === currentScenario.correctAnswer.route_idx)
			points++;
		if (decision.sail_idx === currentScenario.correctAnswer.sail_idx) points++;
		setScore((prev) => prev + points);
	};

	const handleNext = () => {
		if (currentIndex < METEO_SCENARIOS.length - 1) {
			setCurrentIndex((prev) => prev + 1);
			setUserDecision(null);
			setSubmitted(false);
		} else {
			setCompleted(true);
		}
	};

	const handleRestart = () => {
		setCurrentIndex(0);
		setUserDecision(null);
		setSubmitted(false);
		setCompleted(false);
		setScore(0);
	};

	if (completed) {
		return (
			<div className="min-h-screen bg-nautical-black text-white p-6 flex flex-col items-center justify-center">
				<div className="max-w-md w-full text-center space-y-8 animate-fade-in">
					<div className="w-24 h-24 bg-accent rounded-full mx-auto flex items-center justify-center text-nautical-black mb-6 shadow-[0_0_30px_rgba(255,255,255,0.2)]">
						<Trophy size={48} />
					</div>
					<h2 className="text-4xl font-display italic text-white mb-2">
						Simulación Completada
					</h2>
					<p className="text-white/60 text-lg">
						Puntuación Final: <strong className="text-accent">{score}</strong> /{" "}
						{METEO_SCENARIOS.length * 3}
					</p>

					<div className="p-6 bg-white/5 border border-white/10 rounded-xl">
						<p className="italic text-white/80">
							"La meteorología es la ciencia que estudia el tiempo que hace,
							para que sepamos el tiempo que nos queda."
						</p>
					</div>

					<button
						onClick={handleRestart}
						className="px-8 py-3 bg-white text-nautical-black font-black uppercase tracking-widest text-xs rounded hover:bg-accent transition-colors"
					>
						Reiniciar Simulador
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-nautical-black text-white pb-20">
			{/* Header */}
			<header className="border-b border-white/10 bg-nautical-black/50 backdrop-blur sticky top-0 z-10">
				<div className="container mx-auto px-6 h-16 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="w-8 h-8 bg-accent rounded flex items-center justify-center text-nautical-black">
							<CloudRain size={18} />
						</div>
						<h1 className="font-display italic text-lg hidden sm:block">
							Simulador Meteo <span className="text-white/40 mx-2">|</span>{" "}
							Escenario {currentIndex + 1}/{METEO_SCENARIOS.length}
						</h1>
					</div>
					<div className="text-xs font-mono text-white/40">
						Puntos: <span className="text-accent font-bold">{score}</span>
					</div>
				</div>
			</header>

			<main className="container mx-auto px-6 py-8">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
					{/* Left Column: Report */}
					<div className="space-y-6">
						<div className="flex items-center gap-2 mb-4">
							<span className="text-accent text-xs font-black uppercase tracking-widest">
								BOLETÍN OFICIAL
							</span>
							<div className="h-px bg-white/10 flex-1" />
						</div>
						<ScenarioDisplay scenario={currentScenario} />
					</div>

					{/* Right Column: Interaction */}
					<div className="space-y-6">
						{!submitted ? (
							<DecisionForm
								scenario={currentScenario}
								onSubmit={handleSubmit}
								submitted={submitted}
							/>
						) : (
							userDecision && (
								<FeedbackResult
									scenario={currentScenario}
									userDecision={userDecision}
									onNext={handleNext}
								/>
							)
						)}
					</div>
				</div>
			</main>
		</div>
	);
}
