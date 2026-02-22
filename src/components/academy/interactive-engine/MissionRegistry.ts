import type React from "react";
import { HotspotMission } from "./missions/HotspotMission";
import { InventoryMission } from "./missions/InventoryMission";
import { KnotMission } from "./missions/KnotMission";
import { SimulatorEmbedMission } from "./missions/SimulatorEmbedMission";
// Mission Components
import { TacticalScenarioMission } from "./missions/TacticalScenarioMission";
import type { MissionType } from "./types";

// Registry Map
export const MISSION_REGISTRY: Record<MissionType, React.ComponentType<any>> = {
	mision_tactica: TacticalScenarioMission,
	mision_nudos: KnotMission,
	inventario: InventoryMission,
	simulador: SimulatorEmbedMission,
	hotspot: HotspotMission,
};

export const getMissionComponent = (type: MissionType) => {
	return MISSION_REGISTRY[type] || null;
};
