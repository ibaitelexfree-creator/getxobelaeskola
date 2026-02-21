
import React from 'react';
import { MissionType } from './types';

// Mission Components
import { TacticalScenarioMission } from './missions/TacticalScenarioMission';
import { KnotMission } from './missions/KnotMission';
import { InventoryMission } from './missions/InventoryMission';
import { SimulatorEmbedMission } from './missions/SimulatorEmbedMission';
import { HotspotMission } from './missions/HotspotMission';
import { BranchingScenarioMission } from './missions/BranchingScenarioMission';

// Registry Map
export const MISSION_REGISTRY: Record<MissionType, React.ComponentType<any>> = {
    'mision_tactica': TacticalScenarioMission,
    'mision_nudos': KnotMission,
    'inventario': InventoryMission,
    'simulador': SimulatorEmbedMission,
    'hotspot': HotspotMission,
    'mision_ramificada': BranchingScenarioMission // New mission type
};

export const getMissionComponent = (type: MissionType) => {
    return MISSION_REGISTRY[type] || null;
};
