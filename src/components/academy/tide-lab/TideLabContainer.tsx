"use client";

import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { getCurrents, getTideLevel } from "@/lib/geospatial/tide-engine";
import { TideChart } from "./TideChart";
import { TideControls } from "./TideControls";
import { TideMap } from "./TideMap";

export const TideLabContainer: React.FC = () => {
	// Initialize with current time, but snapped to nearest minute
	const [currentTime, setCurrentTime] = useState(() => {
		const now = new Date();
		now.setSeconds(0, 0);
		return now;
	});

	const [isPlaying, setIsPlaying] = useState(false);
	const [speed, setSpeed] = useState(60); // Default 60x (1 sec = 1 min)

	// Refs for animation loop
	const requestRef = useRef<number>();
	const previousTimeRef = useRef<number>();

	const animate = (time: number) => {
		if (previousTimeRef.current !== undefined) {
			const deltaTime = time - previousTimeRef.current;

			// Update time
			// speed is multiplier.
			// deltaTime is ms.
			// real time elapsed = deltaTime.
			// sim time elapsed = deltaTime * speed.

			setCurrentTime((prevDate) => {
				const newDate = new Date(prevDate.getTime() + deltaTime * speed);
				// Loop within the same day?
				// Or let it go to next day?
				// For simplicity, let it flow. The chart handles "current day" view.
				return newDate;
			});
		}
		previousTimeRef.current = time;
		requestRef.current = requestAnimationFrame(animate);
	};

	useEffect(() => {
		if (isPlaying) {
			requestRef.current = requestAnimationFrame(animate);
		} else {
			if (requestRef.current) {
				cancelAnimationFrame(requestRef.current);
			}
			previousTimeRef.current = undefined;
		}
		return () => {
			if (requestRef.current) {
				cancelAnimationFrame(requestRef.current);
			}
		};
	}, [isPlaying, speed]);

	// Derived Data
	const currents = useMemo(() => getCurrents(currentTime), [currentTime]);
	// Note: getTideLevel is called inside TideChart, no need to pass it here unless we want to display it somewhere else.

	return (
		<div className="flex flex-col h-[calc(100vh-64px)] lg:h-[calc(100vh-80px)] gap-4 p-4 lg:p-6 bg-slate-950 overflow-hidden">
			<header className="flex flex-col gap-1">
				<h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
					Lab de Mareas: Abra de Bilbao
				</h1>
				<p className="text-slate-400 text-sm">
					Simulación interactiva de corrientes y mareas basada en el modelo
					armónico M2.
				</p>
			</header>

			<div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
				{/* Map Section - Takes available space */}
				<div className="flex-1 rounded-2xl overflow-hidden shadow-2xl bg-slate-900 border border-slate-800 relative min-h-[300px]">
					<TideMap currents={currents} />

					{/* Floating Time Display on Map (Optional, for quick ref) */}
					<div className="absolute top-4 left-4 z-[400] bg-slate-900/90 backdrop-blur px-4 py-2 rounded-xl border border-slate-700 shadow-xl">
						<div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
							Hora Local
						</div>
						<div className="text-xl font-mono text-white font-bold">
							{currentTime.toLocaleTimeString([], {
								hour: "2-digit",
								minute: "2-digit",
							})}
						</div>
						<div className="text-[10px] text-blue-400 font-medium mt-1">
							{currentTime.toLocaleDateString([], {
								weekday: "short",
								day: "numeric",
								month: "short",
							})}
						</div>
					</div>
				</div>

				{/* Controls & Chart Section - Fixed width on desktop */}
				<div className="lg:w-[450px] flex flex-col gap-4">
					<TideChart currentTime={currentTime} />

					<TideControls
						currentTime={currentTime}
						onTimeChange={setCurrentTime}
						isPlaying={isPlaying}
						onPlayPause={() => setIsPlaying(!isPlaying)}
						speed={speed}
						onSpeedChange={setSpeed}
					/>

					{/* Additional Info Box */}
					<div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/50">
						<h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
							Datos de Navegación
						</h4>
						<div className="grid grid-cols-2 gap-4 text-sm">
							<div className="flex flex-col gap-1">
								<span className="text-slate-500 text-[10px]">COEFICIENTE</span>
								<span className="text-white font-mono">78 (Medio)</span>
							</div>
							<div className="flex flex-col gap-1">
								<span className="text-slate-500 text-[10px]">
									VIENTO (REAL)
								</span>
								<span className="text-emerald-400 font-mono">NE 12kn</span>
							</div>
							<div className="flex flex-col gap-1">
								<span className="text-slate-500 text-[10px]">
									ESTADO DE LA MAR
								</span>
								<span className="text-blue-300 font-mono">Marejadilla</span>
							</div>
							<div className="flex flex-col gap-1">
								<span className="text-slate-500 text-[10px]">VISIBILIDAD</span>
								<span className="text-white font-mono">Buena (10nm)</span>
							</div>
						</div>
						<div className="mt-3 text-[10px] text-slate-600 italic border-t border-slate-800 pt-2">
							* Datos simulados para fines educativos. No usar para navegación
							real.
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
