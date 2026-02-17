'use client';

import React, { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Compass, Shield, Navigation, Play, Square, Save, Trash2, AlertCircle, Cpu } from 'lucide-react';
import Link from 'next/link';
import { useSmartTracker } from '@/hooks/useSmartTracker';
import { apiUrl } from '@/lib/api';

// Dynamic import for the Map component
const LeafletMap = dynamic(() => import('./LeafletMap'), {
    ssr: false,
    loading: () => <div className="w-full h-full bg-blue-950/20 animate-pulse flex items-center justify-center text-blue-400/30">Cargando Mapa...</div>
});

interface NavigationExperienceMapProps {
    sessions: any[];
    locale: string;
}

export default function NavigationExperienceMap({ sessions, locale }: NavigationExperienceMapProps) {
    const {
        isTracking,
        isAutoTracking,
        points: livePoints,
        currentPosition,
        statusMessage,
        error: geoError,
        startTracking,
        stopTracking,
        clearPoints
    } = useSmartTracker();

    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Filter sessions with location
    const mappedSessions = useMemo(() => sessions.filter(s => s.ubicacion).slice(-10), [sessions]);

    const saveLiveTrack = async () => {
        if (livePoints.length < 2) return;
        setIsSaving(true);
        setSaveError(null);
        try {
            const formData = new FormData();
            const gpxContent = `<?xml version="1.0" encoding="UTF-8"?>
            <gpx version="1.1" creator="Getxo Sailing School">
                <trk><trkseg>
                    ${livePoints.map(p => `<trkpt lat="${p.lat}" lon="${p.lng}"><time>${new Date(p.timestamp).toISOString()}</time></trkpt>`).join('')}
                </trkseg></trk>
            </gpx>`;
            const blob = new Blob([gpxContent], { type: 'application/gpx+xml' });
            formData.append('file', blob, 'live_track.gpx');
            const latestSession = sessions[0];
            formData.append('sessionId', latestSession?.id || '');

            const response = await fetch(apiUrl('/api/logbook/upload-track'), {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            if (result.success) {
                clearPoints();
                window.location.reload();
            } else {
                setSaveError(result.error || 'Error al guardar el track');
            }
        } catch (err) {
            setSaveError('Error de red al guardar');
        } finally {
            setIsSaving(false);
        }
    };

    const center: [number, number] = [43.35, -3.01];

    if (!mounted) return null;

    return (
        <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-3xl -translate-y-1/2 translate-x-1/2" />

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-display italic text-white flex items-center gap-3">
                        <span className="text-accent drop-shadow-[0_0_8px_rgba(255,191,0,0.4)]">🗺️</span> Aguas Navegadas
                    </h2>
                    <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] mt-1">
                        Tu huella geográfica en tiempo real
                    </p>
                </div>
                <Link
                    href={`/${locale}/academy/logbook`}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded text-[10px] uppercase tracking-widest font-black text-accent hover:bg-accent hover:text-nautical-black transition-all"
                >
                    Ver Bitácora →
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
                <div className="lg:col-span-3 relative aspect-video bg-blue-950/20 rounded-xl border border-blue-500/20 overflow-hidden shadow-2xl group min-h-[400px]">

                    {/* Render the Dynamic Map */}
                    <LeafletMap
                        center={center}
                        mappedSessions={mappedSessions}
                        livePoints={livePoints}
                        currentPosition={currentPosition}
                    />

                    {/* HUD Overlay */}
                    <div className="absolute inset-0 pointer-events-none border border-inset border-white/5 z-[1000]" />
                    <div className="absolute bottom-4 left-4 flex flex-col gap-2 z-[1000]">
                        <div className="px-2 py-1 bg-blue-900/40 backdrop-blur-md border border-blue-500/30 rounded text-[9px] font-black text-blue-200 uppercase tracking-widest shadow-xl flex items-center gap-2">
                            <Cpu size={12} className={isTracking ? 'animate-spin' : ''} />
                            AI: {statusMessage}
                        </div>
                        {isTracking && (
                            <div className="px-2 py-1 bg-accent/20 border border-accent/40 rounded text-[9px] font-black text-accent uppercase tracking-widest shadow-xl flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${isAutoTracking ? 'bg-blue-400' : 'bg-red-500 animate-ping'}`} />
                                {isAutoTracking ? 'Modo Autónomo' : 'Grabando'}
                            </div>
                        )}
                    </div>

                    <div className="absolute top-4 right-4 flex gap-2 z-[1000]">
                        {!isTracking ? (
                            <button
                                onClick={() => startTracking(false)}
                                className="w-10 h-10 rounded-full bg-accent text-nautical-black flex items-center justify-center shadow-2xl hover:scale-110 transition-transform hover:bg-white"
                                title="Iniciar Grabación"
                            >
                                <Play size={16} fill="currentColor" />
                            </button>
                        ) : (
                            <button
                                onClick={() => stopTracking()}
                                className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
                                title="Detener Grabación"
                            >
                                <Square size={16} fill="currentColor" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <div className="p-6 bg-blue-600/10 border border-blue-500/20 rounded-2xl shadow-xl backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-6 font-display italic text-lg text-white">
                            <Compass className={`text-accent ${isTracking ? 'animate-spin-slow' : ''}`} size={24} />
                            Control de Travesía
                        </div>

                        {!isTracking ? (
                            <button
                                onClick={() => startTracking(false)}
                                className="w-full py-5 bg-accent text-nautical-black rounded-xl font-black uppercase tracking-[0.2em] text-sm shadow-[0_0_20px_rgba(255,191,0,0.3)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                            >
                                <Play fill="currentColor" size={20} />
                                Comenzar Navegación
                            </button>
                        ) : (
                            <button
                                onClick={() => stopTracking()}
                                className="w-full py-5 bg-red-600 text-white rounded-xl font-black uppercase tracking-[0.2em] text-sm shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                            >
                                <Square fill="currentColor" size={20} />
                                Finalizar Navegación
                            </button>
                        )}
                    </div>

                    {livePoints.length > 0 && !isTracking && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-6 bg-accent/10 border border-accent/30 rounded-2xl border-dashed"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-accent font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Navigation size={16} /> Sesión Capturada
                                </h4>
                                <span className="text-[10px] text-accent/60 font-mono">{livePoints.length} Waypoints</span>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={saveLiveTrack}
                                    disabled={isSaving}
                                    className="flex-1 py-3 bg-accent text-nautical-black text-xs font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-white transition-colors shadow-lg"
                                >
                                    {isSaving ? <span className="animate-spin text-lg">🌀</span> : <Save size={14} />}
                                    Sincronizar Bitácora
                                </button>
                                <button
                                    onClick={clearPoints}
                                    className="p-3 bg-white/5 border border-white/10 text-white/40 hover:text-red-400 rounded-xl hover:bg-red-500/10 transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                                <Shield size={24} />
                            </div>
                            <div>
                                <h4 className="text-white font-bold text-base">Zonas de Getxo</h4>
                                <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold">Abra Interior & Puerto Deportivo</p>
                            </div>
                        </div>
                        <p className="text-xs text-white/40 italic leading-relaxed">
                            "Has navegado la mayoría de las áreas del puerto. Prueba a alejarte hacia el rompeolas norte en tu siguiente sesión para desbloquear nuevas zonas."
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
