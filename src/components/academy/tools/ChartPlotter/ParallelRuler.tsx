"use client";

import { motion, useDragControls } from "framer-motion";
import type React from "react";
import { useEffect, useRef, useState } from "react";

// Ruler Dimensions (in px)
// Width: 400, Height (Spread): 100 for visual
const RULER_W = 400;
const RULER_H = 80;

interface ParallelRulerProps {
	initialX: number;
	initialY: number;
	initialAngle: number;
	scale: number;
	onUpdate?: (data: { x: number; y: number; angle: number }) => void;
}

export default function ParallelRuler({
	initialX,
	initialY,
	initialAngle,
	scale,
	onUpdate,
}: ParallelRulerProps) {
	const [position, setPosition] = useState({ x: initialX, y: initialY });
	const [angle, setAngle] = useState(initialAngle);
	const [isRotating, setIsRotating] = useState(false);

	// Drag Refs
	const controls = useDragControls();

	// Rotation Logic
	const rulerRef = useRef<HTMLDivElement>(null);

	const handleRotationStart = (e: React.MouseEvent) => {
		e.stopPropagation();
		e.preventDefault();
		setIsRotating(true);
	};

	useEffect(() => {
		if (!isRotating) return;

		const handleMouseMove = (e: MouseEvent) => {
			if (!rulerRef.current) return;

			// Calculate center of ruler
			const rect = rulerRef.current.getBoundingClientRect();
			const centerX = rect.left + rect.width / 2;
			const centerY = rect.top + rect.height / 2;

			// Calculate angle
			const deltaX = e.clientX - centerX;
			const deltaY = e.clientY - centerY;

			// Atan2 gives angle in radians from -PI to PI
			let deg = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

			// Snap to 5 degrees for easier use
			if (e.shiftKey) {
				deg = Math.round(deg / 5) * 5;
			}

			setAngle(deg);
		};

		const handleMouseUp = () => setIsRotating(false);

		window.addEventListener("mousemove", handleMouseMove);
		window.addEventListener("mouseup", handleMouseUp);

		return () => {
			window.removeEventListener("mousemove", handleMouseMove);
			window.removeEventListener("mouseup", handleMouseUp);
		};
	}, [isRotating]);

	// Update parent
	useEffect(() => {
		onUpdate?.({ x: position.x, y: position.y, angle });
	}, [position, angle, onUpdate]);

	return (
		<motion.div
			ref={rulerRef}
			drag
			dragMomentum={false}
			dragControls={controls}
			onDragEnd={(e, info) => {
				setPosition((p) => ({
					x: p.x + info.offset.x,
					y: p.y + info.offset.y,
				}));
			}}
			style={{
				x: position.x,
				y: position.y,
				rotate: angle,
				width: RULER_W,
				height: RULER_H,
				position: "absolute",
				top: 0,
				left: 0,
				transformOrigin: "center center",
				cursor: isRotating ? "grabbing" : "grab",
				touchAction: "none",
			}}
			className="group z-20"
		>
			{/* Visual Body */}
			<div className="w-full h-full relative">
				{/* Top Arm */}
				<div className="absolute top-0 w-full h-8 bg-white/60 backdrop-blur-sm border border-black/30 shadow-sm flex items-center justify-center">
					<span className="text-[8px] font-mono opacity-50 select-none pointer-events-none">
						PARALLEL RULER
					</span>
					{/* Measurement Ticks */}
					<div className="absolute bottom-0 w-full h-[5px] bg-[url('/images/ruler-ticks.svg')] bg-repeat-x opacity-30" />
				</div>

				{/* Bottom Arm */}
				<div className="absolute bottom-0 w-full h-8 bg-white/60 backdrop-blur-sm border border-black/30 shadow-sm flex items-center justify-center">
					{/* Measurement Ticks */}
					<div className="absolute top-0 w-full h-[5px] bg-[url('/images/ruler-ticks.svg')] bg-repeat-x opacity-30 invert" />
				</div>

				{/* Connection Links (Visual) */}
				<div className="absolute left-10 top-8 bottom-8 w-2 bg-black/10 -skew-x-12" />
				<div className="absolute right-10 top-8 bottom-8 w-2 bg-black/10 -skew-x-12" />

				{/* Rotation Handle (Right Side) */}
				<div
					onMouseDown={handleRotationStart}
					className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-accent rounded-full shadow-lg cursor-ew-resize flex items-center justify-center hover:scale-110 transition-transform z-30"
					title="Rotar"
				>
					<svg
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3" />
					</svg>
				</div>

				{/* Position text (Debug/Helper) */}
				<div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black/80 text-white text-3xs px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
					{angle.toFixed(1)}°
				</div>
			</div>
		</motion.div>
	);
}
