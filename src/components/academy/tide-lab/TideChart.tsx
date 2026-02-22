"use client";

import { motion } from "framer-motion";
import type React from "react";
import { useMemo } from "react";
import { getTideLevel } from "@/lib/geospatial/tide-engine";

interface TideChartProps {
	currentTime: Date;
}

export const TideChart: React.FC<TideChartProps> = ({ currentTime }) => {
	// Generate data for the current day (00:00 to 23:59)
	const chartData = useMemo(() => {
		const startOfDay = new Date(currentTime);
		startOfDay.setHours(0, 0, 0, 0);
		// Create 97 points (0 to 96 * 15min = 24h)
		return Array.from({ length: 97 }).map((_, i) => {
			const t = new Date(startOfDay.getTime() + i * 15 * 60 * 1000);
			const { height } = getTideLevel(t);
			return { time: i / 4, height };
		});
	}, [currentTime.getDate()]); // Re-calculate only if day changes

	// Dimensions
	const width = 100; // viewBox units
	const height = 50; // viewBox units
	const maxLevel = 5; // meters

	// Path generator
	const pathD = chartData.reduce((acc, point, index) => {
		const x = (point.time / 24) * width;
		const y = height - (point.height / maxLevel) * height;
		return index === 0
			? `M ${x.toFixed(2)} ${y.toFixed(2)}`
			: `${acc} L ${x.toFixed(2)} ${y.toFixed(2)}`;
	}, "");

	// Current position
	const currentHours = currentTime.getHours() + currentTime.getMinutes() / 60;
	const currentX = (currentHours / 24) * width;
	const currentTide = getTideLevel(currentTime);
	const currentY = height - (currentTide.height / maxLevel) * height;

	return (
		<div className="w-full bg-slate-900/80 rounded-xl p-6 border border-slate-700/50 backdrop-blur-sm shadow-xl">
			<div className="flex justify-between items-end mb-6">
				<div>
					<h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">
						Marea Actual (Bilbao)
					</h3>
					<div className="flex items-baseline gap-2">
						<span className="text-3xl font-black text-white font-mono tracking-tight">
							{currentTide.height.toFixed(2)}m
						</span>
						<span
							className={`text-xs font-bold px-2 py-0.5 rounded-full ${
								currentTide.phase === "rising"
									? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
									: "bg-rose-500/20 text-rose-400 border border-rose-500/30"
							}`}
						>
							{currentTide.phase === "rising" ? "SUBIENDO ▲" : "BAJANDO ▼"}
						</span>
					</div>
				</div>
				<div className="text-right">
					<div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">
						Hora Simulación
					</div>
					<div className="text-xl font-mono text-white tracking-tight">
						{currentTime.toLocaleTimeString([], {
							hour: "2-digit",
							minute: "2-digit",
						})}
					</div>
				</div>
			</div>

			<div className="relative w-full aspect-[2.5/1]">
				<svg
					viewBox={`0 0 ${width} ${height}`}
					className="w-full h-full overflow-visible"
					preserveAspectRatio="none"
				>
					<defs>
						<linearGradient id="tideGradient" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
							<stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
						</linearGradient>
					</defs>

					{/* Grid lines */}
					<line
						x1="0"
						y1={height}
						x2={width}
						y2={height}
						stroke="#334155"
						strokeWidth="0.2"
					/>
					<line
						x1="0"
						y1={0}
						x2={width}
						y2={0}
						stroke="#334155"
						strokeWidth="0.2"
					/>
					<line
						x1="0"
						y1={height / 2}
						x2={width}
						y2={height / 2}
						stroke="#334155"
						strokeWidth="0.2"
						strokeDasharray="1 1"
					/>

					{/* Vertical grid lines every 6 hours */}
					{[0, 25, 50, 75, 100].map((gx) => (
						<line
							key={gx}
							x1={gx}
							y1={0}
							x2={gx}
							y2={height}
							stroke="#334155"
							strokeWidth="0.1"
						/>
					))}

					{/* Gradient Fill under curve */}
					<path
						d={`${pathD} L ${width} ${height} L 0 ${height} Z`}
						fill="url(#tideGradient)"
					/>

					{/* Tide Curve */}
					<path
						d={pathD}
						fill="none"
						stroke="#60a5fa"
						strokeWidth="0.8"
						strokeLinecap="round"
						strokeLinejoin="round"
						className="drop-shadow-[0_0_4px_rgba(96,165,250,0.5)]"
					/>

					{/* Current Time Indicator Elements */}
					{/* Vertical dashed line */}
					<motion.line
						animate={{ x1: currentX, x2: currentX }}
						transition={{ type: "spring", stiffness: 200, damping: 25 }}
						y1={0}
						y2={height}
						stroke="#fbbf24"
						strokeWidth="0.3"
						strokeDasharray="1 1"
					/>

					{/* Moving dot on the curve */}
					<motion.circle
						animate={{ cx: currentX, cy: currentY }}
						transition={{ type: "spring", stiffness: 200, damping: 25 }}
						r="1.5"
						fill="#fbbf24"
						stroke="#1e293b"
						strokeWidth="0.2"
						className="drop-shadow-md"
					/>

					{/* Time label on top */}
					<motion.text
						animate={{ x: currentX }}
						transition={{ type: "spring", stiffness: 200, damping: 25 }}
						y={-2}
						textAnchor="middle"
						fill="#fbbf24"
						fontSize="2.5"
						fontWeight="bold"
						fontFamily="monospace"
						className="pointer-events-none select-none"
					>
						{currentTime.getHours().toString().padStart(2, "0")}:
						{currentTime.getMinutes().toString().padStart(2, "0")}
					</motion.text>
				</svg>

				{/* X-Axis Labels */}
				<div className="flex justify-between mt-2 text-[10px] text-slate-500 font-mono px-0.5">
					<span>00:00</span>
					<span>06:00</span>
					<span>12:00</span>
					<span>18:00</span>
					<span>23:59</span>
				</div>
			</div>
		</div>
	);
};
