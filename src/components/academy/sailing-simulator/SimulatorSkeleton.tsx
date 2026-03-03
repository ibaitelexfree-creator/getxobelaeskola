import type React from "react";

export const SimulatorSkeleton: React.FC = () => {
	return (
		<div className="w-full h-screen bg-nautical-black relative overflow-hidden flex items-center justify-center">
			{/* Background Placeholder */}
			<div className="absolute inset-0 bg-gradient-to-b from-sky-900/20 to-nautical-black/80 animate-pulse" />

			{/* Loading Spinner / Logo Center */}
			<div className="relative z-10 flex flex-col items-center gap-4">
				<div className="w-16 h-16 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
				<div className="text-accent text-sm font-black tracking-[0.2em] animate-pulse">
					CARGANDO SIMULADOR...
				</div>
			</div>

			{/* HUD Skeleton Overlay - Mimics HUDManager layout */}
			<div className="absolute inset-0 pointer-events-none p-6">
				{/* Score Panel (Top Left) */}
				<div className="absolute top-6 left-6 flex flex-col gap-2">
					<div className="w-32 h-4 bg-white/10 rounded animate-pulse" />
					<div className="w-24 h-8 bg-white/5 rounded animate-pulse" />
				</div>

				{/* Radar Panel (Top Right) */}
				<div className="absolute top-6 right-6 w-[140px] h-[140px] rounded-full border border-white/10 bg-black/20 animate-pulse flex items-center justify-center">
					<div className="w-3/4 h-3/4 rounded-full border border-white/5" />
				</div>

				{/* Instruments (Bottom Center) */}
				<div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-8 items-end">
					<div className="flex flex-col items-center gap-2">
						<div className="w-20 h-4 bg-white/10 rounded animate-pulse" />
						<div className="w-16 h-8 bg-white/5 rounded animate-pulse" />
					</div>
					<div className="w-px h-12 bg-white/10" />
					<div className="flex flex-col items-center gap-2">
						<div className="w-24 h-4 bg-white/10 rounded animate-pulse" />
						<div className="w-32 h-2 bg-white/5 rounded-full animate-pulse" />
					</div>
				</div>

				{/* Wind Dial (Bottom Left) */}
				<div className="absolute bottom-6 left-6 w-[100px] h-[100px] rounded-full border border-white/10 bg-black/20 animate-pulse" />
			</div>
		</div>
	);
};
