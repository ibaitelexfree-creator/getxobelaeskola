'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import {
    Book, MapPin, Award, Ship, Waves, Wind,
    ChevronRight, Anchor, Calendar, Download
} from 'lucide-react';
import { apiUrl } from '@/lib/api';

// Direct dynamic import with explicit default handling
const LeafletMap = dynamic(
    () => import('./LeafletLogbookMap').then((mod) => mod.default),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-full bg-[#050b14] animate-pulse flex items-center justify-center text-blue-500/20">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                    <span className="text-[10px] uppercase tracking-widest">Cargando Mapa...</span>
                </div>
            </div>
        )
    }
);

export default function Logbook() {
    const [activeTab, setActiveTab] = useState<'official' | 'map' | 'skills' | 'diary'>('official');
    const [officialData, setOfficialData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedPoint, setSelectedPoint] = useState<any>(null);
    const params = useParams();

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            try {
                const res = await fetch(apiUrl('/api/academy/progress'));
                const data = await res.json();
                console.log('Logbook Data Loaded:', data);
                setOfficialData(data);
            } catch (error) {
                console.error('Error loading logbook:', error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent"></div>
                <p className="text-white/40 text-[10px] uppercase mt-6 tracking-[0.3em]">Sincronizando Bitácora...</p>
            </div>
        );
    }

    const sessions = officialData?.horas || [];

    return (
        <div className="w-full max-w-6xl mx-auto h-full flex flex-col font-display p-6 relative pb-20">
            {/* Header */}
            <header className="flex flex-col md:flex-row items-center justify-between mb-12 gap-8">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-accent rounded-3xl flex items-center justify-center shadow-xl shadow-accent/10">
                        <Book className="text-nautical-black w-10 h-10" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-display font-bold text-white italic">Bitácora Digital</h1>
                        <p className="text-white/40 text-sm mt-1">Historial del Navegante: {officialData?.user?.full_name}</p>
                    </div>
                </div>

                <div className="px-8 py-5 bg-white/5 border border-white/10 rounded-3xl text-center backdrop-blur-md">
                    <div className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Millas Totales</div>
                    <div className="text-4xl font-black text-white">
                        {((officialData?.estadisticas?.horas_totales || 0) * 5.2).toFixed(1)}
                    </div>
                </div>
            </header>

            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-3 mb-12">
                {[
                    { id: 'official', label: 'Oficial', icon: <Anchor size={14} /> },
                    { id: 'map', label: 'Mapa', icon: <MapPin size={14} /> },
                    { id: 'skills', label: 'Habilidades', icon: <Award size={14} /> },
                    { id: 'diary', label: 'Diario', icon: <Book size={14} /> }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all
                            ${activeTab === tab.id
                                ? 'bg-accent text-nautical-black shadow-lg shadow-accent/20 scale-105'
                                : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'
                            }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="flex-grow">
                {activeTab === 'official' && (
                    <div className="grid grid-cols-1 gap-6">
                        {sessions.length > 0 ? (
                            sessions.map((session: any) => (
                                <div key={session.id} className="group bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 rounded-3xl p-8 transition-all duration-500">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                                        <div className="flex items-center gap-8">
                                            <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-3xl">
                                                ⛵
                                            </div>
                                            <div>
                                                <div className="text-[10px] uppercase tracking-widest text-white/30 mb-1">
                                                    {new Date(session.fecha).toLocaleDateString()}
                                                </div>
                                                <h3 className="text-2xl font-bold text-white group-hover:text-accent transition-colors">
                                                    {session.tipo}
                                                </h3>
                                                <div className="flex items-center gap-4 text-sm text-white/40 mt-2">
                                                    <span className="flex items-center gap-1"><Ship size={14} /> {session.embarcacion}</span>
                                                    <span className="flex items-center gap-1"><Wind size={14} /> {session.duracion_h}h</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${session.verificado ? 'bg-green-500/20 border-green-500/30 text-green-400' : 'bg-amber-500/20 border-amber-500/30 text-amber-400'}`}>
                                                {session.verificado ? 'Verificado' : 'Pendiente'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
                                <p className="text-white/20 uppercase tracking-widest text-xs">Sin registros aún</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'map' && (
                    <div className="relative w-full aspect-video bg-[#050b14] rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
                        {/* We render the dynamic component only when on the map tab */}
                        <LeafletMap
                            sessions={sessions}
                            selectedPoint={selectedPoint}
                            setSelectedPoint={setSelectedPoint}
                        />

                        {/* Overlay to check if the wrapper renders */}
                        <div className="absolute top-4 left-4 z-[1000] pointer-events-none">
                            <div className="px-3 py-1 bg-black/50 backdrop-blur rounded text-[8px] text-white/50 uppercase tracking-widest">
                                Status: Safe Mode
                            </div>
                        </div>

                        {selectedPoint && (
                            <div className="absolute inset-y-6 right-6 w-80 bg-[#0a1628]/95 backdrop-blur-2xl border border-accent/30 rounded-3xl p-8 shadow-2xl z-[1000] overflow-hidden">
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
                                        <p className="text-white font-bold">{selectedPoint.zona_nombre || 'Navegación'}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <span className="text-[10px] uppercase tracking-widest text-white/40">Fecha</span>
                                        <p className="text-sm text-white">{new Date(selectedPoint.fecha).toLocaleDateString()}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-[10px] uppercase tracking-widest text-white/40 font-black">Navegado</span>
                                            <p className="text-lg font-black text-white">{selectedPoint.duracion_h} <span className="text-xs text-accent">h</span></p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'skills' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {(officialData?.habilidades || []).map((h: any) => (
                            <div key={h.habilidad.id} className="bg-white/5 p-8 rounded-3xl border border-white/10">
                                <div className="text-3xl mb-4">{h.habilidad.icono || '⚡'}</div>
                                <h3 className="text-xl font-bold mb-2">{h.habilidad.nombre_es}</h3>
                                <p className="text-sm text-white/40 leading-relaxed">{h.habilidad.descripcion_es}</p>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'diary' && (
                    <div className="py-20 text-center bg-white/5 rounded-3xl border border-white/10 italic text-white/20 font-serif">
                        Diario Personal - Próximamente
                    </div>
                )}
            </div>
        </div>
    );
}
