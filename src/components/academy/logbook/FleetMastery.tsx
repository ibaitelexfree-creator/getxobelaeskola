'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Ship, Award, TrendingUp, Info } from 'lucide-react';

interface BoatStats {
    name: string;
    hours: number;
    level: string;
    progress: number;
}

interface FleetMasteryProps {
    mastery: BoatStats[];
}

export default function FleetMastery({ mastery }: FleetMasteryProps) {
    if (!mastery || mastery.length === 0) {
        return (
            <div className="py-20 text-center bg-white/5 border-2 border-dashed border-white/10 rounded-3xl">
                <div className="text-5xl mb-6 opacity-20">🛥️</div>
                <h3 className="text-xl font-bold text-white mb-2">Flota por descubrir</h3>
                <p className="text-white/40 max-w-xs mx-auto text-sm">Registra tus horas en diferentes embarcaciones para ver tu nivel de maestría aquí.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mastery.map((boat, index) => (
                <motion.div
                    key={boat.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group relative bg-white/5 border border-white/10 p-8 rounded-3xl hover:border-accent/40 transition-all duration-500 overflow-hidden"
                >
                    {/* Background Glow */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent/5 rounded-full blur-3xl group-hover:bg-accent/10 transition-colors duration-700" />

                    <div className="flex justify-between items-start mb-6">
                        <div className="w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shadow-lg shadow-accent/5 border border-accent/20">
                            <Ship className="text-accent" size={32} />
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] uppercase tracking-widest text-white/40 border-b border-white/5 pb-1 mb-1">Horas Totales</div>
                            <div className="text-2xl font-black text-white">{boat.hours} <span className="text-xs text-accent">h</span></div>
                        </div>
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-accent transition-colors">{boat.name}</h3>
                    <div className="flex items-center gap-2 mb-6">
                        <Award size={14} className="text-accent" />
                        <span className="text-[10px] uppercase tracking-[0.2em] font-black text-accent">{boat.level}</span>
                    </div>

                    {/* Progress Bar Container */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-end">
                            <span className="text-[10px] uppercase tracking-widest text-white/20">Progreso de Maestría</span>
                            <span className="text-xs font-black text-white/40">{boat.progress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden border border-white/5">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${boat.progress}%` }}
                                transition={{ duration: 1, ease: "easeOut", delay: index * 0.1 + 0.5 }}
                                className="h-full bg-gradient-to-r from-accent/50 to-accent shadow-[0_0_10px_rgba(var(--accent-rgb),0.5)]"
                            />
                        </div>
                    </div>

                    {/* Next Goal Hint */}
                    <div className="mt-6 flex items-center gap-2 text-[8px] uppercase tracking-widest text-white/20">
                        <TrendingUp size={10} />
                        {boat.level === 'Maestro' ? 'Nivel Máximo Alcanzado' : `Próximo Rango: ${boat.level === 'Iniciado' ? 'Avanzado' : 'Maestro'}`}
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
