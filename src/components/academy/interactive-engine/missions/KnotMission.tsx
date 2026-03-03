import type React from "react";
import type { MissionData } from "../types";

interface Props {
	data: MissionData;
	onComplete?: (score: number) => void;
}

export const KnotMission: React.FC<Props> = ({ data }) => (
	<div className="text-center p-8 bg-blue-900/10 rounded-lg border border-blue-500/20">
		<h4 className="text-xl font-display text-blue-200 mb-4">Taller de Nudos</h4>
		<p className="text-blue-100/60 mb-6">
			{data.descripcion || "Practica la cabuyería marinera."}
		</p>
		<div className="flex flex-wrap gap-4 justify-center">
			{data.nudos?.map((n: any, idx: number) => (
				<div
					key={idx}
					className="p-4 bg-black/40 rounded border border-blue-500/30 w-40"
				>
					<div className="w-16 h-16 bg-blue-500/10 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl">
						🪢
					</div>
					<p className="font-bold text-blue-200 text-sm">{n.nombre}</p>
				</div>
			)) || <p className="text-white/30 italic">No hay nudos definidos.</p>}
		</div>
	</div>
);
