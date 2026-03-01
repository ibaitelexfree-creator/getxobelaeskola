'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Download, Calendar, Clock, BookOpen, Brain, Trophy, ChevronDown, Filter } from 'lucide-react';

interface DailySessionStats {
    date: string;
    duration_minutes: number;
    modules_count: number;
    questions_count: number;
    xp_earned: number;
    last_activity: string;
}

export default function StudySessionsHistory({ locale = 'es' }: { locale?: string }) {
    const [sessions, setSessions] = useState<DailySessionStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState<string>('all');
    const [activityFilter, setActivityFilter] = useState<'all' | 'modules' | 'questions'>('all');

    useEffect(() => {
        async function fetchSessions() {
            try {
                const res = await fetch('/api/student/study-sessions');
                if (res.ok) {
                    const data = await res.json();
                    setSessions(data);
                }
            } catch (error) {
                console.error('Error fetching sessions:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchSessions();
    }, []);

    // Get unique months for filter
    const availableMonths = useMemo(() => {
        const months = new Set<string>();
        sessions.forEach(s => {
            const d = new Date(s.date);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            months.add(key);
        });
        return Array.from(months).sort().reverse();
    }, [sessions]);

    // Filter sessions based on Month & Activity Type
    const filteredSessions = useMemo(() => {
        let filtered = sessions;

        // 1. Month filter
        if (selectedMonth !== 'all') {
            filtered = filtered.filter(s => s.date.startsWith(selectedMonth));
        }

        // 2. Activity Type filter
        if (activityFilter === 'modules') {
            filtered = filtered.filter(s => s.modules_count > 0);
        } else if (activityFilter === 'questions') {
            filtered = filtered.filter(s => s.questions_count > 0);
        }

        return filtered;
    }, [sessions, selectedMonth, activityFilter]);

    // Format helpers
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString(locale, {
            weekday: 'short',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const formatMonth = (monthKey: string) => {
        const [year, month] = monthKey.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1, 1);
        return date.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
    };

    const formatDuration = (minutes: number) => {
        if (minutes < 60) return `${minutes}m`;
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return `${h}h ${m}m`;
    };

    // CSV Export
    const downloadCSV = () => {
        const headers = ['Fecha', 'Duración (min)', 'Módulos', 'Preguntas', 'XP Ganado'];
        const rows = filteredSessions.map(s => [
            s.date,
            s.duration_minutes,
            s.modules_count,
            s.questions_count,
            s.xp_earned
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `study_sessions_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <div className="p-12 flex justify-center items-center">
                <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (sessions.length === 0) {
        return null;
    }

    return (
        <section className="mt-12 animate-fade-in">
            {/* ENCABEZADO Y FILTROS */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end mb-8 gap-4">
                <h2 className="text-xs uppercase tracking-widest text-cyan-400 font-bold flex items-center gap-2">
                    <Clock size={14} className="text-indigo-400" />
                    Historial de Sesiones
                </h2>

                <div className="flex flex-wrap gap-3 items-center w-full xl:w-auto">

                    {/* Activity Filter (NEW) */}
                    <div className="flex p-1 bg-card border border-white/5 text-white/60 rounded-sm">
                        <button
                            onClick={() => setActivityFilter('all')}
                            className={`px-3 py-1.5 text-[10px] uppercase tracking-wider rounded-sm transition-all duration-300 ${activityFilter === 'all' ? 'bg-indigo-500/20 text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.1)]' : 'hover:text-white/90'}`}
                        >
                            Todo
                        </button>
                        <button
                            onClick={() => setActivityFilter('modules')}
                            className={`px-3 py-1.5 flex items-center gap-1.5 text-[10px] uppercase tracking-wider rounded-sm transition-all duration-300 ${activityFilter === 'modules' ? 'bg-cyan-500/20 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.1)]' : 'hover:text-white/90'}`}
                        >
                            <BookOpen size={10} /> Módulos
                        </button>
                        <button
                            onClick={() => setActivityFilter('questions')}
                            className={`px-3 py-1.5 flex items-center gap-1.5 text-[10px] uppercase tracking-wider rounded-sm transition-all duration-300 ${activityFilter === 'questions' ? 'bg-amber-500/20 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.1)]' : 'hover:text-white/90'}`}
                        >
                            <Brain size={10} /> Tests
                        </button>
                    </div>

                    {/* Month Filter */}
                    <div className="relative group min-w-[140px]">
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="w-full appearance-none bg-card border border-white/5 text-white/70 text-[11px] uppercase tracking-wider py-2 pl-4 pr-10 rounded-sm focus:outline-none focus:border-indigo-500/50 cursor-pointer hover:bg-white/5 hover:border-white/10 transition-all duration-300"
                        >
                            <option value="all">Todo el año</option>
                            {availableMonths.map(m => (
                                <option key={m} value={m}>{formatMonth(m)}</option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 group-hover:text-indigo-400 pointer-events-none transition-colors" />
                    </div>

                    {/* Export Button */}
                    <button
                        onClick={downloadCSV}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r hover:from-indigo-500/10 hover:to-cyan-500/10 text-white/60 hover:text-white text-[10px] uppercase tracking-widest rounded-sm transition-all duration-300 border border-white/5 hover:border-indigo-500/30"
                        title="Exportar a CSV"
                    >
                        <Download size={14} className="text-indigo-400" />
                        <span className="hidden sm:inline">Exportar</span>
                    </button>
                </div>
            </div>

            {/* TABLA SLEEK DARK CON ANIMACIONES */}
            <div className="bg-[#0A0A0A] border border-white/[0.03] shadow-2xl rounded-md overflow-hidden relative">

                {/* Ambiente sutil de diseño */}
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent"></div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/[0.03] text-[10px] uppercase tracking-widest text-white/40 bg-white/[0.01]">
                                <th className="p-5 pl-6 font-medium">Cronología</th>
                                <th className="p-5 font-medium">Duración</th>
                                <th className="p-5 font-medium text-center">Teoría</th>
                                <th className="p-5 font-medium text-center">Práctica</th>
                                <th className="p-5 pr-6 font-medium text-right">Progresión</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.02]">
                            {filteredSessions.map((session, index) => (
                                <tr
                                    key={session.date}
                                    className="group hover:bg-indigo-500/[0.02] transition-colors duration-300 cursor-default"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <td className="p-4 pl-6 relative">
                                        {/* Fila Activa Indicador Indigo */}
                                        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-indigo-500/0 group-hover:bg-indigo-500/50 transition-colors duration-500"></div>

                                        <div className="flex items-center gap-4">
                                            <div className="w-9 h-9 rounded-sm bg-white/[0.02] border border-white/[0.05] group-hover:border-indigo-500/30 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.15)] flex items-center justify-center text-white/30 group-hover:text-indigo-400 transition-all duration-500">
                                                <Calendar size={14} />
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-white/80 group-hover:text-white capitalize transition-colors duration-300">
                                                    {formatDate(session.date)}
                                                </div>
                                                <div className="text-[10px] text-white/30 font-mono tracking-wider mt-0.5">
                                                    {session.date}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 text-white/50 group-hover:text-white/90 text-sm font-mono transition-colors duration-300">
                                            <Clock size={13} className="text-white/20 group-hover:text-cyan-400 transition-colors duration-300" />
                                            {formatDuration(session.duration_minutes)}
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[11px] font-medium transition-all duration-300 ${session.modules_count > 0 ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:bg-cyan-500/20' : 'text-white/10 group-hover:text-white/20'}`}>
                                            <BookOpen size={12} className={session.modules_count > 0 ? '' : 'opacity-30'} />
                                            {session.modules_count > 0 ? session.modules_count : '-'}
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[11px] font-medium transition-all duration-300 ${session.questions_count > 0 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:bg-amber-500/20' : 'text-white/10 group-hover:text-white/20'}`}>
                                            <Brain size={12} className={session.questions_count > 0 ? '' : 'opacity-30'} />
                                            {session.questions_count > 0 ? session.questions_count : '-'}
                                        </div>
                                    </td>
                                    <td className="p-4 pr-6 text-right">
                                        <div className={`inline-flex items-center gap-1.5 font-mono text-sm tracking-tight transition-transform duration-300 group-hover:-translate-x-1 ${session.xp_earned > 0 ? 'text-indigo-400 font-semibold' : 'text-white/20'}`}>
                                            {session.xp_earned > 0 && <span className="text-indigo-500/50">+</span>}{session.xp_earned}
                                            <Trophy size={13} className={`ml-1 ${session.xp_earned > 0 ? 'text-cyan-400 group-hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.5)] transition-all' : 'opacity-30'}`} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredSessions.length === 0 && (
                    <div className="p-16 flex flex-col items-center justify-center text-center">
                        <Filter size={24} className="mb-4 text-white/10" />
                        <h3 className="text-white/60 font-medium mb-1">No hay sesiones que coincidan</h3>
                        <p className="text-white/30 text-xs">Prueba a cambiar los filtros o el periodo seleccionado.</p>
                    </div>
                )}
            </div>
        </section >
    );
}

