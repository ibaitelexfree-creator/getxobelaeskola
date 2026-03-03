
import React from 'react';
import { MissionData } from '../types';

interface Props {
    data: MissionData;
    onComplete?: (score: number) => void;
}

export const InventoryMission: React.FC<Props> = ({ data }) => (
    <div className="text-center p-8 bg-green-900/10 rounded-lg border border-green-500/20">
        <h4 className="text-xl font-display text-green-300 mb-4">Inventario de Cubierta</h4>
        <p className="text-green-100/60 mb-6">{data.descripcion || 'Encuentra y organiza los objetos.'}</p>
        <div className="flex flex-wrap gap-4 justify-center">
            {data.items?.map((item: string, idx: number) => (
                <div key={idx} className="p-3 bg-black/40 rounded border border-green-500/30">
                    <span className="text-2xs font-bold text-green-400 uppercase tracking-wider">{item}</span>
                </div>
            )) || <p className="text-white/30 italic">No hay items definidos.</p>}
        </div>
    </div>

);
