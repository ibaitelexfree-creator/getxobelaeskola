"use client";

import type React from "react";
import { useEffect, useRef } from "react";
import type { WindPhysicsState } from "../types";

interface WaterBackgroundProps {
	physicsRef: React.MutableRefObject<WindPhysicsState>;
}

export const WaterBackground: React.FC<WaterBackgroundProps> = ({
	physicsRef,
}) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		let animationFrameId: number;
		let offsetYSpeed = 0; // Vertical scroll offset (boat moving forward)
		// We simulate infinite scrolling water texture moving DOWN to simulate boat moving UP/NORTH
		// Physics: Y negative is North.
		// If boat moves North (positive speed), texture moves South (positive Y).

		// Setup scaling
		const resize = () => {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		};
		window.addEventListener("resize", resize);
		resize();

		const render = () => {
			if (!ctx || !canvas) return;

			// Clear
			// We use a dark gradient background
			const gradient = ctx.createRadialGradient(
				canvas.width / 2,
				canvas.height / 2,
				0,
				canvas.width / 2,
				canvas.height / 2,
				canvas.width,
			);
			gradient.addColorStop(0, "#0f172a"); // Slate-900 (Dark Blue)
			gradient.addColorStop(1, "#020617"); // Slate-950 (Black Blue)

			ctx.fillStyle = gradient;
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			// Access physics state
			const speed = physicsRef.current.boatSpeed; // Knots

			// Update offset
			// Speed is Knots. 1 knot approx 0.514 m/s.
			// Let's say 1 m/s = 20 pixels/frame for game feel.
			const pxPerFrame = speed * 0.5;
			offsetYSpeed += pxPerFrame;

			// Draw Grid / Waves
			ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
			ctx.lineWidth = 1;

			const gridSize = 100;
			const yStart = offsetYSpeed % gridSize;

			// Vertical Lines (Meridians) - Static
			for (let x = 0; x < canvas.width; x += gridSize) {
				ctx.beginPath();
				ctx.moveTo(x, 0);
				ctx.lineTo(x, canvas.height);
				ctx.stroke();
			}

			// Horizontal Lines (Parallels) - Moving
			for (let y = yStart - gridSize; y < canvas.height; y += gridSize) {
				ctx.beginPath();
				ctx.moveTo(0, y);
				ctx.lineTo(canvas.width, y);
				ctx.stroke();
			}

			animationFrameId = requestAnimationFrame(render);
		};

		render();

		return () => {
			window.removeEventListener("resize", resize);
			cancelAnimationFrame(animationFrameId);
		};
	}, [physicsRef]);

	return <canvas ref={canvasRef} className="w-full h-full block" />;
};
