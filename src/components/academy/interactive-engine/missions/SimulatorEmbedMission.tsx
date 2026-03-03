
import React from 'react';
import { MissionData } from '../types';

interface Props {
    data: MissionData;
    onComplete?: (score: number) => void;
}

export const SimulatorEmbedMission: React.FC<Props> = ({ data }) => (
    <div className="w-full h-[400px] bg-black rounded-lg border-2 border-accent/20 flex flex-col items-center justify-center relative overflow-hidden group">
        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
        <div className="text-6xl mb-4 animate-bounce-slow">🌬️</div>
        <h4 className="text-xl font-display italic text-accent mb-2">Simulador de Viento</h4>
        <p className="text-white/60 mb-8 max-w-md text-center">{data.descripcion || 'Configura el viento y trimado para alcanzar la eficiencia máxima.'}</p>
        <button className="px-8 py-3 bg-accent text-nautical-black font-black uppercase tracking-widest text-sm rounded shadow-lg hover:bg-white transition-colors">
            Iniciar Simulación
        </button>
    </div>
);
