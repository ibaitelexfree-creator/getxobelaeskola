"use client";

import type React from "react";
import { useCallback, useEffect } from "react";
import { useWindPhysics } from "./hooks/useWindPhysics";
import { ParticleSystem } from "./layers/ParticleSystem";
import { WaterBackground } from "./layers/WaterBackground";
import { PHYSICS_CONSTANTS } from "./physics/constants";

interface WindTunnelProps {
	initialWindSpeed?: number;
	initialWindDir?: number;
}

export const WindTunnel: React.FC<WindTunnelProps> = ({
	initialWindSpeed = 15,
	initialWindDir = 0,
}) => {
	// 1. Initialize Physics Engine
	const { physicsState, runPhysicsStep, setWindDirection, setSailAngle } =
		useWindPhysics({
			difficulty: "beginner",
			initialWindSpeed,
			initialWindDirection: initialWindDir,
		});

	// 2. The Game Loop
	// Responsible for stepping the physics engine at 60fps
	const animate = useCallback(() => {
		// Step Physics (DT = 1/60)
		runPhysicsStep(PHYSICS_CONSTANTS.DT);

		requestAnimationFrame(animate);
	}, [runPhysicsStep]);

	useEffect(() => {
		const rAF = requestAnimationFrame(animate);
		return () => cancelAnimationFrame(rAF);
	}, [animate]);

	// 3. Temporary Debug Controls (Phase 2)
	// We will replace this with Phase 3 Cockpit later.
	const handleDebugControl = (e: React.ChangeEvent<HTMLInputElement>) => {
		const val = parseInt(e.target.value);
		setWindDirection(val);
	};

	return (
		<div className="relative w-full h-screen overflow-hidden bg-slate-900 select-none">
			{/* Layer 1: Water (Canvas) */}
			<div className="absolute inset-0 z-0">
				<WaterBackground physicsRef={physicsState} />
			</div>

			{/* Layer 2: Wind Particles (Canvas) */}
			<div className="absolute inset-0 z-10 pointer-events-none">
				<ParticleSystem physicsRef={physicsState} particleCount={3000} />
			</div>

			{/* Layer 3: The Boat (SVG - Placeholder for Phase 3) */}
			<div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
				{/* Simple SVG Boat for context */}
				<svg
					width="200"
					height="400"
					viewBox="0 0 100 200"
					className="opacity-80"
				>
					{/* Hull */}
					<path
						d="M50,0 C80,50 80,150 50,200 C20,150 20,50 50,0 Z"
						fill="#334155"
						stroke="#94a3b8"
						strokeWidth="2"
					/>
					{/* Mast */}
					<circle cx="50" cy="100" r="3" fill="white" />
				</svg>
			</div>

			{/* Layer 5: UI Overlay (Debug) */}
			<div className="absolute bottom-10 left-10 z-50 bg-black/50 p-4 rounded text-white backdrop-blur-md">
				<h3 className="font-bold mb-2">Debug Controls (Phase 2)</h3>
				<div className="flex flex-col gap-2">
					<label className="text-2xs">
						Wind Direction
						<input
							type="range"
							min="0"
							max="360"
							defaultValue={initialWindDir}
							onChange={(e) => setWindDirection(parseInt(e.target.value))}
							className="w-full mt-1"
						/>
					</label>
					<label className="text-2xs">
						Sail Angle
						<input
							type="range"
							min="0"
							max="90"
							defaultValue={0}
							onChange={(e) => setSailAngle(parseInt(e.target.value))}
							className="w-full mt-1"
						/>
					</label>
					<p className="text-2xs opacity-50">Adjust to generate lift.</p>
				</div>
			</div>
		</div>
	);
};

export default WindTunnel;
