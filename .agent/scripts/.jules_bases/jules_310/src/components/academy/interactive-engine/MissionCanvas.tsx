
import React from 'react';
import { MissionData } from './types';
import { MissionFactory } from './MissionFactory';

interface MissionCanvasProps {
    missionData: MissionData;
    onComplete?: (score: number) => void;
}

export const MissionCanvas: React.FC<MissionCanvasProps> = ({ missionData, onComplete }) => {
    return (
        <MissionFactory
            type={missionData.tipo_contenido}
            data={missionData}
            onComplete={onComplete}
        />
    );
};
