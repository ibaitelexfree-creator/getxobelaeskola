'use client';

import React, { useState } from 'react';
import { Session } from './SessionsTab';
import { useCalendarGrid, CalendarDay } from '@/hooks/useCalendarGrid';

interface CalendarViewProps {
    sessions: Session[];
    onSessionClick: (session: Session) => void;
    locale: string;
}

export default function CalendarView({ sessions, onSessionClick, locale }: CalendarViewProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const days = useCalendarGrid(currentDate);

    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    const monthName = currentDate.toLocaleString(locale, { month: 'long' });
    const year = currentDate.getFullYear();

    const getSessionsForDay = (date: Date) => {
        return sessions.filter(s => {
            const d = new Date(s.fecha_inicio);
            return d.getDate() === date.getDate() &&
                d.getMonth() === date.getMonth() &&
                d.getFullYear() === date.getFullYear();
        });
    };

    const weekDays = locale === 'eu'
        ? ['Al', 'Ar', 'Az', 'Og', 'Or', 'La', 'Ig']
        : ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

    const getStatusColor = (estado: string) => {
        switch (estado) {
            case 'realizada': return 'border-green-500 bg-green-500/10 text-green-500';
            case 'programada': return 'border-blue-500 bg-blue-500/10 text-blue-500';
            case 'cancelada': return 'border-red-500 bg-red-500/10 text-red-500';
            case 'externo': return 'border-orange-500 bg-orange-500/10 text-orange-500';
            default: return 'border-accent bg-accent/10 text-accent';
        }
    };

    return (
        <div className="glass-panel p-4 md:p-8 rounded-sm animate-premium-in overflow-hidden">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <div className="space-y-1">
                    <h3 className="text-3xl font-display text-white italic capitalize">{monthName} <span className="text-accent">{year}</span></h3>
                    <p className="text-3xs text-white/40 uppercase tracking-widest font-black">Planificación Mensual</p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <button onClick={prevMonth} className="flex-1 md:flex-none px-6 py-3 border border-white/10 hover:border-accent hover:text-accent transition-all text-sm">←</button>
                    <button onClick={nextMonth} className="flex-1 md:flex-none px-6 py-3 border border-white/10 hover:border-accent hover:text-accent transition-all text-sm">→</button>
                </div>
            </header>

            <div className="overflow-x-auto border border-white/10 rounded-sm">
                <div className="grid grid-cols-7 gap-px bg-white/5 min-w-[700px]">
                    {weekDays.map(d => (
                        <div key={d} className="bg-nautical-black/50 p-4 text-3xs uppercase tracking-widest text-white/40 font-black text-center border-b border-white/10">
                            {d}
                        </div>
                    ))}

                    {days.map((item: CalendarDay, idx: number) => {
                        const daySessions = getSessionsForDay(item.date);
                        return (
                            <div
                                key={idx}
                                className={`min-h-[140px] bg-nautical-black/20 p-2 md:p-4 border border-white/5 transition-all hover:bg-white/5 relative group ${!item.isCurrentMonth ? 'opacity-30' : ''}`}
                            >
                                <div className="flex justify-between items-start">
                                    <span className={`text-xl font-display italic transition-colors ${item.isToday ? 'text-accent' : item.isCurrentMonth ? 'text-white/20 group-hover:text-white/40' : 'text-white/10'}`}>
                                        {item.date.getDate() < 10 ? `0${item.date.getDate()}` : item.date.getDate()}
                                    </span>
                                    {item.isToday && (
                                        <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse shadow-[0_0_8px_rgba(var(--accent-rgb),0.5)]" />
                                    )}
                                </div>

                                <div className="mt-4 space-y-1.5">
                                    {daySessions.slice(0, 4).map(s => {
                                        const statusStyle = getStatusColor(s.estado);
                                        return (
                                            <button
                                                key={s.id}
                                                onClick={() => onSessionClick(s)}
                                                className={`w-full text-left p-1.5 border-l-2 transition-all group/sess overflow-hidden rounded-r-sm ${statusStyle} hover:bg-white/5`}
                                            >
                                                <p className="text-[8px] font-black uppercase truncate mb-0.5">
                                                    {new Date(s.fecha_inicio).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                                <p className="text-3xs font-display italic truncate opacity-80 group-hover/sess:opacity-100 text-white">
                                                    {locale === 'eu' ? (s.curso?.nombre_eu || s.curso?.nombre_es) : s.curso?.nombre_es}
                                                </p>
                                            </button>
                                        );
                                    })}
                                </div>

                                {daySessions.length > 4 && (
                                    <p className="text-[8px] text-accent font-black mt-2 text-center bg-accent/10 py-1 rounded-sm">
                                        + {daySessions.length - 4} MÁS
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
