"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
	Anchor,
	ChevronRight,
	Info,
	Map as MapIcon,
	Pause,
	Play,
	SkipBack,
	SkipForward,
	Thermometer,
	Waves,
	Wind,
} from "lucide-react";
import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";
import {
	HISTORICAL_REGATTAS,
	type HistoricalRegatta,
} from "@/lib/data/historical-regattas";

// Dynamic import for the Map component to avoid SSR issues
const RegattaMap = dynamic(() => import("./RegattaMap"), {
	ssr: false,
	loading: () => (
		<div className="w-full h-full flex items-center justify-center bg-[#000510] text-white/50">
			Cargando carta náutica...
		</div>
	),
});

export default function RegattaPlayer() {
	const [selectedRegatta, setSelectedRegatta] = useState<HistoricalRegatta>(
		HISTORICAL_REGATTAS[0],
	);
	const [currentStepIndex, setCurrentStepIndex] = useState(0);
	const [isPlaying, setIsPlaying] = useState(false);
	const [showSidebar, setShowSidebar] = useState(true);

	const currentStep = selectedRegatta.steps[currentStepIndex];

	// Playback Logic
	useEffect(() => {
		let interval: NodeJS.Timeout;
		if (isPlaying) {
			interval = setInterval(() => {
				setCurrentStepIndex((prev) => {
					if (prev < selectedRegatta.steps.length - 1) {
						return prev + 1;
					} else {
						setIsPlaying(false);
						return prev;
					}
				});
			}, 3000); // 3 seconds per step
		}
		return () => clearInterval(interval);
	}, [isPlaying, selectedRegatta]);

	// Reset when changing regatta
	const handleRegattaChange = (regatta: HistoricalRegatta) => {
		setSelectedRegatta(regatta);
		setCurrentStepIndex(0);
		setIsPlaying(false);
	};

	const handleNext = () => {
		if (currentStepIndex < selectedRegatta.steps.length - 1) {
			setCurrentStepIndex((prev) => prev + 1);
		}
	};

	const handlePrev = () => {
		if (currentStepIndex > 0) {
			setCurrentStepIndex((prev) => prev - 1);
		}
	};

	return (
		<div className="flex h-screen w-full bg-[#000510] overflow-hidden relative">
			{/* Sidebar - Regatta Selection */}
			<AnimatePresence>
				{showSidebar && (
					<motion.div
						initial={{ x: -300, opacity: 0 }}
						animate={{ x: 0, opacity: 1 }}
						exit={{ x: -300, opacity: 0 }}
						className="w-80 h-full bg-[#0a1628]/95 backdrop-blur-md border-r border-white/10 flex flex-col z-20 absolute md:relative"
					>
						<div className="p-6 border-b border-white/10">
							<h2 className="text-xl font-display italic text-accent">
								Exploración
							</h2>
							<p className="text-xs text-white/50 uppercase tracking-widest mt-1">
								Regatas Históricas
							</p>
						</div>
						<div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
							{HISTORICAL_REGATTAS.map((regatta) => (
								<button
									key={regatta.id}
									onClick={() => handleRegattaChange(regatta)}
									className={`w-full text-left p-4 rounded-lg border transition-all duration-300 group ${
										selectedRegatta.id === regatta.id
											? "bg-accent/10 border-accent/50 shadow-[0_0_15px_rgba(251,191,36,0.1)]"
											: "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
									}`}
								>
									<div className="flex justify-between items-start mb-2">
										<h3
											className={`font-bold text-sm ${selectedRegatta.id === regatta.id ? "text-accent" : "text-white group-hover:text-accent transition-colors"}`}
										>
											{regatta.title}
										</h3>
										<span className="text-xs text-white/40 font-mono">
											{regatta.year}
										</span>
									</div>
									<p className="text-xs text-white/60 line-clamp-2 leading-relaxed">
										{regatta.shortDescription}
									</p>
								</button>
							))}
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Main Content Area */}
			<div className="flex-1 relative h-full flex flex-col">
				{/* Toggle Sidebar Button (Mobile/Desktop) */}
				<button
					onClick={() => setShowSidebar(!showSidebar)}
					className="absolute top-4 left-4 z-30 p-2 bg-black/50 backdrop-blur rounded-md text-white/70 hover:text-white border border-white/10 transition-colors"
				>
					<MapIcon size={20} />
				</button>

				{/* Map Layer */}
				<div className="absolute inset-0 z-0">
					<RegattaMap
						steps={selectedRegatta.steps}
						currentStepIndex={currentStepIndex}
					/>
				</div>

				{/* Top Info Overlay */}
				<div className="absolute top-0 left-0 right-0 p-6 pointer-events-none z-10 flex justify-center">
					<div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-full px-8 py-2 text-center pointer-events-auto">
						<h1 className="text-lg font-display text-white tracking-wide">
							{selectedRegatta.title}{" "}
							<span className="text-accent mx-2">•</span> {currentStep.date}
						</h1>
					</div>
				</div>

				{/* Bottom Stats & Controls Overlay */}
				<div className="absolute bottom-0 left-0 right-0 p-6 z-10 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none">
					<div className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-6 items-end pointer-events-auto">
						{/* 1. Boat Stats */}
						<div className="bg-[#0a1628]/90 backdrop-blur border border-white/10 rounded-xl p-5 shadow-2xl">
							<div className="flex items-center gap-2 mb-3 border-b border-white/10 pb-2">
								<Anchor size={16} className="text-accent" />
								<h3 className="text-xs uppercase tracking-widest text-white/70 font-bold">
									Datos del Barco
								</h3>
							</div>
							<div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
								<div>
									<p className="text-white/40 text-[10px] uppercase">
										Embarcación
									</p>
									<p className="text-white font-mono">
										{selectedRegatta.boatStats.name}
									</p>
								</div>
								<div>
									<p className="text-white/40 text-[10px] uppercase">Tipo</p>
									<p className="text-white font-mono truncate">
										{selectedRegatta.boatStats.type}
									</p>
								</div>
								<div>
									<p className="text-white/40 text-[10px] uppercase">Patrón</p>
									<p className="text-white font-mono truncate">
										{selectedRegatta.boatStats.skipper}
									</p>
								</div>
								<div>
									<p className="text-white/40 text-[10px] uppercase">Eslora</p>
									<p className="text-white font-mono">
										{selectedRegatta.boatStats.length}
									</p>
								</div>
							</div>
						</div>

						{/* 2. Timeline Controls (Center) */}
						<div className="flex flex-col items-center justify-end pb-2">
							{/* Step Info */}
							<div className="mb-4 text-center">
								<p className="text-accent text-xs uppercase tracking-[0.2em] mb-1">
									Etapa {currentStepIndex + 1} / {selectedRegatta.steps.length}
								</p>
								<h2 className="text-xl font-bold text-white mb-1">
									{currentStep.name}
								</h2>
								<p className="text-sm text-white/60 max-w-sm mx-auto leading-relaxed">
									{currentStep.description}
								</p>
							</div>

							{/* Player Controls */}
							<div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-full px-6 py-3 backdrop-blur-xl shadow-lg">
								<button
									onClick={handlePrev}
									disabled={currentStepIndex === 0}
									className="text-white/50 hover:text-white disabled:opacity-30 transition-colors"
								>
									<SkipBack size={24} />
								</button>
								<button
									onClick={() => setIsPlaying(!isPlaying)}
									className="w-12 h-12 bg-accent text-nautical-black rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-accent/20"
								>
									{isPlaying ? (
										<Pause size={24} fill="currentColor" />
									) : (
										<Play size={24} fill="currentColor" className="ml-1" />
									)}
								</button>
								<button
									onClick={handleNext}
									disabled={
										currentStepIndex === selectedRegatta.steps.length - 1
									}
									className="text-white/50 hover:text-white disabled:opacity-30 transition-colors"
								>
									<SkipForward size={24} />
								</button>
							</div>

							{/* Progress Bar */}
							<div className="w-full h-1 bg-white/10 rounded-full mt-4 overflow-hidden">
								<motion.div
									className="h-full bg-accent"
									initial={{ width: 0 }}
									animate={{
										width: `${((currentStepIndex + 1) / selectedRegatta.steps.length) * 100}%`,
									}}
									transition={{ duration: 0.5 }}
								/>
							</div>
						</div>

						{/* 3. Weather Stats */}
						<div className="bg-[#0a1628]/90 backdrop-blur border border-white/10 rounded-xl p-5 shadow-2xl">
							<div className="flex items-center gap-2 mb-3 border-b border-white/10 pb-2">
								<Wind size={16} className="text-blue-400" />
								<h3 className="text-xs uppercase tracking-widest text-white/70 font-bold">
									Condiciones Históricas
								</h3>
							</div>
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2 text-white/60">
										<Wind size={14} />
										<span className="text-xs">Viento</span>
									</div>
									<span className="text-white font-mono font-bold">
										{currentStep.weather.windSpeed} kn{" "}
										{currentStep.weather.windDirection}
									</span>
								</div>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2 text-white/60">
										<Waves size={14} />
										<span className="text-xs">Mar</span>
									</div>
									<span className="text-white font-mono text-sm">
										{currentStep.weather.seaState}
									</span>
								</div>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2 text-white/60">
										<Thermometer size={14} />
										<span className="text-xs">Temp</span>
									</div>
									<span className="text-white font-mono">
										{currentStep.weather.temperature}°C
									</span>
								</div>
								<div className="mt-2 pt-2 border-t border-white/5">
									<p className="text-xs text-white/50 italic text-center">
										"{currentStep.weather.description}"
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
