'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Info, Anchor, Waves, Wind } from 'lucide-react';

interface NavigationPoint {
    id: string;
    fecha: string;
    zona_nombre: string;
    ubicacion?: { lat: number, lng: number };
    tipo: string;
    duracion_h: number;
    track_log?: { lat: number, lng: number }[];
}

interface LogbookMapProps {
    sessions: NavigationPoint[];
}

export default function LogbookMap({ sessions }: LogbookMapProps) {
    const [selectedPoint, setSelectedPoint] = useState<NavigationPoint | null>(null);

    // Filter sessions with location data
    const pointsWithLocation = sessions.filter(s => s.ubicacion);

    // Map bounds (approximate for Getxo/Abra area)
    const minLat = 43.32;
    const maxLat = 43.40;
    const minLng = -3.10;
    const maxLng = -2.95;

    const getX = (lng: number) => {
        return ((lng - minLng) / (maxLng - minLng)) * 1000;
    };

    const getY = (lat: number) => {
        return 800 - ((lat - minLat) / (maxLat - minLat)) * 800;
    };

    // Realistic Coastal Path (Simplified points for Getxo, Portugalete, Zierbena)
    const costaPoints = [
        { lng: -3.10, lat: 43.36 }, // Zierbena West
        { lng: -3.08, lat: 43.35 }, // Zierbena
        { lng: -3.05, lat: 43.34 }, // Santurtzi
        { lng: -3.02, lat: 43.33 }, // Portugalete/Ria
        { lng: -3.01, lat: 43.34 }, // Areeta / Getxo
        { lng: -3.01, lat: 43.35 }, // Puerto Getxo
        { lng: -3.01, lat: 43.37 }, // Punta Galea
        { lng: -3.00, lat: 43.38 }, // Azkorri
        { lng: -2.97, lat: 43.39 }, // Sopelana
        { lng: -2.95, lat: 43.40 }, // North East
    ];

    const coastalPath = `M ${costaPoints.map(p => `${getX(p.lng)},${getY(p.lat)}`).join(' L ')} L 1000,0 L 1000,800 L 0,800 Z`;

    return (
        <div className="relative w-full aspect-[5/4] bg-[#050b14] rounded-3xl border border-white/10 overflow-hidden shadow-2xl group/map">
            {/* Map Background (Styled SVG) */}
            <svg viewBox="0 0 1000 800" className="w-full h-full">
                <defs>
                    <radialGradient id="waterHighlight" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.08" />
                        <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
                    </radialGradient>
                    <filter id="trackGlow">
                        <feGaussianBlur stdDeviation="2" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    <pattern id="gridPattern" width="100" height="100" patternUnits="userSpaceOnUse">
                        <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                    </pattern>
                </defs>

                {/* Grid */}
                <rect width="1000" height="800" fill="url(#gridPattern)" />

                {/* Sea Floor / Bathymetry Lines (Simplified) */}
                <path d="M0,400 Q300,450 600,300 T1000,100" fill="none" stroke="rgba(14, 165, 233, 0.05)" strokeWidth="1" />
                <path d="M0,500 Q300,550 600,400 T1000,200" fill="none" stroke="rgba(14, 165, 233, 0.03)" strokeWidth="1" />

                {/* Land Mass */}
                <path
                    d={coastalPath}
                    fill="#0a1628"
                    stroke="rgba(14, 165, 233, 0.1)"
                    strokeWidth="1"
                />

                {/* Coastal Detail Line (Sand/Shallow) */}
                <polyline
                    points={costaPoints.map(p => `${getX(p.lng)},${getY(p.lat)}`).join(' ')}
                    fill="none"
                    stroke="rgba(255, 191, 0, 0.1)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Compass Rose Decoration */}
                <g transform="translate(150, 150) scale(0.8)" className="opacity-10 pointer-events-none">
                    <circle r="80" fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="2,4" />
                    <path d="M0,-100 L10,0 L0,10 L-10,0 Z" fill="white" />
                    <path d="M100,0 L0,10 L-10,0 L0,-10 Z" fill="white" transform="rotate(90)" />
                    <text y="-110" textAnchor="middle" fill="white" className="text-[12px] font-black">N</text>
                </g>

                {/* Tracks (Polylines) */}
                {sessions.filter(s => s.track_log && Array.isArray(s.track_log)).map((session) => (
                    <motion.polyline
                        key={`track-${session.id}`}
                        points={session.track_log!.map((p: any) => `${getX(p.lng)},${getY(p.lat)}`).join(' ')}
                        fill="none"
                        stroke={selectedPoint?.id === session.id ? "#fbbf24" : "rgba(14, 165, 233, 0.6)"}
                        strokeWidth={selectedPoint?.id === session.id ? "3" : "1.5"}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        filter="url(#trackGlow)"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        className="transition-all duration-500"
                    />
                ))}

                {/* Session Markers (Interactive) */}
                {pointsWithLocation.map((point) => (
                    <g
                        key={point.id}
                        className="cursor-pointer group/marker"
                        onClick={() => setSelectedPoint(point)}
                    >
                        <motion.circle
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            cx={getX(point.ubicacion!.lng)}
                            cy={getY(point.ubicacion!.lat)}
                            r={selectedPoint?.id === point.id ? "8" : "5"}
                            className={`${selectedPoint?.id === point.id ? 'fill-accent' : 'fill-blue-500'} shadow-lg transition-all`}
                        />
                        <circle
                            cx={getX(point.ubicacion!.lng)}
                            cy={getY(point.ubicacion!.lat)}
                            r="15"
                            className={`fill-accent/10 ${selectedPoint?.id === point.id ? 'opacity-100 scale-125' : 'opacity-0'} group-hover/marker:opacity-40 transition-all animate-pulse`}
                        />
                    </g>
                ))}

                {/* Labels */}
                <text x={getX(-3.02)} y={getY(43.34)} className="fill-white/20 text-[10px] uppercase font-black tracking-widest pointer-events-none">Bizkaia Bridge</text>
                <text x={getX(-3.08)} y={getY(43.36)} className="fill-white/20 text-[10px] uppercase font-black tracking-widest pointer-events-none">Zierbena</text>
                <text x={getX(-3.01)} y={getY(43.37)} className="fill-white/20 text-[10px] uppercase font-black tracking-widest pointer-events-none">Punta Galea</text>
                <text x={getX(-3.05)} y={getY(43.37)} className="fill-blue-400/20 text-[12px] uppercase font-black italic tracking-[0.3em] pointer-events-none">Abra de Bilbao</text>
            </svg>

            {/* Instruction Overlay */}
            <div className="absolute top-6 left-6 flex flex-col gap-2">
                <div className="p-3 bg-blue-950/80 backdrop-blur-md rounded-xl border border-blue-500/30 text-white/80 text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-xl">
                    <MapPin size={12} className="text-accent" />
                    Carta de Navegación "Getxo-Abra"
                </div>
                <div className="p-2 bg-black/40 backdrop-blur-sm rounded-lg border border-white/5 text-white/30 text-[8px] uppercase tracking-widest">
                    Selecciona un waypoint para ver el track log
                </div>
            </div>

            {/* Session Detail Panel (Right Sidebar) */}
            <AnimatePresence>
                {selectedPoint && (
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        className="absolute inset-y-6 right-6 w-80 bg-[#0a1628]/95 backdrop-blur-2xl border border-accent/30 rounded-3xl p-8 shadow-2xl z-50 overflow-hidden"
                    >
                        <div className="absolute -top-12 -right-12 w-32 h-32 bg-accent/10 blur-3xl rounded-full" />
                        <button
                            onClick={() => setSelectedPoint(null)}
                            className="absolute top-4 right-4 text-white/20 hover:text-white"
                        >
                            ✕
                        </button>

                        <div className="flex items-center gap-3 mb-4 border-b border-white/5 pb-4">
                            <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center text-accent">
                                <Anchor size={20} />
                            </div>
                            <div>
                                <h4 className="text-accent font-black uppercase text-[10px] tracking-widest">Zona Registrada</h4>
                                <p className="text-white font-bold">{selectedPoint.zona_nombre}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <span className="text-[10px] uppercase tracking-widest text-white/40">Fecha de Travesía</span>
                                <p className="text-sm text-white">
                                    {new Date(selectedPoint.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-[10px] uppercase tracking-widest text-white/40 font-black">Duración</span>
                                    <p className="text-lg font-black text-white">{selectedPoint.duracion_h} <span className="text-xs text-accent">h</span></p>
                                </div>
                                <div>
                                    <span className="text-[10px] uppercase tracking-widest text-white/40 font-black">Tipo</span>
                                    <p className="text-sm text-white capitalize">{selectedPoint.tipo}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2 text-[8px] uppercase tracking-[0.2em] text-accent font-black animate-pulse">
                            <Waves size={10} />
                            Zona Conquistada
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Empty State / Hints */}
            {pointsWithLocation.length === 0 && (
                <div className="absolute inset-x-0 bottom-12 text-center flex flex-col items-center">
                    <p className="text-white/20 text-xs uppercase tracking-widest max-w-xs">
                        Tus próximas travesías aparecerán aquí marcando tu avance por la costa.
                    </p>
                </div>
            )}
        </div>
    );
}
