import type React from "react";
import type { MissionStep } from "../../types";

interface StepProps {
	step: MissionStep;
	onOptionSelect: (index: number) => void;
}

export const SummaryStep: React.FC<StepProps> = ({ step, onOptionSelect }) => {
	const { title, body } = step.content;
	const isSuccess =
		step.content.status === "success" ||
		!title?.toLowerCase().includes("error"); // heuristic or explicit

	return (
		<div
			className={`p-8 rounded-lg border-2 ${isSuccess ? "border-green-500/30 bg-green-900/10" : "border-red-500/30 bg-red-900/10"} text-center space-y-6`}
		>
			<div className="text-6xl mb-4">{isSuccess ? "🎉" : "⚠️"}</div>

			<h2
				className={`text-3xl font-display italic ${isSuccess ? "text-green-400" : "text-red-400"}`}
			>
				{title}
			</h2>

			<p className="text-white/80 text-lg max-w-lg mx-auto leading-relaxed">
				{body}
			</p>

			{/* Usually summary is terminal, but we might want a 'Finish' button to close */}
			<div className="pt-8">
				<button
					onClick={() => onOptionSelect(0)} // Trigger completion
					className={`px-8 py-3 font-bold uppercase tracking-widest rounded-sm transition-colors ${
						isSuccess
							? "bg-green-600 text-white hover:bg-green-500"
							: "bg-white/10 text-white hover:bg-white/20"
					}`}
				>
					{isSuccess ? "Finalizar Misión" : "Intentar de Nuevo"}
				</button>
			</div>
		</div>
	);
};
