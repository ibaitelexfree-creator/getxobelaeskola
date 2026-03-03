"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";

interface CompassDialProps {
	value: number; // 0-360
	onChange: (value: number) => void;
	label?: string;
}

export const CompassDial: React.FC<CompassDialProps> = ({
	value,
	onChange,
	label = "WIND DIRECTION",
}) => {
	const dialRef = useRef<HTMLDivElement>(null);
	const [isDragging, setIsDragging] = useState(false);

	const handleInteraction = (clientX: number, clientY: number) => {
		if (!dialRef.current) return;

		const rect = dialRef.current.getBoundingClientRect();
		const centerX = rect.left + rect.width / 2;
		const centerY = rect.top + rect.height / 2;

		const dx = clientX - centerX;
		const dy = clientY - centerY;

		// Calculate angle in degrees
		let angle = Math.atan2(dx, -dy) * (180 / Math.PI);
		if (angle < 0) angle += 360;

		onChange(Math.round(angle));
	};

	const onMouseDown = (e: React.MouseEvent) => {
		setIsDragging(true);
		handleInteraction(e.clientX, e.clientY);
	};

	useEffect(() => {
		const onMouseMove = (e: MouseEvent) => {
			if (isDragging) handleInteraction(e.clientX, e.clientY);
		};
		const onMouseUp = () => setIsDragging(false);

		if (isDragging) {
			window.addEventListener("mousemove", onMouseMove);
			window.addEventListener("mouseup", onMouseUp);
		}
		return () => {
			window.removeEventListener("mousemove", onMouseMove);
			window.removeEventListener("mouseup", onMouseUp);
		};
	}, [isDragging]);

	return (
		<div
			ref={dialRef}
			onMouseDown={onMouseDown}
			className="relative w-24 h-24 rounded-full cursor-pointer group flex items-center justify-center select-none shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] bg-slate-950/50 border border-cyan-500/20 active:scale-95 transition-transform"
		>
			{/* Outer Glow Ring */}
			<div className="absolute inset-0 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.1)]" />

			{/* Degree markings (N, E, S, W) */}
			{[0, 90, 180, 270].map((deg) => (
				<div
					key={deg}
					className="absolute text-[8px] font-black text-cyan-400/70"
					style={{
						transform: `rotate(${deg}deg) translateY(-34px)`,
					}}
				>
					<div style={{ transform: `rotate(-${deg}deg)` }}>
						{deg === 0 ? "N" : deg === 90 ? "E" : deg === 180 ? "S" : "W"}
					</div>
				</div>
			))}

			{/* Ticks Ring */}
			<div className="absolute inset-2 rounded-full border border-cyan-500/10" />
			{[...Array(36)].map((_, i) => (
				<div
					key={i}
					className={`absolute top-0 left-1/2 -translate-x-1/2 h-[4px] w-[1px] origin-[50%_48px] ${i % 9 === 0 ? "bg-cyan-500/80 h-[6px]" : "bg-cyan-500/20"}`}
					style={{ transform: `rotate(${i * 10}deg)` }}
				/>
			))}

			{/* Rotating Indicator (Wind Arrow) */}
			<div
				className="absolute inset-0 transition-transform duration-75 flex items-center justify-center"
				style={{ transform: `rotate(${value}deg)` }}
			>
				{/* Arrow Head */}
				<div className="absolute top-3 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[14px] border-b-cyan-300 drop-shadow-[0_0_8px_cyan]" />

				{/* Shaft */}
				<div className="absolute top-6 bottom-6 w-[1px] bg-gradient-to-b from-cyan-300 via-cyan-500/50 to-transparent" />
			</div>

			{/* Center Pivot */}
			<div className="w-2 h-2 rounded-full bg-cyan-950 border border-cyan-500 shadow-[0_0_5px_cyan] z-10" />
		</div>
	);
};
