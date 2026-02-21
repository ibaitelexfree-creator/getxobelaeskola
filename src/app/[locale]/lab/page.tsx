'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import TideTable from '@/components/lab/TideTable';
import dynamic from 'next/dynamic';
import { addMinutes, format, startOfDay, getHours, getMinutes } from 'date-fns';
import { Play, Pause, RefreshCw, Info } from 'lucide-react';

// Dynamic import for map to avoid SSR issues
const CurrentMap = dynamic(() => import('@/components/lab/CurrentMap'), {
    ssr: false,
    loading: () => <div className="w-full h-full bg-[#0a1628] animate-pulse flex items-center justify-center text-white/20">Cargando Mapa...</div>
});

export default function LabPage() {
    const t = useTranslations('lab');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [simulationTime, setSimulationTime] = useState(new Date());
    const [isPlaying, setIsPlaying] = useState(false);

    // Reset simulation time when date changes
    useEffect(() => {
        const newTime = new Date(selectedDate);
        newTime.setHours(new Date().getHours()); // Keep current hour if possible, or reset to start?
        // Actually, let's just sync the day part of simulationTime to selectedDate
        const currentHours = simulationTime.getHours();
        const currentMinutes = simulationTime.getMinutes();
        newTime.setHours(currentHours, currentMinutes);
        setSimulationTime(newTime);
    }, [selectedDate]);

    // Animation loop
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPlaying) {
            interval = setInterval(() => {
                setSimulationTime(prev => addMinutes(prev, 15)); // Fast forward 15 min every tick
            }, 500); // 500ms real time = 15 min sim time
        }
        return () => clearInterval(interval);
    }, [isPlaying]);

    // Slider handler
    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const minutes = parseInt(e.target.value);
        const newTime = startOfDay(selectedDate);
        setSimulationTime(addMinutes(newTime, minutes));
    };

    const currentMinutesOfDay = getHours(simulationTime) * 60 + getMinutes(simulationTime);

    return (
        <main className="min-h-screen bg-[#050b14] text-white pt-24 pb-20 px-4 md:px-8">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-1 w-12 bg-blue-500 rounded-full" />
                        <span className="text-blue-400 font-bold tracking-widest uppercase text-xs">Simulación Interactiva</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-white max-w-2xl">
                        Mareas y Corrientes <span className="text-white/40">en el Abra</span>
                    </h1>
                    <p className="text-white/60 max-w-xl text-lg leading-relaxed">
                        Explora cómo el ciclo de mareas afecta a las corrientes en la costa vasca.
                        Visualiza en tiempo real el flujo y reflujo de la ría de Bilbao.
                    </p>
                    <div className="inline-block px-3 py-1 rounded border border-yellow-500/30 bg-yellow-500/10 text-yellow-500 text-xs font-mono">
                        ⚠ Datos Simulados (Modelo Armónico M2) - API Real no disponible
                    </div>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

                    {/* Left Column: Tide Table & Info */}
                    <div className="space-y-8">
                        <TideTable date={selectedDate} onDateChange={setSelectedDate} />

                        <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                <Info className="w-5 h-5 text-blue-400" />
                                ¿Cómo interpretar?
                            </h3>
                            <ul className="space-y-2 text-sm text-white/60 list-disc list-inside">
                                <li><strong className="text-white">Pleamar (High Tide):</strong> Momento de máxima altura. La corriente se detiene (Repunte).</li>
                                <li><strong className="text-white">Bajamar (Low Tide):</strong> Momento de mínima altura. La corriente se detiene (Repunte).</li>
                                <li><strong className="text-blue-400">Flujo (Flood):</strong> Marea subiendo. El agua entra hacia la ría (Corriente SE).</li>
                                <li><strong className="text-orange-400">Reflujo (Ebb):</strong> Marea bajando. El agua sale hacia el mar (Corriente NW).</li>
                            </ul>
                        </div>
                    </div>

                    {/* Right Column: Map Simulation */}
                    <div className="space-y-6">
                        <div className="h-[500px] w-full bg-black/40 rounded-2xl overflow-hidden border border-white/10 relative">
                            <CurrentMap date={simulationTime} />

                            {/* Time Display Overlay */}
                            <div className="absolute top-4 left-4 bg-black/80 backdrop-blur border border-white/10 px-4 py-2 rounded-lg z-[1000]">
                                <div className="text-[10px] text-white/40 uppercase tracking-widest">Hora Simulación</div>
                                <div className="text-2xl font-mono font-bold text-white">
                                    {format(simulationTime, 'HH:mm')}
                                </div>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-4">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-black uppercase tracking-widest text-white/40">Control de Tiempo</span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setIsPlaying(!isPlaying)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors ${isPlaying ? 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30' : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'}`}
                                    >
                                        {isPlaying ? <><Pause size={14} /> Pausar</> : <><Play size={14} /> Reproducir</>}
                                    </button>
                                    <button
                                        onClick={() => {
                                            const now = new Date();
                                            setSelectedDate(now);
                                            setSimulationTime(now);
                                            setIsPlaying(false);
                                        }}
                                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/60 transition-colors"
                                        title="Resetear a ahora"
                                    >
                                        <RefreshCw size={14} />
                                    </button>
                                </div>
                            </div>

                            <input
                                type="range"
                                min="0"
                                max="1439"
                                value={currentMinutesOfDay}
                                onChange={handleSliderChange}
                                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                            <div className="flex justify-between text-[10px] text-white/30 font-mono">
                                <span>00:00</span>
                                <span>06:00</span>
                                <span>12:00</span>
                                <span>18:00</span>
                                <span>23:59</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
