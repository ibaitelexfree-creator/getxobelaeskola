import type React from "react";
import type { MissionData } from "../types";

interface Props {
	data: MissionData;
	onComplete?: (score: number) => void;
}

export const HotspotMission: React.FC<Props> = ({ data }) => (
	<div className="text-center p-8 bg-purple-900/10 rounded-lg border border-purple-500/20">
		<h4 className="text-xl font-display text-purple-300 mb-4">
			Identificación Visual
		</h4>
		<p className="text-purple-100/60 mb-6">
			{data.descripcion || "Selecciona las zonas correctas en la imagen."}
		</p>
		<div className="w-full h-64 bg-black/40 rounded flex items-center justify-center relative border border-white/10">
			<span className="text-white/20 text-sm font-mono">
				[ IMAGEN REQUERIDA ]
			</span>
			{/* Simple hotspot overlay mock */}
			<div className="absolute top-1/4 left-1/4 w-8 h-8 rounded-full border-2 border-white/40 hover:border-accent hover:bg-accent/20 cursor-pointer animate-ping-slow"></div>
		</div>
	</div>
);
