'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
    Book, Edit3, Save, Calendar, Wind, Compass,
    Award, Plus, Trash2, Anchor, Star,
    Download, CheckCircle2, ChevronRight, Activity,
    Ship, Waves
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import CertificateCard from '@/components/academy/CertificateCard';
import { generateLogbookReportPDF } from '@/lib/logbook/pdfReportGenerator';
import LogbookMap from './LogbookMap';
import FleetMastery from './FleetMastery';
import { apiUrl } from '@/lib/api';

interface LogEntry {
    id: string;
    fecha: string;
    contenido: string;
    estado_animo: 'confident' | 'challenging' | 'discovery';
    tags: string[];
}

interface NauticalSession {
    id: string;
    fecha: string;
    tipo: string;
    duracion_h: number;
    embarcacion: string;
    condiciones_meteo: string;
    notas: string;
    verificado: boolean;
    track_log?: any[];
}

export default function Logbook() {
    const t = useTranslations('academy');
    const params = useParams();
    const locale = (params?.locale as string) || 'es';
    const [activeTab, setActiveTab] = useState<'official' | 'diary' | 'skills' | 'map' | 'fleet'>('official');
    const [diaryEntries, setDiaryEntries] = useState<LogEntry[]>([]);
    const [isWriting, setIsWriting] = useState(false);
    const [newNote, setNewNote] = useState('');
    const [selectedMood, setSelectedMood] = useState<LogEntry['estado_animo']>('discovery');
    const [officialData, setOfficialData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const tab = params.get('tab');
            if (tab && ['official', 'diary', 'skills', 'map', 'fleet'].includes(tab)) {
                setActiveTab(tab as any);
            }
        }
    }, []);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const resProgress = await fetch(apiUrl('/api/academy/progress'));
                const dataProgress = await resProgress.json();
                console.log('Official Data:', dataProgress);
                setOfficialData(dataProgress);

                const resDiary = await fetch(apiUrl('/api/logbook/diary'));
                const dataDiary = await resDiary.json();
                if (Array.isArray(dataDiary)) {
                    setDiaryEntries(dataDiary);
                }
            } catch (error) {
                console.error('Error loading logbook data:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const handleDownloadReport = async () => {
        if (!officialData) return;
        await generateLogbookReportPDF({
            studentName: officialData?.user?.full_name || 'Navegante',
            totalHours: officialData?.estadisticas?.horas_totales || 0,
            totalMiles: Number((officialData?.estadisticas?.horas_totales || 0) * 5.2),
            sessions: officialData?.horas || []
        });
    };

    const handleAddEntry = async () => {
        if (!newNote.trim()) return;
        try {
            const res = await fetch(apiUrl('/api/logbook/diary'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contenido: newNote,
                    estado_animo: selectedMood,
                    tags: []
                })
            });
            if (res.ok) {
                const newEntry = await res.json();
                setDiaryEntries([newEntry, ...diaryEntries]);
                setNewNote('');
                setIsWriting(false);
            }
        } catch (error) {
            console.error('Error saving entry:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent"></div>
                <p className="text-white/40 text-xs uppercase mt-6 tracking-widest">Consultando Registros...</p>
            </div>
        );
    }

    const totalHours = officialData?.estadisticas?.horas_totales || 0;
    const totalMiles = (totalHours * 5.2).toFixed(1);

    return (
        <div className="w-full max-w-6xl mx-auto h-full flex flex-col font-display p-6 relative pb-20">
            {/* Minimal Header */}
            <header className="flex flex-col md:flex-row items-center justify-between mb-12 gap-8 relative">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-accent rounded-2xl flex items-center justify-center">
                        <Book className="text-nautical-black w-10 h-10" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-display font-bold text-white italic">Bitácora Digital</h1>
                        <p className="text-white/40 text-sm mt-1">Tu historial de travesías y habilidades.</p>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-center">
                        <div className="text-[10px] uppercase tracking-widest text-white/40">Millas</div>
                        <div className="text-3xl font-black text-white">{totalMiles}</div>
                    </div>
                    <button
                        onClick={handleDownloadReport}
                        className="px-6 py-4 bg-accent text-nautical-black rounded-2xl font-black uppercase text-[10px]"
                    >
                        Descargar PDF
                    </button>
                </div>
            </header>

            {/* Content Switcher */}
            <div className="flex gap-4 mb-8">
                {['official', 'skills', 'map', 'fleet', 'diary'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest ${activeTab === tab ? 'bg-accent text-nautical-black' : 'text-white/40'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="flex-grow text-white">
                {activeTab === 'official' && (
                    <div className="grid grid-cols-1 gap-6">
                        {(officialData?.horas || []).length > 0 ? (
                            officialData.horas.map((session: NauticalSession) => (
                                <div
                                    key={session.id}
                                    className="group relative bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 rounded-3xl p-8 transition-all duration-500 overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-accent/5 to-transparent skew-x-12 translate-x-16 group-hover:translate-x-0 transition-transform duration-700" />

                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                                        <div className="flex items-center gap-8">
                                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl border shadow-lg ${session.verificado ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'}`}>
                                                {session.tipo === 'regata' ? '🏁' : session.tipo === 'travesia' ? '📍' : '⛵'}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-4 mb-2">
                                                    <span className="text-[10px] uppercase tracking-[0.3em] font-black text-white/30">
                                                        {new Date(session.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
                                                    </span>
                                                    <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${session.verificado ? 'bg-green-500/20 border-green-500/30 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.2)]' : 'bg-amber-500/20 border-amber-500/30 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]'}`}>
                                                        {session.verificado ? 'Validado' : 'Pendiente'}
                                                    </div>
                                                </div>
                                                <h3 className="text-2xl font-bold text-white group-hover:text-accent transition-colors leading-none mb-3">{session.tipo || 'Práctica Libre'}</h3>
                                                <div className="flex items-center gap-6 text-sm text-white/40">
                                                    <span className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-lg"><Ship size={14} className="text-accent" /> {session.embarcacion || 'Barco Escuela'}</span>
                                                    <span className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-lg"><Wind size={14} className="text-blue-400" /> {session.condiciones_meteo || 'Viento variable'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end justify-center">
                                            <div className="text-[10px] uppercase tracking-widest text-white/20 mb-1">Tiempo de Navegación</div>
                                            <div className="text-4xl font-black text-white">{session.duracion_h} <span className="text-xs text-white/40">h</span></div>
                                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/20 group-hover:text-accent group-hover:bg-accent/10 transition-all mt-4">
                                                <ChevronRight size={24} />
                                            </div>
                                        </div>
                                    </div>

                                    {session.notas && (
                                        <div className="mt-8 pt-6 border-t border-white/5 text-sm text-white/50 italic font-serif leading-relaxed">
                                            "{session.notas}"
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="py-24 text-center bg-white/5 border-2 border-dashed border-white/10 rounded-[3rem] group hover:border-accent/20 transition-all">
                                <div className="text-6xl mb-8 opacity-20 group-hover:scale-110 transition-transform duration-500">⚓</div>
                                <h3 className="text-2xl font-bold text-white mb-3">Tu bitácora está esperando tu primera aventura</h3>
                                <p className="text-white/40 max-w-sm mx-auto text-sm leading-relaxed mb-8">Empieza tus prácticas de navegación o inscríbete en un curso para comenzar a llenar tu historial oficial.</p>
                                <button className="px-10 py-4 bg-accent text-nautical-black font-black uppercase tracking-widest text-[10px] rounded-full hover:scale-105 transition-all shadow-xl shadow-accent/10">
                                    Ver Cursos Disponibles →
                                </button>
                            </div>
                        )}
                    </div>
                )}
                {activeTab === 'skills' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {(officialData?.habilidades || []).length > 0 ? (
                            officialData.habilidades.map((item: any) => (
                                <div key={item.habilidad.id} className="bg-white/5 p-8 rounded-3xl border border-white/10">
                                    <div className="text-3xl mb-4">{item.habilidad.icono || '⛵'}</div>
                                    <h3 className="text-xl font-bold mb-2">{item.habilidad.nombre_es}</h3>
                                    <p className="text-sm text-white/40 leading-relaxed">{item.habilidad.descripcion_es}</p>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-3xl text-white/20">
                                <p>Explora la academia para desbloquear habilidades.</p>
                            </div>
                        )}
                    </div>
                )}
                {activeTab === 'diary' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-display italic">Mi Diario Náutico</h2>
                            <button onClick={() => setIsWriting(true)} className="bg-accent text-nautical-black px-6 py-2 rounded-full font-black text-[10px] uppercase">
                                Nueva Entrada
                            </button>
                        </div>

                        {isWriting && (
                            <div className="bg-white/5 p-8 rounded-3xl border border-accent/20">
                                <textarea
                                    className="w-full bg-transparent border-none focus:ring-0 text-xl italic placeholder:text-white/10"
                                    placeholder="¿Cómo fue la jornada de hoy?"
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                />
                                <div className="flex justify-end gap-4 mt-6">
                                    <button onClick={() => setIsWriting(false)} className="text-white/40 text-xs">Descartar</button>
                                    <button onClick={handleAddEntry} className="bg-white/10 px-6 py-2 rounded-full text-xs">Guardar</button>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            {diaryEntries.map(entry => (
                                <div key={entry.id} className="bg-white/[0.02] p-8 rounded-3xl border border-white/5">
                                    <p className="text-[10px] text-accent mb-4 uppercase tracking-[0.2em]">{new Date(entry.fecha).toLocaleDateString()}</p>
                                    <p className="text-xl italic text-white/80 leading-relaxed font-serif">"{entry.contenido}"</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {activeTab === 'map' && <LogbookMap sessions={officialData?.horas || []} />}
                {activeTab === 'fleet' && <FleetMastery mastery={officialData?.estadisticas?.fleet_mastery || []} />}
            </div>
        </div>
    );
}

