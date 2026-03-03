'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Anchor, Ship, Wind, Clock, Star, TrendingUp } from 'lucide-react';

interface BoatMasteryData {
    name: string;
    hours: string;
    sessions: number;
    level: string;
    progress: number;
    lastUsed: string;
}

interface BoatMasteryProps {
    data: BoatMasteryData[];
}

export default function BoatMastery({ data }: BoatMasteryProps) {
    const params = useParams();
    const locale = (params?.locale as string) || 'es';

    if (!data || data.length === 0) {
        return (
            <section className="space-y-6">
                <div>
                    <h2 className="text-xl font-display italic text-white flex items-center gap-3">
                        <span className="text-accent drop-shadow-[0_0_8px_rgba(255,191,0,0.4)]">⛵</span> Tu Flota
                    </h2>
                    <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] mt-1">
                        Maestría y experiencia por embarcación
                    </p>
                </div>
                <div className="bg-[#111827] border border-dashed border-white/10 rounded-2xl p-12 text-center">
                    <Ship className="w-12 h-12 text-white/10 mx-auto mb-4" />
                    <p className="text-white/40 text-sm italic mb-6">No has registrado sesiones de navegación aún.</p>
                    <Link
                        href={`/${locale}/academy/logbook`}
                        className="inline-flex items-center gap-2 px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] uppercase font-bold tracking-widest text-accent transition-all rounded-sm"
                    >
                        Registrar mi primera sesión
                    </Link>
                </div>
            </section>
        );
    }

    return (
        <section className="space-y-6">
            <div className="flex items-end justify-between">
                <div>
                    <h2 className="text-xl font-display italic text-white flex items-center gap-3">
                        <span className="text-accent drop-shadow-[0_0_8px_rgba(255,191,0,0.4)]">⛵</span> Tu Flota
                    </h2>
                    <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] mt-1">
                        Maestría y experiencia por embarcación
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.map((boat, index) => (
                    <motion.div
                        key={boat.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group relative bg-[#111827] hover:bg-[#1f2937] border border-white/5 rounded-2xl p-6 transition-all duration-500 overflow-hidden"
                    >
                        {/* Background Decoration */}
                        <div className="absolute -right-8 -bottom-8 text-white/[0.02] group-hover:text-accent/[0.05] transition-colors duration-700 -rotate-12">
                            <Ship size={120} />
                        </div>

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                                        <Anchor size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold group-hover:text-accent transition-colors">
                                            {boat.name}
                                        </h3>
                                        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/40">
                                            <span className={`px-2 py-0.5 rounded-full ${boat.level === 'Maestro' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                                                boat.level === 'Avanzado' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                                                    'bg-white/10 text-white/60'
                                                }`}>
                                                {boat.level}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xl font-black text-white">{boat.hours} <span className="text-[10px] text-accent">h</span></div>
                                    <div className="text-[9px] uppercase tracking-widest text-white/40">{boat.sessions} Sesiones</div>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-[9px] uppercase tracking-widest">
                                    <span className="text-white/40">Experiencia</span>
                                    <span className="text-accent font-bold">{boat.progress}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${boat.progress}%` }}
                                        transition={{ duration: 1, delay: 0.5 + (index * 0.1) }}
                                        className={`h-full rounded-full ${boat.level === 'Maestro' ? 'bg-gradient-to-r from-yellow-600 to-yellow-400' :
                                            boat.level === 'Avanzado' ? 'bg-gradient-to-r from-blue-600 to-blue-400' :
                                                'bg-gradient-to-r from-white/20 to-white/40'
                                            }`}
                                    />
                                </div>
                            </div>

                            {/* Footer Info */}
                            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-[10px] text-white/40 italic">
                                    <Clock size={10} />
                                    Última vez: {new Date(boat.lastUsed).toLocaleDateString('es-ES')}
                                </div>
                                <Link
                                    href={`/${locale}/academy/logbook`}
                                    className="flex items-center gap-1 text-[10px] text-accent opacity-0 group-hover:opacity-100 transition-opacity hover:underline"
                                >
                                    <TrendingUp size={10} />
                                    Ver bitácora
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>

    );
}
