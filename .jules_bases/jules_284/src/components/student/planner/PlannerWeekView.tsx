import React from 'react';
import { Plus } from 'lucide-react';
import { StudySession } from './types';

interface PlannerWeekViewProps {
    days: Date[]; // Array of 7 dates
    sessions: StudySession[];
    onAddSession: (date: Date) => void;
    onEditSession: (session: StudySession) => void;
    // onDeleteSession: (id: string) => void; // Unused in view
}

export default function PlannerWeekView({ days, sessions, onAddSession, onEditSession }: PlannerWeekViewProps) {
    const getSessionsForDay = (date: Date) => {
        return sessions.filter(s => {
            const sDate = new Date(s.start_time);
            return sDate.getDate() === date.getDate() &&
                   sDate.getMonth() === date.getMonth() &&
                   sDate.getFullYear() === date.getFullYear();
        }).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' });
    };

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {days.map((day) => {
                const daySessions = getSessionsForDay(day);
                const isToday = new Date().toDateString() === day.toDateString();

                return (
                    <div key={day.toISOString()} className={`bg-card border ${isToday ? 'border-accent' : 'border-card-border'} rounded-sm p-3 min-h-[150px] flex flex-col`}>
                        <div className={`text-[10px] uppercase tracking-widest ${isToday ? 'text-accent' : 'text-white/40'} mb-3 text-center border-b border-white/5 pb-2 font-bold`}>
                            {formatDate(day)}
                        </div>

                        <div className="flex-1 space-y-2 mb-2">
                            {daySessions.map(session => (
                                <button
                                    key={session.id}
                                    onClick={() => onEditSession(session)}
                                    className="w-full text-left bg-accent/10 border-l-2 border-accent p-2 rounded-sm hover:bg-accent/20 transition-colors group relative overflow-hidden"
                                >
                                    <div className="text-xs font-bold text-white truncate">{session.topic || 'Sesión'}</div>
                                    <div className="text-[10px] text-accent truncate">
                                        {new Date(session.start_time).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                        {' '}({session.duration_minutes}m)
                                    </div>
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => onAddSession(day)}
                            className="mt-auto w-full py-2 flex items-center justify-center text-white/20 hover:text-accent hover:bg-white/5 rounded-sm transition-colors border border-dashed border-white/10 hover:border-accent/30"
                        >
                            <Plus size={14} />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
