import { Target, Trophy } from "lucide-react";
import React from "react";

interface PlannerGoalWidgetProps {
	actualMinutes: number;
	goalMinutes: number;
	onUpdateGoal: (newGoal: number) => void;
}

export default function PlannerGoalWidget({
	actualMinutes,
	goalMinutes,
	onUpdateGoal,
}: PlannerGoalWidgetProps) {
	const percentage =
		goalMinutes > 0 ? Math.min((actualMinutes / goalMinutes) * 100, 100) : 0;

	return (
		<div className="bg-card border border-card-border p-6 rounded-sm flex flex-col justify-between h-full relative overflow-hidden">
			<div className="absolute top-0 right-0 p-8 opacity-[0.03] text-accent pointer-events-none">
				<Target size={120} />
			</div>

			<div>
				<div className="flex justify-between items-start mb-6 relative z-10">
					<h3 className="text-xs uppercase tracking-widest text-accent font-bold flex items-center gap-2">
						<Trophy size={14} /> Progreso Semanal
					</h3>
					<button
						onClick={() => {
							const newGoal = prompt(
								"Establece tu meta semanal en minutos:",
								goalMinutes.toString(),
							);
							if (newGoal && !isNaN(Number(newGoal))) {
								onUpdateGoal(Number(newGoal));
							}
						}}
						className="text-[10px] text-white/40 hover:text-white underline decoration-dashed"
					>
						Editar Meta
					</button>
				</div>

				<div className="flex items-end gap-2 mb-2 relative z-10">
					<span className="text-4xl font-display text-white italic">
						{actualMinutes}
					</span>
					<span className="text-sm text-white/40 mb-1 font-medium">
						/ {goalMinutes} min
					</span>
				</div>
			</div>

			<div className="relative z-10">
				<div className="flex justify-between text-[10px] uppercase tracking-widest text-white/30 mb-2">
					<span>0%</span>
					<span>100%</span>
				</div>
				<div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
					<div
						className="h-full bg-accent shadow-[0_0_15px_rgba(var(--accent-rgb),0.5)] transition-all duration-1000 ease-out"
						style={{ width: `${percentage}%` }}
					/>
				</div>
				<p className="mt-4 text-xs text-white/50 leading-relaxed">
					{percentage >= 100
						? "¡Objetivo cumplido! Sigue así navegante. ⚓️"
						: "Mantén el rumbo para alcanzar tu meta de estudio."}
				</p>
			</div>
		</div>
	);
}
