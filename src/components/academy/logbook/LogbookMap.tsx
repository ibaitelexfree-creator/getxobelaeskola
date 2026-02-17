'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Info, Anchor, Waves, Wind, Navigation } from 'lucide-react';

// Dynamic Leaflet Imports
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Polyline = dynamic(() => import('react-leaflet').then(mod => mod.Polyline), { ssr: false });
const CircleMarker = dynamic(() => import('react-leaflet').then(mod => mod.CircleMarker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

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
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Filter sessions with location data
    const pointsWithLocation = sessions.filter(s => s.ubicacion);

    if (!mounted) return (
        <div className="w-full aspect-[5/4] bg-[#050b14] rounded-3xl border border-white/10 flex items-center justify-center">
            <div className="animate-pulse text-blue-500/20">Cargando Carta de Navegación...</div>
        </div>
    );

    return (
        <div className="relative w-full aspect-[5/4] bg-[#050b14] rounded-3xl border border-white/10 overflow-hidden shadow-2xl group/map">

            <MapContainer
                center={[43.35, -3.01]}
                zoom={13}
                style={{ height: '100%', width: '100%', background: '#050b14' }}
                zoomControl={false}
                attributionControl={false}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                {/* Tracks */}
                {sessions.filter(s => s.track_log && Array.isArray(s.track_log)).map((session) => (
                    <Polyline
                        key={`track-${session.id}`}
                        positions={session.track_log!.map((p: any) => [p.lat, p.lng])}
                        pathOptions={{
                            color: selectedPoint?.id === session.id ? "#fbbf24" : "#0ea5e9",
                            weight: selectedPoint?.id === session.id ? 4 : 2,
                            opacity: selectedPoint?.id === session.id ? 1 : 0.6
                        }}
                        eventHandlers={{
                            click: () => setSelectedPoint(session)
                        }}
                    />
                ))}

                {/* Markers */}
                {pointsWithLocation.map((point) => (
                    <CircleMarker
                        key={point.id}
                        center={[point.ubicacion!.lat, point.ubicacion!.lng]}
                        radius={selectedPoint?.id === point.id ? 8 : 5}
                        pathOptions={{
                            fillColor: selectedPoint?.id === point.id ? '#fbbf24' : '#0ea5e9',
                            color: 'white',
                            weight: 1,
                            fillOpacity: 0.8
                        }}
                        eventHandlers={{
                            click: () => setSelectedPoint(point)
                        }}
                    >
                        <Popup>
                            <div className="text-[10px] text-nautical-black font-bold uppercase">
                                {point.zona_nombre}
                            </div>
                        </Popup>
                    </CircleMarker>
                ))}
            </MapContainer>

            {/* Instruction Overlay */}
            <div className="absolute top-6 left-6 flex flex-col gap-2 z-[1000]">
                <div className="p-3 bg-blue-950/80 backdrop-blur-md rounded-xl border border-blue-500/30 text-white/80 text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-xl">
                    <MapPin size={12} className="text-accent" />
                    Bitácora Geográfica "Getxo-Abra"
                </div>
                <div className="p-2 bg-black/40 backdrop-blur-sm rounded-lg border border-white/5 text-white/30 text-[8px] uppercase tracking-widest">
                    Haz clic en un track o waypoint para ver el log
                </div>
            </div>

            {/* Session Detail Panel */}
            <AnimatePresence>
                {selectedPoint && (
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        className="absolute inset-y-6 right-6 w-80 bg-[#0a1628]/95 backdrop-blur-2xl border border-accent/30 rounded-3xl p-8 shadow-2xl z-[1000] overflow-hidden"
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
                                <h4 className="text-accent font-black uppercase text-[10px] tracking-widest">Travesía</h4>
                                <p className="text-white font-bold">{selectedPoint.zona_nombre}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <span className="text-[10px] uppercase tracking-widest text-white/40">Fecha</span>
                                <p className="text-sm text-white">
                                    {new Date(selectedPoint.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-[10px] uppercase tracking-widest text-white/40 font-black">Navegado</span>
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
                            Registro verificado
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
