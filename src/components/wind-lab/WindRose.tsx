"use client";

import { ArrowDown, Wind } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

interface WindRoseProps {
	angle: number; // 0-360, where 0 is North (Head to Wind)
	speed: number; // Knots
	onChange: (angle: number, speed: number) => void;
	className?: string;
}

export default function WindRose({
	angle,
	speed,
	onChange,
	className = "",
}: WindRoseProps) {
	const svgRef = useRef<SVGSVGElement>(null);
	const [isDragging, setIsDragging] = useState(false);

	// Convert angle (degrees) to radians for calculation
	// Angle 0 = Top (North).
	// Standard Math: 0 = Right (East).
	// SVG Coords: Y is down.
	// To place an element at `angle` degrees from center:
	// x = cx + r * sin(angle)
	// y = cy - r * cos(angle)
	const toRad = (deg: number) => (deg * Math.PI) / 180;

	const cx = 150;
	const cy = 150;
	const maxRadius = 120; // Max radius for speed = 40kn? Or just fixed visual radius

	// Visual representation of the wind vector source
	// We place a handle at the "source" of the wind.
	// Distance from center could represent speed, or just be fixed on the ring.
	// Let's make distance represent speed (0-40 knots map to 20-120px radius)
	const speedToRadius = (s: number) =>
		Math.min(Math.max(s, 0) * 3 + 20, maxRadius);
	const radiusToSpeed = (r: number) => Math.max(0, Math.round((r - 20) / 3));

	const currentRadius = speedToRadius(speed);
	const handleX = cx + currentRadius * Math.sin(toRad(angle));
	const handleY = cy - currentRadius * Math.cos(toRad(angle));

	const handlePointerDown = (e: React.PointerEvent) => {
		setIsDragging(true);
		// Capture pointer to ensure we receive events outside the SVG
		(e.target as Element).setPointerCapture(e.pointerId);
		handlePointerMove(e);
	};

	const handlePointerMove = useCallback(
		(e: React.PointerEvent) => {
			if (!isDragging || !svgRef.current) return;

			const rect = svgRef.current.getBoundingClientRect();
			const x = e.clientX - rect.left - cx;
			const y = e.clientY - rect.top - cy;

			// Calculate Angle
			// atan2(y, x) gives angle from X axis (Right).
			// We want 0 at Top (Negative Y).
			// atan2(y, x) -> Right=0, Down=90, Left=180, Up=-90.
			// We want Up=0, Right=90, Down=180, Left=270.
			// Conversion: degrees = atan2(y, x) * 180 / PI + 90.
			let newAngle = (Math.atan2(y, x) * 180) / Math.PI + 90;
			if (newAngle < 0) newAngle += 360;

			// Calculate Speed (Distance from center)
			const dist = Math.sqrt(x * x + y * y);
			// Clamp distance to visual limits
			const clampedDist = Math.min(Math.max(dist, 20), maxRadius);
			const newSpeed = radiusToSpeed(clampedDist);

			onChange(Math.round(newAngle), newSpeed);
		},
		[isDragging, onChange],
	);

	const handlePointerUp = (e: React.PointerEvent) => {
		setIsDragging(false);
		(e.target as Element).releasePointerCapture(e.pointerId);
	};

	return (
		<div
			className={`relative flex flex-col items-center select-none ${className}`}
		>
			<svg
				ref={svgRef}
				width="300"
				height="300"
				viewBox="0 0 300 300"
				className="touch-none cursor-pointer"
				onPointerDown={handlePointerDown}
				onPointerMove={handlePointerMove}
				onPointerUp={handlePointerUp}
				onPointerLeave={handlePointerUp}
			>
				{/* Background Circle / Compass Rose */}
				<circle
					cx={cx}
					cy={cy}
					r={maxRadius}
					fill="#f8fafc"
					stroke="#e2e8f0"
					strokeWidth="1"
				/>
				<circle
					cx={cx}
					cy={cy}
					r={maxRadius * 0.66}
					fill="none"
					stroke="#f1f5f9"
					strokeWidth="1"
					strokeDasharray="4 4"
				/>
				<circle
					cx={cx}
					cy={cy}
					r={maxRadius * 0.33}
					fill="none"
					stroke="#f1f5f9"
					strokeWidth="1"
					strokeDasharray="4 4"
				/>

				{/* Compass Marks */}
				{[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
					<line
						key={deg}
						x1={cx + (maxRadius - 10) * Math.sin(toRad(deg))}
						y1={cy - (maxRadius - 10) * Math.cos(toRad(deg))}
						x2={cx + maxRadius * Math.sin(toRad(deg))}
						y2={cy - maxRadius * Math.cos(toRad(deg))}
						stroke="#94a3b8"
						strokeWidth={deg % 90 === 0 ? 2 : 1}
					/>
				))}

				{/* Labels */}
				<text
					x={cx}
					y={cy - maxRadius - 15}
					textAnchor="middle"
					className="text-xs fill-slate-500 font-bold"
				>
					N
				</text>
				<text
					x={cx + maxRadius + 15}
					y={cy + 4}
					textAnchor="middle"
					className="text-xs fill-slate-500 font-bold"
				>
					E
				</text>
				<text
					x={cx}
					y={cy + maxRadius + 20}
					textAnchor="middle"
					className="text-xs fill-slate-500 font-bold"
				>
					S
				</text>
				<text
					x={cx - maxRadius - 15}
					y={cy + 4}
					textAnchor="middle"
					className="text-xs fill-slate-500 font-bold"
				>
					W
				</text>

				{/* Boat in Center */}
				<g transform={`translate(${cx}, ${cy})`}>
					{/* Simple Boat Shape */}
					<path
						d="M0 -20 L10 10 L0 25 L-10 10 Z"
						fill="#0a1628" // Navy
						stroke="none"
					/>
					<path d="M0 -15 L0 15" stroke="white" strokeWidth="2" />
				</g>

				{/* No Go Zone Area (red transparent wedge at top) */}
				{/* Arc from -45 to +45 */}
				<path
					d={`M ${cx} ${cy} L ${cx + maxRadius * Math.sin(toRad(-45))} ${cy - maxRadius * Math.cos(toRad(-45))} A ${maxRadius} ${maxRadius} 0 0 1 ${cx + maxRadius * Math.sin(toRad(45))} ${cy - maxRadius * Math.cos(toRad(45))} Z`}
					fill="rgba(239, 68, 68, 0.1)" // Red-500 with low opacity
					pointerEvents="none"
				/>

				{/* Wind Vector (Arrow pointing to center) */}
				{/* We draw a line from the handle to the center? Or an arrow at the center? */}
				{/* Let's draw an arrow from the handle pointing towards the center to visualize "Wind From" */}
				<defs>
					<marker
						id="arrowhead"
						markerWidth="10"
						markerHeight="7"
						refX="9"
						refY="3.5"
						orient="auto"
					>
						<polygon points="0 0, 10 3.5, 0 7" fill="#ca8a04" />
					</marker>
				</defs>

				<line
					x1={handleX}
					y1={handleY}
					x2={cx + 25 * Math.sin(toRad(angle))} // Don't go all the way to center so we see the boat
					y2={cy - 25 * Math.cos(toRad(angle))}
					stroke="#ca8a04" // Accent Gold
					strokeWidth="3"
					markerEnd="url(#arrowhead)"
					pointerEvents="none"
				/>

				{/* Draggable Handle (Wind Source) */}
				<circle
					cx={handleX}
					cy={handleY}
					r="12"
					fill="#ca8a04"
					className="cursor-grab active:cursor-grabbing hover:scale-110 transition-transform"
					stroke="white"
					strokeWidth="2"
				/>

				{/* Text showing current values near handle */}
				{isDragging && (
					<g>
						<rect
							x={handleX + 15}
							y={handleY - 15}
							width="80"
							height="40"
							rx="4"
							fill="rgba(0,0,0,0.8)"
						/>
						<text x={handleX + 25} y={handleY + 5} fill="white" fontSize="12">
							{angle}°
						</text>
						<text
							x={handleX + 25}
							y={handleY + 20}
							fill="white"
							fontSize="12"
							fontWeight="bold"
						>
							{speed} kn
						</text>
					</g>
				)}
			</svg>
			<div className="text-center mt-2 text-sm text-slate-500">
				Arrastra el punto amarillo para cambiar viento y velocidad
			</div>
		</div>
	);
}
