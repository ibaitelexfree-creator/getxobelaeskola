'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

interface Skill {
    id: string;
    slug: string;
    nombre_es: string;
    nombre_eu: string;
    descripcion_es: string;
    icono: string;
    categoria: string;
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

    // Load official data and diary from cloud
    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                // Fetch official progress
                const resProgress = await fetch(apiUrl('/api/academy/progress'));
                const dataProgress = await resProgress.json();
                setOfficialData(dataProgress);

                // Fetch cloud diary
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

    const deleteEntry = async (id: string) => {
        try {
            const res = await fetch(apiUrl(`/api/logbook/diary?id=${id}`), {
                method: 'DELETE'
            });

            if (res.ok) {
                setDiaryEntries(diaryEntries.filter(e => e.id !== id));
            }
        } catch (error) {
            console.error('Error deleting entry:', error);
        }
    };

    const handleDownloadReport = async () => {
        if (!officialData) return;
        await generateLogbookReportPDF({
            studentName: officialData?.user?.full_name || 'Navegante',
            totalHours: totalHours,
            totalMiles: Number(totalMiles),
            sessions: officialData?.horas || []
        });
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent shadow-[0_0_20px_rgba(var(--accent-rgb),0.2)]"></div>
                <p className="text-white/40 text-xs uppercase tracking-widest mt-6 animate-pulse">Consultando Registros Oficiales...</p>
            </div>
        );
    }

    const totalHours = officialData?.estadisticas?.horas_totales || 0;
    // Nautical miles simulation: average 5 knots
    const totalMiles = (totalHours * 5.2).toFixed(1);

    return (
        <div className="w-full max-w-6xl mx-auto h-full flex flex-col font-display p-6 relative pb-20">

            {/* Premium Header */}
            <header className="flex flex-col md:flex-row items-center justify-between mb-12 gap-8 relative">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-accent to-accent/20 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(var(--accent-rgb),0.3)] border border-white/20 relative overflow-hidden group">
                        <Waves className="absolute inset-0 w-full h-full text-white/10 -bottom-4 -left-2 group-hover:animate-pulse" />
                        <Book className="text-nautical-black w-10 h-10 relative z-10" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <span className="text-[10px] uppercase tracking-[0.3em] text-accent font-black">Área de Navegación Personal</span>
                            <div className="h-[1px] w-12 bg-accent/30" />
                        </div>
                        <h1 className="text-4xl font-display font-bold text-white italic leading-tight">Bitácora Digital</h1>
                        <p className="text-white/40 text-sm max-w-md mt-1">Tu historial oficial de travesías, habilidades dominadas y proezas académicas.</p>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md text-center group hover:border-accent/30 transition-all">
                        <div className="text-[10px] uppercase tracking-widest text-white/40 mb-1 group-hover:text-accent transition-colors">Millas Navegadas</div>
                        <div className="text-3xl font-black text-white">{totalMiles} <span className="text-xs text-accent">nm</span></div>
                    </div>
                    <div className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md text-center group hover:border-accent/30 transition-all">
                        <div className="text-[10px] uppercase tracking-widest text-white/40 mb-1 group-hover:text-accent transition-colors">Horas en Mar</div>
                        <div className="text-3xl font-black text-white">{totalHours} <span className="text-xs text-accent">h</span></div>
                    </div>
                    <button
                        onClick={handleDownloadReport}
                        className="px-6 py-4 bg-accent text-nautical-black rounded-2xl shadow-xl shadow-accent/10 hover:bg-white hover:scale-105 transition-all flex flex-col items-center justify-center gap-1 group"
                    >
                        <Download size={20} className="group-hover:bounce" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Descargar PDF</span>
                    </button>
                </div>
            </header>

            {/* Navigation Tabs */}
            <nav className="flex items-center gap-2 mb-12 bg-white/5 p-1.5 rounded-full border border-white/10 w-fit self-center md:self-start backdrop-blur-lg">
                <button
                    onClick={() => setActiveTab('official')}
                    className={`px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'official' ? 'bg-accent text-nautical-black shadow-lg shadow-accent/20' : 'text-white/40 hover:text-white'}`}
                >
                    <Anchor size={14} /> Historial Oficial
                </button>
                <button
                    onClick={() => setActiveTab('skills')}
                    className={`px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'skills' ? 'bg-accent text-nautical-black shadow-lg shadow-accent/20' : 'text-white/40 hover:text-white'}`}
                >
                    <Star size={14} /> Habilidades
                </button>
                <button
                    onClick={() => setActiveTab('map')}
                    className={`px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'map' ? 'bg-accent text-nautical-black shadow-lg shadow-accent/20' : 'text-white/40 hover:text-white'}`}
                >
                    <Compass size={14} /> Mapa de Aguas
                </button>
                <button
                    onClick={() => setActiveTab('fleet')}
                    className={`px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'fleet' ? 'bg-accent text-nautical-black shadow-lg shadow-accent/20' : 'text-white/40 hover:text-white'}`}
                >
                    <Ship size={14} /> Mi Flota
                </button>
                <button
                    onClick={() => setActiveTab('diary')}
                    className={`px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'diary' ? 'bg-accent text-nautical-black shadow-lg shadow-accent/20' : 'text-white/40 hover:text-white'}`}
                >
                    <Edit3 size={14} /> Diario Personal
                </button>
            </nav>

            {/* Content Area */}
            <div className="flex-grow">
                <AnimatePresence mode="wait">
                    {activeTab === 'official' && (
                        <motion.div
                            key="official"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-8"
                        >
                            {/* Official Sessions List */}
                            <div className="grid grid-cols-1 gap-4">
                                {(officialData?.horas || []).length > 0 ? (
                                    officialData.horas.map((session: NauticalSession) => (
                                        <div
                                            key={session.id}
                                            className="group relative bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 rounded-2xl p-6 transition-all duration-500 overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-accent/5 to-transparent skew-x-12 translate-x-16 group-hover:translate-x-0 transition-transform duration-700" />

                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                                                <div className="flex items-center gap-6">
                                                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl border ${session.verificado ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'}`}>
                                                        {session.tipo === 'regata' ? '🏁' : session.tipo === 'travesia' ? '📍' : '⛵'}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <span className="text-[9px] uppercase tracking-widest font-black text-white/30">
                                                                {new Date(session.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
                                                            </span>
                                                            <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter border ${session.verificado ? 'bg-green-500/20 border-green-500/30 text-green-400' : 'bg-amber-500/20 border-amber-500/30 text-amber-400'}`}>
                                                                {session.verificado ? 'Verificado por Instructor' : 'Pendiente Verificación'}
                                                            </div>
                                                        </div>
                                                        <h3 className="text-xl font-bold text-white group-hover:text-accent transition-colors">{session.tipo || 'Práctica Libre'}</h3>
                                                        <p className="text-sm text-white/40 mt-1 flex items-center gap-4">
                                                            <span className="flex items-center gap-1"><Ship size={14} className="text-accent" /> {session.embarcacion || 'Barco Escuela'}</span>
                                                            <span className="flex items-center gap-1"><Wind size={14} className="text-blue-400" /> {session.condiciones_meteo || 'Viento variable'}</span>
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col items-end gap-2">
                                                    <div>
                                                        <div className="text-[9px] uppercase tracking-widest text-white/20">Duración</div>
                                                        <div className="text-2xl font-black text-white">{session.duracion_h} <span className="text-xs text-white/40">h</span></div>
                                                    </div>
                                                    {activeTab === 'official' && !session.track_log && (
                                                        <div className="relative">
                                                            <input
                                                                type="file"
                                                                accept=".gpx"
                                                                onChange={async (e) => {
                                                                    const file = e.target.files?.[0];
                                                                    if (!file) return;
                                                                    const formData = new FormData();
                                                                    formData.append('file', file);
                                                                    formData.append('sessionId', session.id);

                                                                    try {
                                                                        const res = await fetch(apiUrl('/api/academy/logbook/upload-track'), {
                                                                            method: 'POST',
                                                                            body: formData
                                                                        });
                                                                        if (res.ok) {
                                                                            // Ideally trigger a refresh
                                                                            window.location.reload();
                                                                        }
                                                                    } catch (err) {
                                                                        console.error('Upload failed', err);
                                                                    }
                                                                }}
                                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                            />
                                                            <button className="text-[8px] uppercase tracking-widest bg-white/5 hover:bg-accent/10 hover:text-accent border border-white/10 p-2 rounded-lg transition-all flex items-center gap-1">
                                                                <Plus size={10} /> Subir Track GPX
                                                            </button>
                                                        </div>
                                                    )}
                                                    {session.track_log && (
                                                        <div className="text-[8px] uppercase tracking-widest text-accent font-black flex items-center gap-1 bg-accent/10 px-2 py-1 rounded-full">
                                                            <CheckCircle2 size={10} /> Track Validado
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/20 group-hover:text-accent group-hover:bg-accent/10 transition-all ml-2">
                                                    <ChevronRight size={20} />
                                                </div>
                                            </div>

                                            {session.notas && (
                                                <div className="mt-6 pt-4 border-t border-white/5 text-sm text-white/40 italic font-serif">
                                                    "{session.notas}"
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-20 text-center bg-white/5 border-2 border-dashed border-white/10 rounded-3xl">
                                        <div className="text-5xl mb-6 opacity-20">⚓</div>
                                        <h3 className="text-xl font-bold text-white mb-2">Aún no hay travesías registradas</h3>
                                        <p className="text-white/40 max-w-xs mx-auto text-sm">Empieza tus prácticas de navegación o inscríbete en un curso para comenzar a llenar tu bitácora.</p>
                                        <button className="mt-8 px-8 py-3 bg-accent text-nautical-black font-bold uppercase tracking-widest text-xs rounded-full hover:scale-105 transition-transform">
                                            Explorar Cursos →
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'skills' && (
                        <motion.div
                            key="skills"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-12"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {(officialData?.habilidades || []).length > 0 ? (
                                    officialData.habilidades.map((item: any) => (
                                        <div
                                            key={item.habilidad.id}
                                            className="bg-white/5 border border-white/10 p-8 rounded-3xl group hover:border-accent/40 transition-all duration-500 relative overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 p-4 text-6xl opacity-[0.03] group-hover:opacity-[0.08] transition-opacity -rotate-12 translate-x-4 -translate-y-4">
                                                {item.habilidad.icono || '✨'}
                                            </div>

                                            <div className="w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-accent/5 border border-accent/20">
                                                {item.habilidad.icono || '✨'}
                                            </div>

                                            <div className="text-[10px] uppercase tracking-[0.2em] text-accent font-black mb-1">{item.habilidad.categoria}</div>
                                            <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-accent transition-colors">{item.habilidad.nombre_es}</h3>
                                            <p className="text-sm text-white/40 leading-relaxed mb-6">
                                                {item.habilidad.descripcion_es}
                                            </p>

                                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-green-500">
                                                <CheckCircle2 size={12} /> Habilidad Desbloqueada
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full py-20 text-center bg-white/5 border-2 border-dashed border-white/10 rounded-3xl">
                                        <div className="text-5xl mb-6 opacity-20">🔑</div>
                                        <h3 className="text-xl font-bold text-white mb-2">Habilidades por descubrir</h3>
                                        <p className="text-white/40 max-w-xs mx-auto text-sm">Completa tareas específicas durante tu formación para desbloquear nuevas habilidades técnicas.</p>
                                    </div>
                                )}
                            </div>

                            {/* Skills available to unlock */}
                            <div>
                                <h4 className="text-[10px] uppercase tracking-[0.3em] text-white/20 font-black mb-8 border-b border-white/5 pb-4">Próximos Desafíos</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                    {[1, 2, 3, 4, 5, 6].map(i => (
                                        <div key={i} className="aspect-square bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col items-center justify-center grayscale opacity-30 group cursor-help hover:opacity-50 transition-all">
                                            <span className="text-3xl mb-2">🔒</span>
                                            <span className="text-[8px] uppercase tracking-widest text-white/40">Bloqueado</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'diary' && (
                        <motion.div
                            key="diary"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-8"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-display text-white italic">Mis Reflexiones Náuticas</h3>
                                {!isWriting && (
                                    <button
                                        onClick={() => setIsWriting(true)}
                                        className="flex items-center gap-2 bg-accent text-nautical-black font-black px-6 py-2.5 rounded-full text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-accent/20"
                                    >
                                        <Plus size={16} /> Nueva Entrada
                                    </button>
                                )}
                            </div>

                            {/* Writing Interface */}
                            {isWriting && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-white/5 border border-accent/20 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />

                                    <div className="flex justify-between items-center mb-8 relative z-10">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center text-accent">
                                                <Compass size={20} />
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-accent font-black uppercase tracking-widest">Nueva Entrada</span>
                                                <p className="text-xs text-white/40">{new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            {(['discovery', 'confident', 'challenging'] as const).map(mood => (
                                                <button
                                                    key={mood}
                                                    onClick={() => setSelectedMood(mood)}
                                                    className={`px-4 h-10 rounded-full flex items-center justify-center gap-2 transition-all ${selectedMood === mood ? 'bg-accent text-nautical-black scale-105 shadow-lg shadow-accent/20' : 'bg-white/5 text-white/40 hover:text-white border border-white/5'}`}
                                                >
                                                    {mood === 'discovery' && <Compass size={16} />}
                                                    {mood === 'confident' && <Award size={16} />}
                                                    {mood === 'challenging' && <Wind size={16} />}
                                                    <span className="text-[10px] uppercase font-black">
                                                        {mood === 'discovery' ? 'Descubrimiento' : mood === 'confident' ? 'Seguro' : 'Desafiante'}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <textarea
                                        value={newNote}
                                        onChange={(e) => setNewNote(e.target.value)}
                                        placeholder="Escribe tus reflexiones sobre la jornada de hoy..."
                                        className="w-full bg-transparent border-none text-white focus:ring-0 text-xl leading-relaxed placeholder:text-white/10 min-h-[200px] resize-none relative z-10 font-serif italic"
                                    />

                                    <div className="flex justify-end gap-4 mt-8 relative z-10">
                                        <button
                                            onClick={() => setIsWriting(false)}
                                            className="text-white/40 hover:text-white px-6 py-2 text-xs font-black uppercase tracking-widest transition-colors"
                                        >
                                            Descartar
                                        </button>
                                        <button
                                            onClick={handleAddEntry}
                                            className="bg-white/10 hover:bg-white/20 text-white font-black px-8 py-3 rounded-full flex items-center gap-2 border border-white/10 transition-all"
                                        >
                                            <Save size={16} /> Guardar Privado
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* Entry List */}
                            {diaryEntries.length === 0 && !isWriting && (
                                <div className="h-64 flex flex-col items-center justify-center text-white/20 border-2 border-dashed border-white/5 rounded-3xl">
                                    <Edit3 size={48} className="mb-4 opacity-50" />
                                    <p className="text-lg">Tu diario personal está por estrenar</p>
                                    <p className="text-sm">Registra tus sensaciones y aprendizajes personales.</p>
                                </div>
                            )}

                            <div className="space-y-6">
                                {diaryEntries.map((entry: LogEntry) => (
                                    <motion.div
                                        key={entry.id}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="group relative bg-[#111827] hover:bg-[#1f2937] border border-white/5 rounded-3xl p-8 transition-all duration-500 hover:border-accent/20 shadow-2xl overflow-hidden"
                                    >
                                        {/* Paper Texture Overlay */}
                                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-noise" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

                                        {/* Radial Shine */}
                                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent/5 rounded-full blur-3xl group-hover:bg-accent/10 transition-colors duration-700" />

                                        <div className="flex items-start justify-between mb-6 relative z-10">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${entry.estado_animo === 'discovery' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : entry.estado_animo === 'confident' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'}`}>
                                                    {entry.estado_animo === 'discovery' && <Compass size={24} className="animate-pulse-slow" />}
                                                    {entry.estado_animo === 'confident' && <Award size={24} className="animate-pulse-slow" />}
                                                    {entry.estado_animo === 'challenging' && <Wind size={24} className="animate-pulse-slow" />}
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-white/20 uppercase tracking-[0.4em] mb-1 font-black">Registro de Bitácora</p>
                                                    <p className="text-white font-display italic text-lg opacity-80 capitalize">
                                                        {new Date(entry.fecha).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                                    </p>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => deleteEntry(entry.id)}
                                                className="opacity-0 group-hover:opacity-100 text-white/10 hover:text-red-400 transition-all p-2 hover:bg-red-500/10 rounded-full"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>

                                        <p className="text-white/70 text-xl leading-relaxed font-serif italic border-l-4 border-accent/20 pl-8 ml-2 relative z-10 py-2">
                                            "{entry.contenido}"
                                        </p>

                                        {/* Nautical Decoration */}
                                        <div className="absolute bottom-6 right-8 text-white/[0.02] pointer-events-none group-hover:text-accent/5 transition-colors duration-700 group-hover:rotate-12 transition-transform">
                                            <Compass size={80} />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'map' && (
                        <motion.div
                            key="map"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <LogbookMap sessions={officialData?.horas || []} />
                        </motion.div>
                    )}

                    {activeTab === 'fleet' && (
                        <motion.div
                            key="fleet"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <FleetMastery mastery={officialData?.estadisticas?.fleet_mastery || []} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Premium Certificates Sidebar/Section (Bottom) */}
            {(officialData?.certificados || []).length > 0 && (
                <section className="mt-24 pt-12 border-t border-white/10">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h2 className="text-3xl font-display italic text-white leading-tight">Certificados & Credenciales</h2>
                            <p className="text-white/40 text-sm mt-1">Descarga tus títulos oficiales y diplomas de nivel.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {officialData.certificados.map((cert: any) => (
                            <CertificateCard
                                key={cert.id}
                                certificate={cert}
                                studentName={officialData.user?.full_name || 'Navegante'}
                                locale={t('locale') || 'es'}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* Bottom Floating Stats */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-nautical-black/80 backdrop-blur-xl border border-white/10 rounded-2xl px-8 py-4 flex items-center gap-12 shadow-2xl shadow-black/50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center text-accent">
                        <Activity size={16} />
                    </div>
                    <div>
                        <div className="text-[8px] uppercase tracking-widest text-white/30">Progreso Global</div>
                        <div className="text-sm font-black text-white">{officialData?.estadisticas?.progreso_global || 0}%</div>
                    </div>
                </div>
                <div className="w-[1px] h-8 bg-white/10" />
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                        <Waves size={16} />
                    </div>
                    <div>
                        <div className="text-[8px] uppercase tracking-widest text-white/30">Nivel de Rango</div>
                        <div className="text-sm font-black text-white">Nivel {officialData?.estadisticas?.niveles_completados || 0}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

