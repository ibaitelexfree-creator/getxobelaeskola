"use client";

import type React from "react";
import { useEffect, useRef } from "react";
import type { WindLabState } from "../physics/PhysicsEngine";

interface SeaSurfaceCanvasProps {
	state: WindLabState;
}

export const SeaSurfaceCanvas: React.FC<SeaSurfaceCanvasProps> = ({
	state,
}) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const timeRef = useRef(0);
	const waveOffset = useRef(0);
	const currentSpeed = useRef(0);
	const stateRef = useRef(state);

	useEffect(() => {
		stateRef.current = state;
	}, [state]);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		let animationFrameId: number;

		const resizeCanvas = () => {
			if (canvas.parentElement) {
				canvas.width = canvas.parentElement.clientWidth;
				canvas.height = canvas.parentElement.clientHeight;
			}
		};

		window.addEventListener("resize", resizeCanvas);
		resizeCanvas();

		const draw = (time: number) => {
			timeRef.current = time * 0.001;
			const currentState = stateRef.current;

			// Smooth speed transition
			currentSpeed.current +=
				(currentState.boatSpeed - currentSpeed.current) * 0.1;

			waveOffset.current += currentSpeed.current * 0.1;

			// Clear Background
			const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
			gradient.addColorStop(0, "#0f172a"); // Slate 900
			gradient.addColorStop(1, "#1e293b"); // Slate 800
			ctx.fillStyle = gradient;
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			// Draw Waves
			ctx.save();
			ctx.translate(canvas.width / 2, canvas.height / 2);

			const angleRad = (currentState.boatHeading * Math.PI) / 180;
			const flowX = -Math.sin(angleRad) * waveOffset.current * 5;
			const flowY = Math.cos(angleRad) * waveOffset.current * 5;

			// Draw a repeating pattern of "waves"
			ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
			ctx.lineWidth = 2;

			const gridSize = 100;
			const cols = Math.ceil(canvas.width / gridSize) + 2;
			const rows = Math.ceil(canvas.height / gridSize) + 2;

			// Offset for infinite scrolling illusion
			const offsetX = flowX % gridSize;
			const offsetY = flowY % gridSize;

			for (let i = -1; i < cols; i++) {
				for (let j = -1; j < rows; j++) {
					const x = i * gridSize + offsetX - canvas.width / 2;
					const y = j * gridSize + offsetY - canvas.height / 2;

					ctx.beginPath();
					for (let k = 0; k < gridSize; k += 10) {
						const wx = x + k;
						const waveY = Math.sin((wx + timeRef.current * 50) * 0.05) * 5;
						const wy = y + waveY + k * 0.1;
						if (k === 0) ctx.moveTo(wx, wy);
						else ctx.lineTo(wx, wy);
					}
					ctx.stroke();
				}
			}

			// Draw Wake (Estela) behind boat
			ctx.rotate(angleRad);

			if (currentSpeed.current > 1) {
				ctx.beginPath();
				const wakeLength = currentSpeed.current * 10 + 50;
				const wakeWidth = currentSpeed.current * 5 + 20;

				const grdWake = ctx.createLinearGradient(0, 0, 0, wakeLength);
				grdWake.addColorStop(0, "rgba(255,255,255,0.4)");
				grdWake.addColorStop(1, "rgba(255,255,255,0)");

				ctx.fillStyle = grdWake;

				ctx.moveTo(0, 20);
				ctx.lineTo(-wakeWidth, wakeLength);
				ctx.lineTo(0, wakeLength * 0.8);
				ctx.fill();

				ctx.moveTo(0, 20);
				ctx.lineTo(wakeWidth, wakeLength);
				ctx.lineTo(0, wakeLength * 0.8);
				ctx.fill();
			}

			ctx.restore();

			animationFrameId = requestAnimationFrame(draw);
		};

		animationFrameId = requestAnimationFrame(draw);

		return () => {
			cancelAnimationFrame(animationFrameId);
			window.removeEventListener("resize", resizeCanvas);
		};
	}, []);

	return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
};
