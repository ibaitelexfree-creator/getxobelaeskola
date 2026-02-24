'use client';

import { useState } from 'react';
import ConstellationMap from '@/components/academy/navigation/ConstellationMap';
import VesselComparator from '@/components/academy/tools/VesselComparator/VesselComparator';

export default function ExplorationPage() {
    const [mode, setMode] = useState<'map' | 'comparator'>('map');

    return (
        <div className="w-full h-screen relative bg-[#000510] flex flex-col items-center justify-center overflow-hidden">
            {/* Header Overlay */}
            <div className="absolute top-10 left-1/2 -translate-x-1/2 z-20 text-center pointer-events-none w-full px-4">
                <h1 className="text-3xl font-display text-white italic tracking-wide drop-shadow-lg transition-all duration-500">
                    {mode === 'map' ? 'Mapa Estelar' : 'Hangar Naval'}
                </h1>
                <p className="text-[10px] text-accent uppercase tracking-[0.3em] font-light mt-2 transition-all duration-500">
                    {mode === 'map' ? 'Navegación Libre' : 'Comparador Técnico'}
                </p>
            </div>

            {/* Mode Switcher */}
            <div className="absolute top-28 left-1/2 -translate-x-1/2 z-30 flex bg-white/5 backdrop-blur-md rounded-full p-1 border border-white/10 shadow-lg pointer-events-auto">
                 <button
                    onClick={() => setMode('map')}
                    className={`px-6 py-2 text-[10px] uppercase tracking-widest rounded-full transition-all duration-300 font-bold ${mode === 'map' ? 'bg-accent text-nautical-black shadow-lg' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                 >
                    Mapa
                 </button>
                 <button
                    onClick={() => setMode('comparator')}
                    className={`px-6 py-2 text-[10px] uppercase tracking-widest rounded-full transition-all duration-300 font-bold ${mode === 'comparator' ? 'bg-accent text-nautical-black shadow-lg' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                 >
                    Comparador
                 </button>
            </div>

            {/* Content Area */}
            <div className="w-full h-full relative">
                {/* Map Layer - Always mounted to preserve state */}
                <div className={`absolute inset-0 transition-opacity duration-500 ${mode === 'map' ? 'opacity-100 z-0' : 'opacity-0 pointer-events-none'}`}>
                     <ConstellationMap />
                </div>

                {/* Comparator Layer */}
                {mode === 'comparator' && (
                     <div className="absolute inset-0 z-10 flex items-center justify-center pt-40 pb-10 px-4 md:px-10 animate-fade-in pointer-events-auto">
                        <div className="w-full h-full max-w-7xl mx-auto bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden ring-1 ring-white/5">
                            <VesselComparator />
                        </div>
                     </div>
                )}
            </div>

            {/* Background Effects (Overlay) */}
            <div className={`absolute inset-0 bg-radial-gradient from-transparent to-nautical-black/80 pointer-events-none z-[1] transition-opacity duration-500 ${mode === 'map' ? 'opacity-100' : 'opacity-0'}`} />
        </div>
    );
}
