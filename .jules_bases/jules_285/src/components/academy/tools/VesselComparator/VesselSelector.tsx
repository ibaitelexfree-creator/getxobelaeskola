'use client';

import { Vessel } from '@/data/vessels';
import { Check, Sailboat } from 'lucide-react';

interface VesselSelectorProps {
  vessels: Vessel[];
  selectedIds: string[];
  onSelect: (id: string) => void;
}

export default function VesselSelector({ vessels, selectedIds, onSelect }: VesselSelectorProps) {
  const isMaxSelected = selectedIds.length >= 3;

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {vessels.map((vessel) => {
          const isSelected = selectedIds.includes(vessel.id);
          const isDisabled = !isSelected && isMaxSelected;

          return (
            <button
              key={vessel.id}
              onClick={() => onSelect(vessel.id)}
              disabled={isDisabled}
              className={`
                relative flex flex-col items-center justify-center p-4 rounded-lg border transition-all duration-300 group outline-none focus-visible:ring-2 focus-visible:ring-accent
                ${isSelected
                  ? 'bg-accent/10 border-accent shadow-[0_0_15px_rgba(202,138,4,0.2)]'
                  : isDisabled
                    ? 'bg-white/5 border-white/5 opacity-50 cursor-not-allowed'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                }
              `}
              title={isDisabled ? "Máximo 3 embarcaciones seleccionadas" : `Seleccionar ${vessel.name}`}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 bg-accent text-nautical-black rounded-full p-0.5 animate-in zoom-in duration-200">
                  <Check size={12} strokeWidth={3} />
                </div>
              )}

              <div className={`p-3 rounded-full mb-3 transition-colors ${isSelected ? 'bg-accent/20 text-accent' : 'bg-white/5 text-white/40 group-hover:text-white/60'}`}>
                <Sailboat size={24} />
              </div>

              <h3 className={`text-sm font-bold uppercase tracking-wide mb-1 ${isSelected ? 'text-accent' : 'text-white'}`}>
                {vessel.name}
              </h3>

              <p className="text-[10px] uppercase tracking-wider text-white/40 text-center">
                {vessel.type}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
