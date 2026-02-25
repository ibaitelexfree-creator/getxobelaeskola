'use client';

import { useState } from 'react';
import { vessels } from '@/data/vessels';
import VesselSelector from './VesselSelector';
import ComparisonTable from './ComparisonTable';

export default function VesselComparator() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(s => s !== id));
    } else if (selectedIds.length < 3) {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <div className="flex flex-col h-full w-full text-white p-4 md:p-8 overflow-hidden">
       {/* Header */}
       <div className="mb-8 flex-shrink-0">
          <h2 className="text-3xl font-display text-accent italic mb-2">Hangar Naval</h2>
          <p className="text-sm text-white/60 font-light tracking-wide max-w-2xl">
            Herramienta técnica para el análisis comparativo de la flota.
            Selecciona hasta <span className="text-white font-bold">3 embarcaciones</span> para visualizar sus especificaciones en paralelo.
          </p>
       </div>

       {/* Selection Area */}
       <div className="flex-shrink-0 mb-8">
           <VesselSelector
              vessels={vessels}
              selectedIds={selectedIds}
              onSelect={handleSelect}
           />
       </div>

       {/* Table */}
       <div className="flex-1 overflow-hidden relative bg-black/20 rounded-lg border border-white/5 backdrop-blur-sm">
          {selectedIds.length > 0 ? (
             <div className="absolute inset-0 overflow-auto custom-scrollbar">
                <ComparisonTable selectedIds={selectedIds} />
             </div>
          ) : (
             <div className="absolute inset-0 flex flex-col items-center justify-center text-white/20 animate-pulse">
                <p className="uppercase tracking-[0.2em] text-xs font-bold border-b border-white/10 pb-2 mb-2">Esperando Selección</p>
                <p className="text-[10px] font-mono">Selecciona una embarcación para comenzar el análisis</p>
             </div>
          )}
       </div>
    </div>
  );
}
