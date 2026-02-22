"use client";

import { useRouter } from "next/navigation";
import React from "react";
import SimulationRunner from "@/components/academy/skills/SimulationRunner";

export default function SimulationPage() {
	const router = useRouter();

	return (
		<div className="min-h-screen bg-nautical-black">
			{/* Header minimalista para la simulación */}
			<div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-nautical-black/80 backdrop-blur-md border-b border-white/5">
				<div className="flex items-center gap-3">
					<span className="text-xl">⚓</span>
					<h1 className="text-lg font-bold text-white uppercase tracking-wider">
						Simulacro PER{" "}
						<span className="text-white/40 text-xs ml-2">
							90 min • 60 preguntas
						</span>
					</h1>
				</div>
				<button
					onClick={() => router.back()}
					className="text-white/60 hover:text-white text-sm uppercase tracking-widest transition-colors"
				>
					Salir
				</button>
			</div>

			<SimulationRunner onExit={() => router.back()} />
		</div>
	);
}
