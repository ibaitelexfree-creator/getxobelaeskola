'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Map, Compass, Shield } from 'lucide-react';
import Link from 'next/link';

interface NavigationExperienceMapProps {
    sessions: any[];
    locale: string;
}

export default function NavigationExperienceMap({ sessions, locale }: NavigationExperienceMapProps) {
    // Filter sessions with location
    const mappedSessions = sessions.filter(s => s.ubicacion).slice(-5); // Last 5 sessions

    // Same projection as LogbookMap but for a smaller widget
    const minLat = 43.32;
    const maxLat = 43.40;
    const minLng = -3.10;
    const maxLng = -2.95;

    const getX = (lng: number) => ((lng - minLng) / (maxLng - minLng)) * 100;
    const getY = (lat: number) => 100 - ((lat - minLat) / (maxLat - minLat)) * 100;

    const costaPoints = [
        { lng: -3.10, lat: 43.36 },
        { lng: -3.08, lat: 43.35 },
        { lng: -3.05, lat: 43.34 },
        { lng: -3.02, lat: 43.33 },
        { lng: -3.01, lat: 43.34 },
        { lng: -3.01, lat: 43.35 },
        { lng: -3.01, lat: 43.37 },
        { lng: -3.00, lat: 43.38 },
        { lng: -2.97, lat: 43.39 },
        { lng: -2.95, lat: 43.40 },
    ];

    const coastalPath = `M ${costaPoints.map(p => `${getX(p.lng)},${getY(p.lat)}`).join(' L ')} L 100,0 L 100,100 L 0,100 Z`;

    return (
        <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-3xl -translate-y-1/2 translate-x-1/2" />

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-display italic text-white flex items-center gap-3">
                        <span className="text-accent drop-shadow-[0_0_8px_rgba(255,191,0,0.4)]">🗺️</span> Aguas Navegadas
                    </h2>
                    <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] mt-1">
                        Tu huella geográfica en el Abra
                    </p>
                </div>
                <Link
                    href={`/${locale}/academy/logbook`}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded text-[10px] uppercase tracking-widest font-black text-accent hover:bg-accent hover:text-nautical-black transition-all"
                >
                    Ver Bitácora →
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
                {/* Visual Widget */}
                <div className="lg:col-span-3 relative aspect-video bg-blue-950/20 rounded-xl border border-blue-500/20 overflow-hidden shadow-inner group">
                    <svg viewBox="0 0 100 100" className="w-full h-full preserve-3d">
                        <defs>
                            <pattern id="gridDashboard" width="10" height="10" patternUnits="userSpaceOnUse">
                                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.2" />
                            </pattern>
                        </defs>
                        <rect width="100" height="100" fill="url(#gridDashboard)" />

                        {/* Land */}
                        <path d={coastalPath} fill="#0a1628" stroke="rgba(14, 165, 233, 0.1)" strokeWidth="0.5" />

                        {/* Active Area Highlight */}
                        <circle cx={getX(-3.01)} cy={getY(43.34)} r="20" fill="rgba(251, 191, 36, 0.05)" className="animate-pulse" />

                        {/* Point Markers */}
                        {mappedSessions.map((s, i) => (
                            <g key={s.id}>
                                <motion.circle
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                    cx={getX(s.ubicacion.lng)}
                                    cy={getY(s.ubicacion.lat)}
                                    r="1.5"
                                    className="fill-accent shadow-[0_0_5px_rgba(var(--accent-rgb),0.5)]"
                                />
                                {s.track_log && (
                                    <motion.polyline
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: 1 }}
                                        points={s.track_log.map((p: any) => `${getX(p.lng)},${getY(p.lat)}`).join(' ')}
                                        fill="none"
                                        stroke="rgba(var(--accent-rgb), 0.3)"
                                        strokeWidth="0.5"
                                    />
                                )}
                            </g>
                        ))}
                    </svg>

                    {/* HUD Overlay */}
                    <div className="absolute inset-0 pointer-events-none border border-inset border-white/5" />
                    <div className="absolute bottom-3 left-3 flex items-center gap-2">
                        <div className="px-2 py-0.5 bg-accent/20 border border-accent/40 rounded text-[8px] font-black text-accent uppercase tracking-tighter shadow-lg">
                            Tracking Activo
                        </div>
                    </div>
                </div>

                {/* Stats Detail */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                            <Shield size={18} />
                        </div>
                        <div>
                            <h4 className="text-white font-bold text-sm">Zona Principal</h4>
                            <p className="text-white/40 text-[10px] uppercase tracking-widest">Abra de Bilbao (Areeta)</p>
                        </div>
                    </div>

                    <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] text-white/40 uppercase tracking-widest">Zonas Descubiertas</span>
                            <span className="text-xs font-black text-accent">3 / 8</span>
                        </div>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: '37.5%' }}
                                className="h-full bg-accent"
                            />
                        </div>
                    </div>

                    <p className="text-xs text-white/40 italic leading-relaxed">
                        "Has explorado el Abra interior y las inmediaciones de Punta Galea. Te faltan millas hacia el oeste para desbloquear el área de Zierbena."
                    </p>
                </div>
            </div>
        </section>
    );
}
