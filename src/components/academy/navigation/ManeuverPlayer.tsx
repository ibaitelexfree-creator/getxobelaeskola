"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
	Anchor,
	Clock,
	LifeBuoy,
	Pause,
	Play,
	SkipBack,
	SkipForward,
	Wind,
	Zap,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { MANEUVERS, type Maneuver } from "./maneuverData";

interface ManeuverPlayerProps {
	initialManeuverId?: string;
	className?: string;
}

export default function ManeuverPlayer({
	initialManeuverId,
	className = "",
}: ManeuverPlayerProps) {
	const [activeManeuver, setActiveManeuver] = useState<Maneuver>(
		MANEUVERS.find((m) => m.id === initialManeuverId) || MANEUVERS[0],
	);
	const [currentStepIndex, setCurrentStepIndex] = useState(0);
	const [isPlaying, setIsPlaying] = useState(false);
	const [speed, setSpeed] = useState<0.5 | 1 | 2>(1);

	const currentStep = activeManeuver.steps[currentStepIndex];
	const totalSteps = activeManeuver.steps.length;

	// Auto-play logic
	useEffect(() => {
		let interval: NodeJS.Timeout;

		if (isPlaying) {
			interval = setInterval(() => {
				setCurrentStepIndex((prev) => {
					if (prev < totalSteps - 1) {
						return prev + 1;
					} else {
						setIsPlaying(false); // Stop at end
						return prev;
					}
				});
			}, 2000 / speed); // Base 2 seconds per step
		}

		return () => clearInterval(interval);
	}, [isPlaying, speed, totalSteps]);

	// Reset when changing maneuver
	const handleManeuverChange = (maneuverId: string) => {
		const maneuver = MANEUVERS.find((m) => m.id === maneuverId);
		if (maneuver) {
			setActiveManeuver(maneuver);
			setCurrentStepIndex(0);
			setIsPlaying(false);
		}
	};

	const togglePlay = () => setIsPlaying(!isPlaying);
	const prevStep = () => {
		setIsPlaying(false);
		setCurrentStepIndex((prev) => Math.max(0, prev - 1));
	};
	const nextStep = () => {
		setIsPlaying(false);
		setCurrentStepIndex((prev) => Math.min(totalSteps - 1, prev + 1));
	};

	return (
		<div
			className={`flex flex-col gap-6 w-full max-w-4xl mx-auto p-4 bg-slate-900 rounded-xl shadow-2xl border border-slate-700 ${className}`}
		>
			{/* Header & Selector */}
			<header className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-slate-700 pb-4">
				<div>
					<h2 className="text-2xl font-bold text-white flex items-center gap-2">
						<NavigationIcon className="w-6 h-6 text-blue-400" />
						{activeManeuver.name}
					</h2>
					<p className="text-slate-400 text-sm">{activeManeuver.description}</p>
				</div>

				<select
					value={activeManeuver.id}
					onChange={(e) => handleManeuverChange(e.target.value)}
					className="bg-slate-800 text-white border border-slate-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
				>
					{MANEUVERS.map((m) => (
						<option key={m.id} value={m.id}>
							{m.name}
						</option>
					))}
				</select>
			</header>

			{/* Main Animation Area */}
			<div className="relative aspect-square md:aspect-video w-full bg-blue-950/50 rounded-lg overflow-hidden border border-blue-900/30 shadow-inner">
				{/* Background Grid/Water */}
				<div
					className="absolute inset-0 opacity-10"
					style={{
						backgroundImage:
							"radial-gradient(circle, #475569 1px, transparent 1px)",
						backgroundSize: "20px 20px",
					}}
				></div>

				{/* Wind Indicator */}
				<div className="absolute top-4 right-4 flex flex-col items-center opacity-70">
					<Wind className="w-8 h-8 text-cyan-300 animate-pulse" />
					<span className="text-xs text-cyan-300 font-mono mt-1">VIENTO</span>
					<div className="w-0.5 h-8 bg-gradient-to-b from-cyan-300 to-transparent"></div>
				</div>

				{/* SVG Scene */}
				<svg viewBox="0 0 100 100" className="w-full h-full p-8">
					{/* Extra Elements (Dock, MOB) */}
					<AnimatePresence>
						{currentStep.extraElement && (
							<motion.g
								initial={{ opacity: 0 }}
								animate={{
									opacity: 1,
									x: currentStep.extraElement.x,
									y: currentStep.extraElement.y,
								}}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.5 }}
							>
								{currentStep.extraElement.type === "dock" && (
									<rect
										x="-10"
										y="-5"
										width="20"
										height="10"
										fill="#78350f"
										rx="1"
									/>
								)}
								{currentStep.extraElement.type === "mob" && (
									<g>
										<circle r="3" fill="#ef4444" />
										<circle
											r="5"
											stroke="#ef4444"
											strokeWidth="0.5"
											fill="none"
											className="animate-ping"
										/>
									</g>
								)}
							</motion.g>
						)}
					</AnimatePresence>

					{/* Boat Group */}
					<motion.g
						animate={{
							x: currentStep.boatPosition.x,
							y: currentStep.boatPosition.y,
							rotate: currentStep.boatRotation,
						}}
						transition={{
							type: "spring",
							stiffness: 50,
							damping: 15,
							duration: 2 / speed,
						}}
					>
						{/* Hull */}
						<path
							d="M0,-8 C3,-5 4,2 3,8 L-3,8 C-4,2 -3,-5 0,-8 Z"
							fill="#f8fafc"
							stroke="#334155"
							strokeWidth="0.5"
						/>

						{/* Mast */}
						<circle r="0.8" fill="#334155" />

						{/* Sail (Main) */}
						<motion.line
							x1="0"
							y1="0"
							x2="0"
							y2="7"
							stroke="#e2e8f0"
							strokeWidth="1"
							animate={{ rotate: currentStep.sailAngle }}
							transition={{
								type: "spring",
								stiffness: 60,
								duration: 1 / speed,
							}}
							style={{ originX: 0, originY: 0 }}
						/>

						{/* Jib (Simplified) */}
						<motion.path d="M0,-8 L0,0" stroke="#cbd5e1" strokeWidth="0.5" />
					</motion.g>
				</svg>

				{/* Step Indicator Overlay */}
				<div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur px-3 py-1 rounded-full text-xs text-white border border-white/10">
					Paso {currentStepIndex + 1} / {totalSteps}
				</div>
			</div>

			{/* Subtitles & Description */}
			<div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 min-h-[100px] flex items-center justify-center text-center">
				<AnimatePresence mode="wait">
					<motion.p
						key={currentStepIndex}
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						className="text-lg text-blue-100 font-medium"
					>
						{currentStep.description}
					</motion.p>
				</AnimatePresence>
			</div>

			{/* Controls */}
			<div className="flex flex-col sm:flex-row justify-between items-center gap-4">
				{/* Playback Controls */}
				<div className="flex items-center gap-2">
					<button
						onClick={prevStep}
						disabled={currentStepIndex === 0}
						className="p-2 rounded-full hover:bg-slate-700 text-white disabled:opacity-30 transition-colors"
						title="Anterior"
					>
						<SkipBack size={24} />
					</button>

					<button
						onClick={togglePlay}
						className="p-4 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg transition-all hover:scale-105 active:scale-95"
						title={isPlaying ? "Pausar" : "Reproducir"}
					>
						{isPlaying ? (
							<Pause size={28} fill="currentColor" />
						) : (
							<Play size={28} fill="currentColor" className="ml-1" />
						)}
					</button>

					<button
						onClick={nextStep}
						disabled={currentStepIndex === totalSteps - 1}
						className="p-2 rounded-full hover:bg-slate-700 text-white disabled:opacity-30 transition-colors"
						title="Siguiente"
					>
						<SkipForward size={24} />
					</button>
				</div>

				{/* Speed Control */}
				<div className="flex items-center gap-3 bg-slate-800 px-4 py-2 rounded-full border border-slate-700">
					<Clock size={16} className="text-slate-400" />
					{[0.5, 1, 2].map((s) => (
						<button
							key={s}
							onClick={() => setSpeed(s as any)}
							className={`text-xs font-bold px-2 py-1 rounded transition-colors ${speed === s ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}
						>
							{s}x
						</button>
					))}
				</div>
			</div>
		</div>
	);
}

function NavigationIcon({ className }: { className?: string }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
		>
			<polygon points="3 11 22 2 13 21 11 13 3 11" />
		</svg>
	);
}
