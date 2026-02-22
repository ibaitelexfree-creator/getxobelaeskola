"use client";

import type React from "react";
import { useEffect, useRef } from "react";
import { deg2rad, normalizeAngle360 } from "../physics/angleUtils";
import type { WindPhysicsState } from "../types";

interface ParticleSystemProps {
	physicsRef: React.MutableRefObject<WindPhysicsState>;
	particleCount?: number;
}

interface Particle {
	x: number;
	y: number;
	speed: number;
	life: number;
	offset: number; // Random offset for wave motion
}

export const ParticleSystem: React.FC<ParticleSystemProps> = ({
	physicsRef,
	particleCount = 2000,
}) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const particles = useRef<Particle[]>([]);

	// Initialize Particles
	useEffect(() => {
		particles.current = Array.from({ length: particleCount }, () => ({
			x: Math.random() * window.innerWidth,
			y: Math.random() * window.innerHeight,
			speed: 0.5 + Math.random() * 0.5,
			life: Math.random(),
			offset: Math.random() * 100,
		}));
	}, [particleCount]);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		let animationFrameId: number;

		const resize = () => {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		};
		window.addEventListener("resize", resize);
		resize();

		const render = () => {
			// 1. Read Physics State (No React Re-render!)
			const { apparentWindSpeed, apparentWindAngle, efficiency, isStalled } =
				physicsRef.current;

			// 2. Setup Canvas
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			// 3. Determine Flow Characteristics
			// Laminar (Cyan) vs Turbulent (Red)
			// If stalled, flow becomes chaotic.
			// If efficient, flow is smooth.

			// Normalized speed [0..1] for alpha/length
			const normSpeed = Math.min(apparentWindSpeed / 30, 1.0);

			// Global Wind Vector (Screen Space)
			// AWA 0 = Bow (Up/North). In Canvas Y-, X0.
			// AWA 90 = Starboard (Right/East). In Canvas X+, Y0.
			// Angle in Rad (Standard Math: 0 = Right, 90 = Down)
			// We need to convert Navigation Angle (0=Up, 90=Right) to Math Angle to use cos/sin for X/Y?
			// Math Angle = (90 - NavAngle) ?
			// Nav: 0 (Up). Math: -90 (Up).
			// Let's use our util: polarToCartesian gives x/y correct for Nav angle?
			// Our util says: 0deg -> (0, -1). 90deg -> (1, 0). Perfect.

			const windRad = deg2rad(apparentWindAngle);
			const windDirX = Math.sin(windRad);
			const windDirY = -Math.cos(windRad);

			// If turbulent, add jitter
			const turbulence = isStalled ? 2.0 : (1.0 - efficiency) * 0.5;

			// Color Logic
			let color = `rgba(0, 255, 255, ${0.1 + normSpeed * 0.2})`; // Cyan base
			if (isStalled) {
				color = `rgba(255, 50, 50, ${0.2 + normSpeed * 0.3})`; // Red stall
			} else if (efficiency > 0.9) {
				color = `rgba(100, 255, 100, ${0.2 + normSpeed * 0.3})`; // Green perfect
			}

			ctx.strokeStyle = color;
			ctx.lineWidth = 1.5;

			// 4. Update & Draw Particles
			ctx.beginPath();

			const w = canvas.width;
			const h = canvas.height;
			const speedScale = apparentWindSpeed * 2; // Pixels per frame approx

			for (let i = 0; i < particleCount; i++) {
				const p = particles.current[i];

				// Move
				let moveX = windDirX * p.speed * speedScale;
				let moveY = windDirY * p.speed * speedScale;

				// Add Turbulence Jitter
				if (turbulence > 0.1) {
					moveX += (Math.random() - 0.5) * turbulence * 5;
					moveY += (Math.random() - 0.5) * turbulence * 5;
				}

				p.x += moveX;
				p.y += moveY;

				// Wrap around screen
				// We need to wrap opposite to wind direction ideally,
				// but simple toroidal wrap (mod width/height) works if wind changes direction dynamically.
				if (p.x < 0) p.x += w;
				if (p.x > w) p.x -= w;
				if (p.y < 0) p.y += h;
				if (p.y > h) p.y -= h;

				// Draw Trail
				ctx.moveTo(p.x, p.y);
				ctx.lineTo(p.x - moveX * 2, p.y - moveY * 2);
			}

			ctx.stroke();

			animationFrameId = requestAnimationFrame(render);
		};

		render();

		return () => {
			window.removeEventListener("resize", resize);
			cancelAnimationFrame(animationFrameId);
		};
	}, [physicsRef, particleCount]);

	return <canvas ref={canvasRef} className="w-full h-full block" />;
};
