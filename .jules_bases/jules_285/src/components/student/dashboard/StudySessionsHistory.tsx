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

    // Filter sessions
    const filteredSessions = useMemo(() => {
        if (selectedMonth === 'all') return sessions;
        return sessions.filter(s => s.date.startsWith(selectedMonth));
    }, [sessions, selectedMonth]);

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
        return <div className="p-8 text-center text-white/20 animate-pulse">Cargando historial...</div>;
    }

    if (sessions.length === 0) {
        return null; // Or empty state
    }

    return (
        <section className="mt-12">
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4">
                <h2 className="text-xs uppercase tracking-widest text-accent font-bold flex items-center gap-2">
                    <Clock size={14} />
                    Historial de Sesiones
                </h2>

                <div className="flex gap-4 items-center">
                    {/* Month Filter */}
                    <div className="relative group">
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="appearance-none bg-card border border-white/10 text-white/60 text-xs uppercase tracking-wider py-2 pl-4 pr-10 rounded-sm focus:outline-none focus:border-accent/50 cursor-pointer hover:bg-white/5 transition-colors"
                        >
                            <option value="all">Todo el historial</option>
                            {availableMonths.map(m => (
                                <option key={m} value={m}>{formatMonth(m)}</option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                    </div>

                    {/* Export Button */}
                    <button
                        onClick={downloadCSV}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white/60 text-[10px] uppercase tracking-widest rounded-sm transition-all border border-white/5 hover:border-white/20"
                        title="Exportar a CSV"
                    >
                        <Download size={14} />
                        <span className="hidden sm:inline">CSV</span>
                    </button>
                </div>
            </div>

            <div className="bg-card border border-card-border rounded-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/5 text-[10px] uppercase tracking-widest text-white/30">
                                <th className="p-4 pl-6 font-medium">Fecha</th>
                                <th className="p-4 font-medium">Duración</th>
                                <th className="p-4 font-medium text-center">Módulos</th>
                                <th className="p-4 font-medium text-center">Preguntas</th>
                                <th className="p-4 pr-6 font-medium text-right">XP</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredSessions.map((session) => (
                                <tr key={session.date} className="group hover:bg-white/[0.02] transition-colors">
                                    <td className="p-4 pl-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-sm bg-accent/5 flex items-center justify-center text-accent">
                                                <Calendar size={14} />
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-white/90 capitalize">
                                                    {formatDate(session.date)}
                                                </div>
                                                <div className="text-[10px] text-white/30 font-mono">
                                                    {session.date}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 text-white/60 text-sm font-mono">
                                            <Clock size={12} className="text-accent/50" />
                                            {formatDuration(session.duration_minutes)}
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-sm text-xs font-medium ${session.modules_count > 0 ? 'bg-blue-500/10 text-blue-400' : 'text-white/20'}`}>
                                            <BookOpen size={12} />
                                            {session.modules_count}
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-sm text-xs font-medium ${session.questions_count > 0 ? 'bg-purple-500/10 text-purple-400' : 'text-white/20'}`}>
                                            <Brain size={12} />
                                            {session.questions_count}
                                        </div>
                                    </td>
                                    <td className="p-4 pr-6 text-right">
                                        <div className={`inline-flex items-center gap-1.5 font-bold ${session.xp_earned > 0 ? 'text-accent' : 'text-white/20'}`}>
                                            {session.xp_earned > 0 && '+'}{session.xp_earned}
                                            <Trophy size={12} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredSessions.length === 0 && (
                    <div className="p-12 text-center text-white/30 text-sm">
                        No hay sesiones registradas en este periodo.
                    </div>
                )}
            </div>
        </section>
    );
}
