'use client';

import React, { useState } from 'react';
import ConstellationMap from '@/components/academy/navigation/ConstellationMap';
import HistoricalRegattas from '@/components/academy/exploration/HistoricalRegattas';
import { useTranslations } from 'next-intl';
import { Compass, Map as MapIcon } from 'lucide-react';

export default function ExplorationPage() {
    const t = useTranslations('academy');
    const [mode, setMode] = useState<'constellation' | 'regattas'>('constellation');

    return (
        <div className="w-full h-screen relative bg-[#000510] flex flex-col items-center justify-center overflow-hidden">

            {/* Mode Switcher */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 flex items-center bg-black/40 backdrop-blur-xl rounded-full p-1 border border-white/10 shadow-2xl">
                <button
                    onClick={() => setMode('constellation')}
                    className={`flex items-center gap-2 px-6 py-2 rounded-full text-xs uppercase tracking-widest transition-all duration-300 ${
                        mode === 'constellation'
                        ? 'bg-accent text-nautical-black font-bold shadow-[0_0_15px_rgba(251,191,36,0.3)]'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                >
                    <Compass size={14} strokeWidth={2.5} />
                    <span>Estelar</span>
                </button>
                <button
                    onClick={() => setMode('regattas')}
                    className={`flex items-center gap-2 px-6 py-2 rounded-full text-xs uppercase tracking-widest transition-all duration-300 ${
                        mode === 'regattas'
                        ? 'bg-accent text-nautical-black font-bold shadow-[0_0_15px_rgba(251,191,36,0.3)]'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                >
                    <MapIcon size={14} strokeWidth={2.5} />
                    <span>Regatas</span>
                </button>
            </div>

            {/* Content Area */}
            <div className="w-full h-full relative">
                {mode === 'constellation' ? (
                    <>
                        {/* Title Overlay for Constellation */}
                        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-10 text-center pointer-events-none transition-opacity duration-500 animate-fade-in-down">
                            <h1 className="text-3xl md:text-4xl font-display text-white italic tracking-wide drop-shadow-lg">
                                Mapa Estelar
                            </h1>
                            <p className="text-[10px] text-accent uppercase tracking-[0.4em] font-light mt-2 pl-2">
                                Navegación Libre
                            </p>
                        </div>

                        <ConstellationMap />

                        {/* Vignette Effect */}
                        <div className="absolute inset-0 bg-radial-gradient from-transparent to-nautical-black/80 pointer-events-none" />
                    </>
                ) : (
                    <HistoricalRegattas />
                )}
            </div>
        </div>
    );
}
