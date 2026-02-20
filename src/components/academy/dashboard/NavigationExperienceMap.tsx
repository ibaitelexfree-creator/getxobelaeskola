'use client';

import React, { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Compass, Shield, Navigation, Play, Square, Save, Trash2, Cpu, Waves } from 'lucide-react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useSmartTracker } from '@/hooks/useSmartTracker';
import { apiUrl } from '@/lib/api';

// Dynamic import for the Map component
const LeafletMap = dynamic(() => import('./LeafletMap'), {
    ssr: false,
    loading: () => <div className="w-full h-full bg-blue-950/20 animate-pulse flex items-center justify-center text-blue-400/30">Cargando Mapa...</div>
});

const JourneyCompletionModal = dynamic(() => import('../notifications/JourneyCompletionModal'), { ssr: false });

export default function NavigationExperienceMap({ sessions }: { sessions: any[] }) {
    const params = useParams();
    const locale = (params?.locale as string) || 'es';
    const {
        isTracking,
        isAutoTracking,
        points: livePoints,
        currentPosition,
        statusMessage,
        journeyEnded,
        startTracking,
        stopTracking,
        clearPoints,
        dismissJourneyEnd
    } = useSmartTracker();

    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

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
                    href={`/${locale}/academy/logbook?tab=map`}
                    prefetch={false}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded text-[10px] uppercase tracking-widest font-black text-accent hover:bg-accent hover:text-nautical-black transition-all inline-block"
                >
                    Ver Bitácora →
                </Link>
            </div>

            <div className="flex flex-col gap-8">
                {/* Map Container */}
                <div className="relative aspect-video lg:aspect-[21/9] bg-blue-950/20 rounded-2xl border border-blue-500/20 overflow-hidden shadow-2xl group min-h-[400px] w-full">

                    {/* Render the Dynamic Map */}
                    <LeafletMap
                        center={center}
                        mappedSessions={mappedSessions}
                        livePoints={livePoints}
                        currentPosition={currentPosition}
                    />

                    {/* HUD Overlay */}
                    <div className="absolute inset-0 pointer-events-none border border-inset border-white/5 z-[1000]" />

                    {/* Floating Map Controls */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2 z-[1000]">
                        <div className={`px-3 py-1.5 backdrop-blur-md border rounded-lg text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 transition-colors duration-300 ${statusMessage.includes('TIERRA')
                            ? 'bg-amber-600/60 border-amber-400 text-white animate-pulse'
                            : 'bg-blue-900/40 border-blue-500/30 text-blue-200'
                            }`}>
                            <Cpu size={14} className={isTracking ? 'animate-spin' : ''} />
                            AI: {statusMessage}
                        </div>
                    </div>

                    <div className="absolute bottom-4 left-4 flex flex-col gap-2 z-[1000]">
                        {isTracking && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="px-3 py-1.5 bg-accent/20 backdrop-blur-md border border-accent/40 rounded-lg text-xs font-black text-accent uppercase tracking-widest shadow-xl flex items-center gap-2"
                            >
                                <span className={`w-2 h-2 rounded-full ${isAutoTracking ? 'bg-blue-400' : 'bg-red-500 animate-ping'}`} />
                                {isAutoTracking ? 'Modo Autónomo' : 'Grabando Travesía'}
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Controls Area: Below the Map */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">

                    {/* Main Control Panel */}
                    <div className={`md:col-span-5 p-8 rounded-2xl shadow-xl backdrop-blur-md transition-all duration-500 flex flex-col justify-center ${isTracking
                        ? 'bg-red-600/10 border border-red-500/30 shadow-[0_0_30px_rgba(220,38,38,0.1)]'
                        : 'bg-blue-600/10 border border-blue-500/20 shadow-[0_0_30px_rgba(37,99,235,0.1)]'
                        }`}>
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4 font-display italic text-xl text-white">
                                <div className={`p-2 rounded-lg ${isTracking ? 'bg-red-500/20 text-red-400' : 'bg-accent/20 text-accent'}`}>
                                    <Compass className={isTracking ? 'animate-spin-slow' : ''} size={28} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-white font-bold">Control de Travesía</span>
                                    <span className="text-[10px] text-white/40 uppercase tracking-widest not-italic">Sistema de Posicionamiento Smart</span>
                                </div>
                            </div>
                        </div>

                        {!isTracking ? (
                            <button
                                onClick={() => startTracking(false)}
                                className="w-full py-6 bg-accent text-nautical-black rounded-xl font-black uppercase tracking-[0.2em] text-sm shadow-[0_0_25px_rgba(255,191,0,0.3)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 group"
                            >
                                <div className="w-10 h-10 bg-black/10 rounded-full flex items-center justify-center group-hover:bg-black/20 transition-colors">
                                    <Play fill="currentColor" size={18} className="ml-1" />
                                </div>
                                Comenzar Navegación
                            </button>
                        ) : (
                            <button
                                onClick={() => stopTracking()}
                                className="w-full py-6 bg-red-600 text-white rounded-xl font-black uppercase tracking-[0.2em] text-sm shadow-[0_0_25px_rgba(220,38,38,0.3)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 group"
                            >
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                                    <Square fill="currentColor" size={18} />
                                </div>
                                Finalizar Navegación
                            </button>
                        )}
                    </div>

                    {/* Stats & Sync Panel */}
                    <div className="md:col-span-7 flex flex-col gap-6">
                        {isTracking ? (
                            <div className="grid grid-cols-2 h-full gap-4">
                                <div className="p-6 bg-white/5 border border-white/10 rounded-2xl flex flex-col justify-center items-center text-center">
                                    <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Velocidad Actual</div>
                                    <div className="text-4xl font-black text-white">
                                        {(currentPosition?.speed ? (currentPosition.speed * 1.94384).toFixed(1) : '0.0')}
                                        <span className="text-xs text-accent ml-2 font-bold uppercase">kn</span>
                                    </div>
                                </div>
                                <div className="p-6 bg-white/5 border border-white/10 rounded-2xl flex flex-col justify-center items-center text-center">
                                    <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Puntos Capturados</div>
                                    <div className="text-4xl font-black text-white">
                                        {livePoints.length}
                                        <span className="text-xs text-blue-400 ml-2 font-bold uppercase">pts</span>
                                    </div>
                                </div>
                            </div>
                        ) : livePoints.length > 0 ? (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="h-full p-8 bg-accent/5 border border-accent/20 rounded-2xl border-dashed flex flex-col justify-between"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex flex-col gap-1">
                                        <h4 className="text-accent font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2">
                                            <Navigation size={18} /> Sesión Registrada
                                        </h4>
                                        <p className="text-white/40 text-[10px] uppercase tracking-widest">Lista para sincronizar con tu bitácora oficial</p>
                                    </div>
                                    <div className="px-3 py-1 bg-accent/20 rounded-full text-[10px] font-black text-accent uppercase tracking-tighter">
                                        {livePoints.length} Waypoints
                                    </div>
                                </div>

                                <div className="flex gap-4 mt-6">
                                    <button
                                        onClick={saveLiveTrack}
                                        disabled={isSaving}
                                        className="flex-[2] py-4 bg-accent text-nautical-black text-xs font-black uppercase tracking-[0.2em] rounded-xl flex items-center justify-center gap-3 disabled:opacity-50 hover:bg-white hover:shadow-[0_0_20px_rgba(255,191,0,0.4)] transition-all"
                                    >
                                        {isSaving ? <span className="animate-spin text-lg">🌀</span> : <Save size={18} />}
                                        Sincronizar Bitácora
                                    </button>
                                    <button
                                        onClick={clearPoints}
                                        className="flex-1 py-4 bg-white/5 border border-white/10 text-white/40 hover:text-red-400 rounded-xl hover:bg-red-500/10 transition-all flex items-center justify-center gap-2"
                                        title="Eliminar sesión"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                                {saveError && (
                                    <p className="text-red-400 text-[10px] mt-2 font-bold uppercase tracking-widest text-center">{saveError}</p>
                                )}
                            </motion.div>
                        ) : (
                            <div className="h-full p-8 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col items-center justify-center text-center">
                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-white/20 mb-4">
                                    <Waves size={32} />
                                </div>
                                <h4 className="text-white/40 font-bold text-xs uppercase tracking-[0.2em] mb-2">Preparado para Zarpar</h4>
                                <p className="text-white/[0.15] text-[10px] max-w-[200px] leading-relaxed uppercase tracking-widest">
                                    Inicia la navegación para grabar tu track GPS en tiempo real
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Logbook Prompt Modal */}
            <JourneyCompletionModal
                isOpen={journeyEnded}
                onClose={dismissJourneyEnd}
                onSaveSuccess={saveLiveTrack}
            />
        </section>
    );
}
