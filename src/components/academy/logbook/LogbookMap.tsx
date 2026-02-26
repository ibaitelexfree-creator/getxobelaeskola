<<<<<<< HEAD
'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Anchor, Waves } from 'lucide-react';
import { NavigationPoint } from '@/types/navigation';

const LeafletLogbookMap = dynamic(() => import('./LeafletLogbookMap'), {
    ssr: false,
    loading: () => <div className="w-full h-full bg-[#050b14] animate-pulse flex items-center justify-center text-blue-500/20">Cargando Carta de Navegación...</div>
});

interface LogbookMapProps {
    sessions: NavigationPoint[];
}

export default function LogbookMap({ sessions }: LogbookMapProps) {
    const [selectedPoint, setSelectedPoint] = useState<NavigationPoint | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return (
        <div className="w-full aspect-[5/4] bg-[#050b14] rounded-3xl border border-white/10 flex items-center justify-center">
            <div className="animate-pulse text-blue-500/20">Cargando Bitácora...</div>
        </div>
    );

    return (
        <div className="relative w-full aspect-[5/4] bg-[#050b14] rounded-3xl border border-white/10 overflow-hidden shadow-2xl group/map">
            <LeafletLogbookMap
                sessions={sessions ?? []}
                selectedPoint={selectedPoint}
                setSelectedPoint={setSelectedPoint}
            />

            {/* Session Detail Panel (Simple version for stability) */}
            {selectedPoint && (
                <div
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

                    <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2 text-[8px] uppercase tracking-[0.2em] text-accent font-black">
                        <Waves size={10} />
                        Registro verificado
                    </div>
                </div>
            )}
        </div>
    );
}
=======
'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Anchor, Waves } from 'lucide-react';

const LeafletLogbookMap = dynamic(() => import('./LeafletLogbookMap'), {
    ssr: false,
    loading: () => <div className="w-full h-full bg-[#050b14] animate-pulse flex items-center justify-center text-blue-500/20">Cargando Carta de Navegación...</div>
});

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

    if (!mounted) return (
        <div className="w-full aspect-[5/4] bg-[#050b14] rounded-3xl border border-white/10 flex items-center justify-center">
            <div className="animate-pulse text-blue-500/20">Cargando Bitácora...</div>
        </div>
    );

    return (
        <div className="relative w-full aspect-[5/4] bg-[#050b14] rounded-3xl border border-white/10 overflow-hidden shadow-2xl group/map">
            <LeafletLogbookMap
                sessions={sessions ?? []}
                selectedPoint={selectedPoint}
                setSelectedPoint={setSelectedPoint}
            />

            {/* Session Detail Panel (Simple version for stability) */}
            {selectedPoint && (
                <div
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

                    <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2 text-[8px] uppercase tracking-[0.2em] text-accent font-black">
                        <Waves size={10} />
                        Registro verificado
                    </div>
                </div>
            )}
        </div>
    );
}
>>>>>>> pr-286
