"use client";

import { motion } from "framer-motion";
import { AlertCircle, Wind } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

// Interface for boat state
interface BoatState {
	heading: number; // Course over ground (deg)
	mainsailAngle: number; // Angle relative to boat centerline (-90 to +90)
	sheetTension: number; // 0 (loose) to 1 (tight)
	speed: number; // Resulting speed (knots)
	heel: number; // Heeling angle (deg)
	luffing: boolean; // Is sail luffing (flapping)?
}

export default function WindTunnel() {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const workerRef = useRef<Worker | null>(null);
	const [windDirection, setWindDirection] = useState(0); // Wind from North (0)
	const [windSpeed, setWindSpeed] = useState(12); // Knots

	// UI state for dashboard
	const [uiState, setUiState] = useState<BoatState>({
		heading: 45,
		mainsailAngle: 15,
		sheetTension: 0.8,
		speed: 0,
		heel: 0,
		luffing: false,
	});

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		// Initialize Worker
		const worker = new Worker(
			new URL("./wind-tunnel.worker.ts", import.meta.url),
		);
		workerRef.current = worker;

		// Transfer Canvas Control
		const offscreen = canvas.transferControlToOffscreen();

		// Initial set size for offscreen
		offscreen.width = canvas.clientWidth;
		offscreen.height = canvas.clientHeight;

		worker.postMessage(
			{
				type: "INIT",
				payload: {
					canvas: offscreen,
					windDirection,
					windSpeed,
					boatState: uiState,
				},
			},
			[offscreen],
		);

		worker.onmessage = (e) => {
			if (e.data.type === "STATE_UPDATE") {
				setUiState(e.data.payload);
			}
		};

		const resizeObserver = new ResizeObserver(() => {
			// In 2D OffscreenCanvas, resize is tricky if we don't recreate context,
			// but let's assume fixed or handled by CSS if needed.
			// Actually we should update worker about size if it changes.
		});
		resizeObserver.observe(canvas);

		return () => {
			worker.terminate();
			resizeObserver.disconnect();
		};
	}, []);

	// Sync environment changes to worker
	useEffect(() => {
		if (workerRef.current) {
			workerRef.current.postMessage({
				type: "UPDATE_ENV",
				payload: { windDirection, windSpeed },
			});
		}
	}, [windDirection, windSpeed]);

	return (
		<div className="w-full h-screen bg-[#0f172a] flex flex-col md:flex-row font-display relative overflow-hidden">
			{/* Simulation Viewport */}
			<div className="flex-grow relative">
				<canvas
					ref={canvasRef}
					style={{ width: "100%", height: "100%", display: "block" }}
				/>

				{/* Stats Overlay */}
				<div className="absolute top-6 left-6 grid gap-2 text-2xs font-mono">
					<div className="bg-black/50 backdrop-blur border border-white/10 p-3 rounded-lg text-white">
						<div className="text-white/50 mb-1">Velocidad (SOG)</div>
						<div className="text-2xl text-cyan-400 font-bold">
							{uiState.speed.toFixed(1)}{" "}
							<span className="text-sm font-normal">kn</span>
						</div>
					</div>
					<div className="bg-black/50 backdrop-blur border border-white/10 p-3 rounded-lg text-white">
						<div className="text-white/50 mb-1">Escora</div>
						<div className="text-xl font-bold">{uiState.heel.toFixed(0)}°</div>
					</div>
					{uiState.luffing && (
						<div className="bg-red-500/20 backdrop-blur border border-red-500/50 p-2 rounded-lg text-red-200 animate-pulse flex items-center gap-2">
							<AlertCircle size={14} /> FLAMEO (Luffing)
						</div>
					)}
					{!uiState.luffing && uiState.speed > 5 && (
						<div className="bg-green-500/20 backdrop-blur border border-green-500/50 p-2 rounded-lg text-green-200 flex items-center gap-2">
							<Wind size={14} /> FLUJO LAMINAR
						</div>
					)}
				</div>

				{/* Wind Arrow Indicator (Top Right) */}
				<div className="absolute top-6 right-6 pointer-events-none">
					<div className="relative w-16 h-16 flex items-center justify-center">
						<div className="absolute inset-0 border-2 border-white/10 rounded-full" />
						<div className="absolute top-0 text-3xs text-white/50">N</div>
						<motion.div
							className="text-cyan-400"
							animate={{ rotate: windDirection + 180 }}
							transition={{ type: "spring", damping: 20 }}
						>
							<svg
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<line x1="12" y1="5" x2="12" y2="19"></line>
								<polyline points="19 12 12 19 5 12"></polyline>
							</svg>
						</motion.div>
					</div>
				</div>
			</div>

			{/* Controls Panel */}
			<div className="w-full md:w-80 bg-white/5 backdrop-blur border-l border-white/10 p-6 flex flex-col gap-8 z-10">
				<div className="flex items-center gap-3 text-white border-b border-white/10 pb-4">
					<Wind className="text-cyan-400" />
					<h2 className="text-lg italic">Laboratorio de Viento</h2>
				</div>

				{/* Wind Controls */}
				<div className="space-y-4">
					<label className="text-white/60 text-2xs uppercase tracking-widest flex justify-between">
						Dirección Viento
						<span className="text-white">{windDirection}°</span>
					</label>
					<input
						type="range"
						min="0"
						max="359"
						value={windDirection}
						onChange={(e) => setWindDirection(Number(e.target.value))}
						className="w-full accent-cyan-400 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
					/>

					<label className="text-white/60 text-2xs uppercase tracking-widest flex justify-between">
						Intensidad Viento
						<span className="text-white">{windSpeed} kn</span>
					</label>
					<input
						type="range"
						min="5"
						max="40"
						value={windSpeed}
						onChange={(e) => setWindSpeed(Number(e.target.value))}
						className="w-full accent-cyan-400 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
					/>
				</div>

				{/* Boat Controls */}
				<div className="space-y-4 pt-4 border-t border-white/10 text-white">
					<label className="text-white/60 text-2xs uppercase tracking-widest flex justify-between">
						Rumbo Barco <span className="text-white">{uiState.heading}°</span>
					</label>
					<input
						type="range"
						min="0"
						max="359"
						value={uiState.heading}
						onChange={(e) => {
							const val = Number(e.target.value);
							workerRef.current?.postMessage({
								type: "UPDATE_BOAT",
								payload: { boatState: { heading: val } },
							});
						}}
						className="w-full accent-blue-400 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
					/>

					<label className="text-white/60 text-2xs uppercase tracking-widest flex justify-between">
						Apertura Vela{" "}
						<span className="text-white">{uiState.mainsailAngle}°</span>
					</label>
					<input
						type="range"
						min="0"
						max="90"
						value={uiState.mainsailAngle}
						onChange={(e) => {
							const val = Number(e.target.value);
							workerRef.current?.postMessage({
								type: "UPDATE_BOAT",
								payload: { boatState: { mainsailAngle: val } },
							});
						}}
						className="w-full accent-green-400 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
					/>
				</div>

				{/* Feedback */}
				<div className="mt-auto bg-blue-500/10 border border-blue-500/20 p-4 rounded text-sm text-blue-200">
					<p>
						💡 <b>Tip Montessori:</b> Ajusta la vela hasta que deje de flamear
						(rojo) y se ponga verde (flujo laminar).
					</p>
				</div>
			</div>
		</div>
	);
}
