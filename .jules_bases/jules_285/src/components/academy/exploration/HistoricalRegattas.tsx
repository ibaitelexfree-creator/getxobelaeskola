'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { HISTORICAL_REGATTAS, Regatta } from '@/data/academy/historicalRegattas';
import { Play, Pause, SkipBack, SkipForward, Wind, Thermometer, Waves, Info, List, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Dynamically import map to avoid SSR issues with Leaflet
const RegattaMap = dynamic(() => import('./RegattaMap'), {
    ssr: false,
    loading: () => <div className="w-full h-full bg-[#000510] flex items-center justify-center text-white/50">Cargando Mapa...</div>
});

export default function HistoricalRegattas() {
    const [selectedRegatta, setSelectedRegatta] = useState<Regatta>(HISTORICAL_REGATTAS[0]);
    const [currentStep, setCurrentStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false);
    const playbackIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Reset step when regatta changes
    useEffect(() => {
        setCurrentStep(0);
        setIsPlaying(false);
        setShowSidebar(false); // Close sidebar on selection on mobile
    }, [selectedRegatta]);

    // Playback logic
    useEffect(() => {
        if (isPlaying) {
            playbackIntervalRef.current = setInterval(() => {
                setCurrentStep(prev => {
                    if (prev >= selectedRegatta.route.length - 1) {
                        setIsPlaying(false);
                        return prev;
                    }
                    return prev + 1;
                });
            }, 500); // 500ms per step
        } else {
            if (playbackIntervalRef.current) {
                clearInterval(playbackIntervalRef.current);
            }
        }

        return () => {
            if (playbackIntervalRef.current) {
                clearInterval(playbackIntervalRef.current);
            }
        };
    }, [isPlaying, selectedRegatta]);

    const handleNext = () => {
        if (currentStep < selectedRegatta.route.length - 1) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const currentWeather = selectedRegatta.weatherConditions[
        Math.min(currentStep, selectedRegatta.weatherConditions.length - 1)
    ];

    return (
        <div className="flex h-full w-full bg-[#000510] relative overflow-hidden font-sans">
            {/* Sidebar / List */}
            <div
                className={`absolute inset-y-0 left-0 z-30 w-80 bg-[#000510]/95 backdrop-blur-xl border-r border-white/10 flex flex-col transition-transform duration-300 md:relative md:translate-x-0 ${showSidebar ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-display text-white italic">Regatas Históricas</h2>
                        <p className="text-xs text-white/50 mt-1">Selecciona una travesía</p>
                    </div>
                    <button onClick={() => setShowSidebar(false)} className="md:hidden text-white/70 hover:text-white">
                        <X size={20} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {HISTORICAL_REGATTAS.map(regatta => (
                        <button
                            key={regatta.id}
                            onClick={() => setSelectedRegatta(regatta)}
                            className={`w-full text-left p-4 border-b border-white/5 hover:bg-white/5 transition-colors group ${selectedRegatta.id === regatta.id ? 'bg-white/10 border-l-4 border-l-accent' : 'border-l-4 border-l-transparent'}`}
                        >
                            <h3 className={`font-bold text-sm ${selectedRegatta.id === regatta.id ? 'text-accent' : 'text-white group-hover:text-accent'}`}>
                                {regatta.name}
                            </h3>
                            <p className="text-xs text-white/50 truncate mt-1">{regatta.boatStats.type}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Area */}
            <div className="flex-1 relative flex flex-col h-full overflow-hidden">

                {/* Mobile Sidebar Toggle */}
                <button
                    onClick={() => setShowSidebar(true)}
                    className="absolute top-4 left-4 z-20 md:hidden bg-black/50 text-white p-2 rounded backdrop-blur-md border border-white/10"
                >
                    <List size={20} />
                </button>

                {/* Map */}
                <div className="flex-1 relative z-0">
                    <RegattaMap route={selectedRegatta.route} currentStep={currentStep} />
                </div>

                {/* Overlays */}
                {/* Regatta Info Header (Floating) */}
                <div className="absolute top-16 md:top-6 left-4 right-4 md:left-8 md:right-auto md:w-96 bg-black/80 backdrop-blur-md border border-white/10 p-5 rounded-xl z-10 pointer-events-none md:pointer-events-auto shadow-2xl">
                    <h2 className="text-2xl font-display text-accent mb-2">{selectedRegatta.name}</h2>
                    <p className="text-sm text-white/80 leading-relaxed mb-4 line-clamp-3">{selectedRegatta.description}</p>

                    <div className="grid grid-cols-2 gap-3 text-xs text-white/60 bg-white/5 p-3 rounded-lg border border-white/5">
                        <div>
                            <span className="block uppercase tracking-wider text-[10px] text-white/40 mb-1">Barco</span>
                            <span className="text-white font-medium">{selectedRegatta.boatStats.type}</span>
                        </div>
                        <div>
                            <span className="block uppercase tracking-wider text-[10px] text-white/40 mb-1">Eslora</span>
                            <span className="text-white font-medium">{selectedRegatta.boatStats.length}m</span>
                        </div>
                        <div>
                            <span className="block uppercase tracking-wider text-[10px] text-white/40 mb-1">Tripulación</span>
                            <span className="text-white font-medium">{selectedRegatta.boatStats.crew} pax</span>
                        </div>
                        <div>
                            <span className="block uppercase tracking-wider text-[10px] text-white/40 mb-1">Récord</span>
                            <span className="text-white font-medium">{selectedRegatta.boatStats.speedRecord} kn</span>
                        </div>
                    </div>
                </div>

                {/* Weather & Controls (Bottom) */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent pt-12 pb-6 px-6 z-10 flex flex-col md:flex-row items-end md:items-center justify-between gap-6 pointer-events-none">

                    {/* Weather Stats */}
                    <div className="pointer-events-auto flex items-center gap-6 text-white/90 bg-black/60 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 shadow-lg">
                        <div className="flex items-center gap-3">
                            <Wind size={18} className="text-accent" />
                            <div>
                                <span className="text-[10px] uppercase tracking-wider text-white/50 block">Viento</span>
                                <span className="font-mono text-sm font-bold">{currentWeather?.windSpeed} kn</span>
                            </div>
                        </div>
                        <div className="w-px h-8 bg-white/10"></div>
                        <div className="flex items-center gap-3">
                            <Waves size={18} className="text-blue-400" />
                            <div>
                                <span className="text-[10px] uppercase tracking-wider text-white/50 block">Olas</span>
                                <span className="font-mono text-sm font-bold">{currentWeather?.waveHeight} m</span>
                            </div>
                        </div>
                        <div className="hidden md:block w-px h-8 bg-white/10"></div>
                        <div className="hidden md:flex items-center gap-3">
                            <Thermometer size={18} className="text-orange-400" />
                            <div>
                                <span className="text-[10px] uppercase tracking-wider text-white/50 block">Temp</span>
                                <span className="font-mono text-sm font-bold">{currentWeather?.temperature}°C</span>
                            </div>
                        </div>
                    </div>

                    {/* Playback Controls */}
                    <div className="pointer-events-auto flex items-center gap-4">
                        {/* Progress Bar (Mobile only, shown above controls?) - No, let's keep it consistent */}

                        <div className="flex items-center gap-2 bg-accent text-nautical-black px-2 py-2 rounded-full shadow-lg shadow-accent/20">
                             <button
                                onClick={handlePrev}
                                className="p-2 hover:bg-black/10 rounded-full transition-colors disabled:opacity-50"
                                disabled={currentStep === 0}
                            >
                                <SkipBack size={20} fill="currentColor" />
                            </button>

                            <button
                                onClick={() => setIsPlaying(!isPlaying)}
                                className="p-3 bg-[#000510] text-white rounded-full hover:bg-black/80 transition-colors mx-1 shadow-inner"
                            >
                                {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
                            </button>

                            <button
                                onClick={handleNext}
                                className="p-2 hover:bg-black/10 rounded-full transition-colors disabled:opacity-50"
                                disabled={currentStep >= selectedRegatta.route.length - 1}
                            >
                                <SkipForward size={20} fill="currentColor" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Global Progress Bar */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10 z-20">
                     <div
                        className="h-full bg-accent transition-all duration-300 ease-linear shadow-[0_0_10px_rgba(251,191,36,0.5)]"
                        style={{ width: `${(currentStep / (selectedRegatta.route.length - 1)) * 100}%` }}
                     />
                </div>
            </div>
        </div>
    );
}
