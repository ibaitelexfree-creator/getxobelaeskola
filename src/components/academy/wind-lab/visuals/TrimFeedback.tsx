"use client";

import type React from "react";

interface TrimFeedbackProps {
	currentSailAngle: number;
	optimalSailAngle: number;
	efficiency: number;
	isStalled: boolean;
	label?: string;
}

export const TrimFeedback: React.FC<TrimFeedbackProps> = ({
	efficiency,
	label = "EFFICIENCY",
}) => {
	return (
		<div className="flex flex-col gap-1 w-full">
			<div className="flex justify-between items-end mb-1">
				<span className="text-[10px] md:text-xs font-bold text-slate-400 tracking-widest uppercase">
					{label}
				</span>
				<span className="text-xs font-mono font-medium text-cyan-300 drop-shadow-[0_0_5px_cyan]">
					{(efficiency * 100).toFixed(0)}%
				</span>
			</div>

			<div className="relative h-1.5 w-full bg-slate-800/50 rounded-full shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] overflow-visible group border border-white/5">
				{/* Glow Background Line */}
				<div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-cyan-500/10" />

				{/* Active Bar */}
				<div
					className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.6)] transition-all duration-100 ease-out"
					style={{ width: `${Math.max(0, efficiency * 100)}%` }}
				>
					{/* Thumb / Knob */}
					<div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-2.5 h-2.5 bg-slate-950 border border-cyan-400 rounded-full shadow-[0_0_8px_cyan] z-10" />
				</div>
			</div>
		</div>
	);
};
