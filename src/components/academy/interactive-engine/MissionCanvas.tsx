import type React from "react";
import { MissionFactory } from "./MissionFactory";
import type { MissionData } from "./types";

interface MissionCanvasProps {
	missionData: MissionData;
	onComplete?: (score: number) => void;
}

export const MissionCanvas: React.FC<MissionCanvasProps> = ({
	missionData,
	onComplete,
}) => {
	return (
		<MissionFactory
			type={missionData.tipo_contenido}
			data={missionData}
			onComplete={onComplete}
		/>
	);
};
