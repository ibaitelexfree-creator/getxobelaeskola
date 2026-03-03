import type React from "react";
import { getMissionComponent } from "./MissionRegistry";
import type { MissionData, MissionType } from "./types";

interface MissionFactoryProps {
	type: MissionType;
	data: MissionData;
	onComplete?: (score: number) => void;
}

const MissionFallback: React.FC<{ type: string }> = ({ type }) => (
	<div className="p-8 text-center border-2 border-red-500/20 bg-red-900/10 rounded-lg">
		<h4 className="text-red-400 font-bold mb-2">Error de Carga</h4>
		<p className="text-red-200/60 text-sm">
			No se encontró un componente para el tipo de misión:{" "}
			<span className="font-mono bg-black/20 px-1 rounded">{type}</span>
		</p>
	</div>
);

export const MissionFactory: React.FC<MissionFactoryProps> = ({
	type,
	data,
	onComplete,
}) => {
	const Component = getMissionComponent(type);

	if (!Component) {
		return <MissionFallback type={type} />;
	}

	return <Component data={data} onComplete={onComplete} />;
};
