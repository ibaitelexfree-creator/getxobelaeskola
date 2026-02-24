
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MousePointer2, Rotate3d, HelpCircle } from 'lucide-react';
import BoatScene from '../nomenclature/3d/Scene';
import InfoOverlay from '../nomenclature/3d/InfoOverlay';

export default function NomenclatureActivity() {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    return (
        <div className="w-full max-w-6xl mx-auto p-4 md:p-8 h-[80vh] flex flex-col relative">
            {/* Header Instructions */}
            <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4 pointer-events-none">
                <div className="bg-nautical-panel/80 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 pointer-events-auto shadow-lg">
                    <div className="flex items-center gap-3 text-white/80">
                        <Rotate3d className="w-5 h-5 text-accent animate-pulse" />
                        <span className="text-sm font-light tracking-wide">
                            Interactúa con el modelo 3D para explorar las partes del barco.
                        </span>
                    </div>
                </div>

                {/* Legend / Hints */}
                <div className="flex gap-4 pointer-events-auto">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5 text-xs text-white/60">
                        <MousePointer2 className="w-3 h-3" />
                        <span>Clic para detalles</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5 text-xs text-white/60">
                        <HelpCircle className="w-3 h-3" />
                        <span>Preguntas de repaso</span>
                    </div>
                </div>
            </header>

            {/* Main Interactive Viewer */}
            <div className="flex-1 relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-gradient-to-b from-sky-300/5 to-blue-900/20 backdrop-blur-sm group">

                {/* The 3D Scene */}
                <BoatScene
                    highlightId={selectedId}
                    onPartClick={setSelectedId}
                    onPartHover={setHoveredId}
                />

                {/* UI Overlay */}
                <InfoOverlay
                    selectedId={selectedId}
                    hoveredId={hoveredId}
                    onClose={() => setSelectedId(null)}
                />

                {/* Hint for interaction if idle? Could be added later */}
            </div>

            {/* Footer / Context */}
            <div className="mt-4 text-center text-white/20 text-xs font-mono tracking-widest uppercase">
                Modelo Interactivo • Nomenclatura Náutica
            </div>
        </div>
    );
}
