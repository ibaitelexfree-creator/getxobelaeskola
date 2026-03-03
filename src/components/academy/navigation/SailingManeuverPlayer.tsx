"use client";

import { motion } from "framer-motion";
import {
	Anchor,
	Pause,
	Play,
	RotateCcw,
	Settings2,
	SkipBack,
	SkipForward,
	Wind,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { MANEUVERS, Maneuver } from "@/data/academy/maneuvers";

interface SailingManeuverPlayerProps {
	className?: string;
}

export default function SailingManeuverPlayer({
	className = "",
}: SailingManeuverPlayerProps) {
	const [selectedManeuverId, setSelectedManeuverId] = useState<string>(
		MANEUVERS[0].id,
	);
	const [currentStepIndex, setCurrentStepIndex] = useState(0);
	const [isPlaying, setIsPlaying] = useState(false);
	const [speed, setSpeed] = useState(1); // 0.5, 1, 2

	const maneuver =
		MANEUVERS.find((m) => m.id === selectedManeuverId) || MANEUVERS[0];
	const currentStep = maneuver.steps[currentStepIndex];
	const totalSteps = maneuver.steps.length;

	useEffect(() => {
		let interval: NodeJS.Timeout;
		if (isPlaying) {
			interval = setInterval(() => {
				setCurrentStepIndex((prev) => {
					if (prev >= totalSteps - 1) {
						setIsPlaying(false);
						return prev;
					}
					return prev + 1;
				});
			}, 4000 / speed); // 4 seconds per step at 1x speed
		}
		return () => clearInterval(interval);
	}, [isPlaying, speed, totalSteps]);

	const handleNext = () => {
		if (currentStepIndex < totalSteps - 1) {
			setCurrentStepIndex(currentStepIndex + 1);
		} else {
			setIsPlaying(false);
		}
	};

	const handlePrev = () => {
		if (currentStepIndex > 0) {
			setCurrentStepIndex(currentStepIndex - 1);
		}
	};

	const handleManeuverChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setSelectedManeuverId(e.target.value);
		setCurrentStepIndex(0);
		setIsPlaying(false);
	};

	const reset = () => {
		setCurrentStepIndex(0);
		setIsPlaying(false);
	};

	// Boat shape
	const boatLength = 12;
	const boatWidth = 5;

	return (
		<div
			className={`bg-white dark:bg-slate-900 rounded-xl shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700 ${className}`}
		>
			{/* Header */}
			<div className="p-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4">
				<h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
					<Anchor className="w-5 h-5 text-blue-600" />
					Player de Maniobras
				</h2>
				<div className="flex items-center gap-2">
					<select
						value={selectedManeuverId}
						onChange={handleManeuverChange}
						className="px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
					>
						{MANEUVERS.map((m) => (
							<option key={m.id} value={m.id}>
								{m.name}
							</option>
						))}
					</select>
				</div>
			</div>

			{/* Main Content */}
			<div className="flex flex-col md:flex-row">
				{/* Animation Canvas */}
				<div className="w-full md:w-2/3 bg-blue-50 dark:bg-slate-900 relative aspect-square md:aspect-[4/3] overflow-hidden">
					{/* Water pattern / Grid */}
					<div
						className="absolute inset-0 opacity-10"
						style={{
							backgroundImage:
								"radial-gradient(circle, #3b82f6 1px, transparent 1px)",
							backgroundSize: "20px 20px",
						}}
					></div>

					<svg viewBox="0 0 100 100" className="w-full h-full">
						{/* Wind Indicator */}
						<g transform="translate(90, 10)">
							<text
								x="0"
								y="8"
								textAnchor="middle"
								fontSize="3"
								className="fill-slate-500 font-bold select-none"
							>
								WIND
							</text>
							<motion.g
								initial={false}
								animate={{ rotate: currentStep.wind?.angle || 0 }}
								transition={{ duration: 1 / speed }}
							>
								<circle
									cx="0"
									cy="0"
									r="4"
									fill="none"
									stroke="currentColor"
									className="text-slate-400"
									strokeWidth="0.5"
								/>
								<path
									d="M0 -3 L0 3 M-2 1 L0 3 L2 1"
									fill="none"
									stroke="currentColor"
									className="text-blue-600"
									strokeWidth="1"
								/>
							</motion.g>
						</g>

						{/* Extra Elements (Dock, Buoy, Person) */}
						{currentStep.extraElements?.map((el, i) => (
							<motion.g
								key={el.id + i}
								initial={{ opacity: 0, scale: 0 }}
								animate={{
									x: el.x,
									y: el.y,
									opacity: el.opacity ?? 1,
									scale: el.scale ?? 1,
									rotate: el.rotation ?? 0,
								}}
								transition={{ duration: 1 / speed }}
							>
								{el.type === "dock" && (
									<rect
										x={-(el.width || 10) / 2}
										y={-(el.height || 4) / 2}
										width={el.width || 10}
										height={el.height || 4}
										fill="#94a3b8"
										rx="1"
									/>
								)}
								{el.type === "person" && (
									<circle
										r="1.5"
										fill={el.color || "orange"}
										stroke="white"
										strokeWidth="0.5"
									/>
								)}
								{el.type === "buoy" && (
									<circle r="1.5" fill="red" stroke="white" strokeWidth="0.5" />
								)}
							</motion.g>
						))}

						{/* Boat Group */}
						<motion.g
							initial={false}
							animate={{
								x: currentStep.boat.x,
								y: currentStep.boat.y,
								rotate: currentStep.boat.rotation,
							}}
							transition={{
								duration: 2 / speed,
								ease: "easeInOut",
							}}
						>
							{/* Hull */}
							<ellipse
								cx="0"
								cy="0"
								rx={boatWidth / 2}
								ry={boatLength / 2}
								fill="white"
								stroke="#334155"
								strokeWidth="0.5"
							/>

							{/* Mast */}
							<circle cx="0" cy="0" r="0.5" fill="#334155" />

							{/* Main Sail */}
							<motion.g
								initial={false}
								animate={{ rotate: currentStep.boat.mainSail }}
								transition={{ duration: 1.5 / speed }}
							>
								{/* Boom */}
								<line
									x1="0"
									y1="0"
									x2="0"
									y2={boatLength / 2 + 1}
									stroke="black"
									strokeWidth="0.5"
									strokeLinecap="round"
								/>
								{/* Sail Fabric */}
								<path
									d={`M0 0 L0 ${boatLength / 2} Q 2 ${boatLength / 4} 0 0`}
									fill="#e2e8f0"
									fillOpacity="0.8"
								/>
							</motion.g>

							{/* Jib Sail */}
							<motion.g
								initial={false}
								animate={{ rotate: currentStep.boat.jib }}
								transition={{ duration: 1.5 / speed }}
							>
								{/* Jib Line */}
								<line
									x1="0"
									y1={-boatLength / 2}
									x2="0"
									y2="0"
									stroke="transparent"
								/>{" "}
								{/* Invisible guide */}
								<path
									d={`M0 ${-boatLength / 2} L 0 0 Q 1 ${-boatLength / 4} 0 ${-boatLength / 2}`}
									fill="#e2e8f0"
									fillOpacity="0.8"
									stroke="black"
									strokeWidth="0.2"
								/>
							</motion.g>
						</motion.g>
					</svg>

					{/* Speed Indicator Overlay */}
					<div className="absolute top-2 left-2 bg-white/80 dark:bg-black/50 backdrop-blur-sm px-2 py-1 rounded text-xs font-mono">
						{speed}x
					</div>
				</div>

				{/* Controls & Description */}
				<div className="w-full md:w-1/3 p-6 flex flex-col justify-between border-l border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
					<div className="space-y-4">
						<div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
							<span>
								Paso {currentStepIndex + 1} de {totalSteps}
							</span>
							<span className="font-mono">
								{Math.round(((currentStepIndex + 1) / totalSteps) * 100)}%
							</span>
						</div>

						<h3 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">
							{currentStep.title}
						</h3>

						<p className="text-slate-600 dark:text-slate-300 leading-relaxed min-h-[100px]">
							{currentStep.description}
						</p>
					</div>

					<div className="mt-8 space-y-6">
						{/* Progress Bar */}
						<div className="relative h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
							<motion.div
								className="absolute top-0 left-0 h-full bg-blue-600"
								initial={false}
								animate={{
									width: `${((currentStepIndex + 1) / totalSteps) * 100}%`,
								}}
								transition={{ duration: 0.5 }}
							/>
						</div>

						{/* Playback Controls */}
						<div className="flex items-center justify-between">
							<button
								onClick={reset}
								className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-500 transition-colors"
								title="Reiniciar"
							>
								<RotateCcw className="w-5 h-5" />
							</button>

							<div className="flex items-center gap-2">
								<button
									onClick={handlePrev}
									disabled={currentStepIndex === 0}
									className="p-3 bg-slate-100 dark:bg-slate-700 rounded-full disabled:opacity-50 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
								>
									<SkipBack className="w-5 h-5" />
								</button>

								<button
									onClick={() => setIsPlaying(!isPlaying)}
									className="p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-transform active:scale-95"
								>
									{isPlaying ? (
										<Pause className="w-6 h-6" />
									) : (
										<Play className="w-6 h-6 ml-1" />
									)}
								</button>

								<button
									onClick={handleNext}
									disabled={currentStepIndex === totalSteps - 1}
									className="p-3 bg-slate-100 dark:bg-slate-700 rounded-full disabled:opacity-50 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
								>
									<SkipForward className="w-5 h-5" />
								</button>
							</div>

							{/* Speed Control */}
							<div className="relative group">
								<button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-500 transition-colors">
									<Settings2 className="w-5 h-5" />
								</button>
								<div className="absolute bottom-full right-0 mb-2 hidden group-hover:flex flex-col bg-white dark:bg-slate-800 shadow-xl rounded-lg p-1 border border-slate-200 dark:border-slate-700 min-w-[80px]">
									{[0.5, 1, 2].map((s) => (
										<button
											key={s}
											onClick={() => setSpeed(s)}
											className={`px-3 py-1 text-sm text-left rounded hover:bg-blue-50 dark:hover:bg-slate-700 ${speed === s ? "text-blue-600 font-bold bg-blue-50 dark:bg-slate-700" : "text-slate-600 dark:text-slate-300"}`}
										>
											{s}x
										</button>
									))}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
