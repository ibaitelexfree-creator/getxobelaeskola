'use client';

import React, { useState, useEffect } from 'react';

import LogoutButton from '@/components/auth/LogoutButton';
import { ClientDate } from '@/components/staff/StaffShared';
import SessionDetailModal from '@/components/staff/SessionDetailModal';
import IncidentReportModal from '@/components/instructor/IncidentReportModal';

interface Profile {
    id: string;
    nombre: string;
    apellidos: string;
    rol: string;
    email: string;
}

interface Session {
    id: string;
    curso_id: string;
    fecha_inicio: string;
    fecha_fin: string;
    estado: string;
    observaciones: string;
    curso?: { nombre_es: string; nombre_eu: string };
    embarcacion?: { nombre: string };
}

interface Inscription {
    id: string;
    profiles: { nombre: string; apellidos: string; email: string };
    ediciones_curso: {
        fecha_inicio: string;
        cursos: { nombre_es: string; nombre_eu: string };
    };
    estado_pago: string;
}

interface InstructorClientProps {
    profile: Profile;
    initialSessions: Session[];
    initialInscriptions: Inscription[];
    locale: string;
}

export default function InstructorClient({ profile, initialSessions, initialInscriptions, locale }: InstructorClientProps) {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'sessions' | 'students' | 'fleet'>('dashboard');

    // Scroll to top when tab changes
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, [activeTab]);

    const [sessions, setSessions] = useState<Session[]>(initialSessions);
    const [selectedSession, setSelectedSession] = useState<Session | null>(null);
    const [showIncidentModal, setShowIncidentModal] = useState(false);

    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'sessions', label: 'Mis Sesiones', icon: '⛵' },
        { id: 'students', label: 'Mis Alumnos', icon: '👥' },
        { id: 'fleet', label: 'Estado Flota', icon: '🛥️' },
    ];

    return (
        <main className="min-h-screen pt-24 pb-12 px-6 flex flex-col items-center relative overflow-hidden">
            <div className="bg-mesh" />

            <div className="container max-w-7xl relative z-10 w-full">
                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                    <div>
                        <span className="text-accent uppercase tracking-[0.3em] text-3xs font-black mb-4 block animate-in slide-in-from-left duration-700">
                            Panel de Instructor
                        </span>
                        <h1 className="text-5xl md:text-7xl font-display leading-tight">
                            Hola, <span className="italic">{profile.nombre}</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden md:block">
                            <p className="text-2xs font-bold text-white/60">{profile.email}</p>
                            <p className="text-3xs uppercase tracking-widest text-accent font-black">Instructor Activo</p>
                        </div>
                        <LogoutButton locale={locale} />
                    </div>
                </header>

                {/* Navigation */}
                <nav className="flex flex-wrap gap-2 mb-12 border-b border-white/5">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as typeof activeTab)}
                            className={`px-6 py-4 text-3xs uppercase tracking-widest font-black transition-all border-b-2 flex items-center gap-3 ${activeTab === tab.id
                                ? 'border-accent text-accent bg-accent/5'
                                : 'border-transparent text-white/40 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <span>{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </nav>

                {/* Content */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {activeTab === 'dashboard' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-8">
                                <section className="bg-card border border-card-border p-8 rounded-sm">
                                    <h2 className="text-2xs uppercase tracking-widest text-accent mb-8 font-black flex justify-between items-center">
                                        Próximas Sesiones
                                    </h2>

                                    {sessions.length > 0 ? (
                                        <div className="space-y-4">
                                            {sessions.slice(0, 5).map((session) => (
                                                <div
                                                    key={session.id}
                                                    onClick={() => setSelectedSession(session)}
                                                    className="p-4 bg-white/5 border border-white/5 hover:border-accent/30 transition-all cursor-pointer group rounded-sm flex justify-between items-center"
                                                >
                                                    <div>
                                                        <h3 className="font-display text-lg italic text-white group-hover:text-accent transition-colors">
                                                            {session.curso?.nombre_es || 'Sesión sin curso'}
                                                        </h3>
                                                        <div className="flex items-center gap-4 mt-1">
                                                            <span className="text-3xs text-white/40 uppercase tracking-widest">
                                                                <ClientDate date={session.fecha_inicio} />
                                                            </span>
                                                            {session.embarcacion && (
                                                                <span className="text-3xs text-brass-gold uppercase tracking-widest">
                                                                    • {session.embarcacion.nombre}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <span className={`text-3xs font-black tracking-widest px-3 py-1 rounded-sm uppercase ${session.estado === 'completada' ? 'bg-sea-foam/10 text-sea-foam' : 'bg-accent/10 text-accent'
                                                        }`}>
                                                        {session.estado}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-white/40 text-sm italic py-12 text-center border border-dashed border-white/10">
                                            No tienes sesiones programadas próximamente.
                                        </p>
                                    )}
                                </section>
                            </div>

                            <div className="space-y-8">
                                <div className="bg-card border border-card-border p-8 rounded-sm">
                                    <h3 className="text-3xs uppercase tracking-widest text-accent mb-6 font-black">Bitácora Rápida</h3>
                                    <p className="text-2xs text-white/40 leading-relaxed font-light mb-6">
                                        Registra incidencias o notas importantes del día directamente desde aquí.
                                    </p>
                                    <button
                                        onClick={() => setShowIncidentModal(true)}
                                        className="w-full py-4 bg-white/5 border border-white/10 text-3xs uppercase tracking-widest font-black hover:bg-accent hover:text-nautical-black transition-all"
                                    >
                                        + Nueva Incidencia
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'sessions' && (
                        <section className="bg-card border border-card-border p-8 rounded-sm">
                            <h2 className="text-2xs uppercase tracking-widest text-accent mb-8 font-black">Historial y Programación de Sesiones</h2>
                            <div className="space-y-4">
                                {sessions.map((session) => (
                                    <div
                                        key={session.id}
                                        onClick={() => setSelectedSession(session)}
                                        className="p-6 bg-white/5 border border-white/5 hover:border-accent/30 transition-all cursor-pointer group rounded-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                                    >
                                        <div>
                                            <h3 className="font-display text-xl italic text-white group-hover:text-accent transition-colors">
                                                {session.curso?.nombre_es || 'Sesión sin curso'}
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-4 mt-2">
                                                <span className="text-3xs text-white/40 uppercase tracking-widest flex items-center gap-2">
                                                    📅 <ClientDate date={session.fecha_inicio} />
                                                </span>
                                                {session.embarcacion && (
                                                    <span className="text-3xs text-brass-gold uppercase tracking-widest flex items-center gap-2">
                                                        ⛵ {session.embarcacion.nombre}
                                                    </span>
                                                )}
                                            </div>
                                            {session.observaciones && (
                                                <p className="text-2xs text-white/60 mt-3 font-light max-w-2xl">
                                                    &quot;{session.observaciones}&quot;
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={`text-3xs font-black tracking-widest px-4 py-2 rounded-sm uppercase ${session.estado === 'completada' ? 'bg-sea-foam/10 text-sea-foam' :
                                                session.estado === 'cancelada' ? 'bg-red-500/10 text-red-500' :
                                                    'bg-accent/10 text-accent'
                                                }`}>
                                                {session.estado}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {activeTab === 'students' && (
                        <section className="bg-card border border-card-border p-8 rounded-sm">
                            <h2 className="text-2xs uppercase tracking-widest text-accent mb-8 font-black">Mis Alumnos Activos</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {initialInscriptions.map((inscription) => (
                                    <div key={inscription.id} className="p-6 bg-white/5 border border-white/5 rounded-sm hover:border-white/20 transition-all">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center text-accent text-lg font-display">
                                                {inscription.profiles.nombre.charAt(0)}
                                            </div>
                                            <span className="text-3xs uppercase tracking-widest text-sea-foam bg-sea-foam/10 px-2 py-1 rounded-sm">
                                                Activo
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-display text-white mb-1">
                                            {inscription.profiles.nombre} {inscription.profiles.apellidos}
                                        </h3>
                                        <p className="text-2xs text-white/40 mb-4">{inscription.profiles.email}</p>
                                        <div className="pt-4 border-t border-white/5">
                                            <p className="text-3xs uppercase tracking-widest text-white/40 mb-1">Curso Actual</p>
                                            <p className="text-2xs text-accent">
                                                {locale === 'es' ? inscription.ediciones_curso.cursos.nombre_es : inscription.ediciones_curso.cursos.nombre_eu}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                {initialInscriptions.length === 0 && (
                                    <p className="col-span-full text-white/40 italic text-center py-12">No hay alumnos activos en tus cursos.</p>
                                )}
                            </div>
                        </section>
                    )}

                    {activeTab === 'fleet' && (
                        <section className="bg-card border border-card-border p-8 rounded-sm">
                            <h2 className="text-2xs uppercase tracking-widest text-accent mb-8 font-black">Estado de la Flota</h2>
                            <p className="text-white/40 italic">Consulta la disponibilidad y mantenimiento de las embarcaciones...</p>
                        </section>
                    )}
                </div>
            </div>

            {/* Session Detail Modal */}
            {selectedSession && (
                <SessionDetailModal
                    session={selectedSession}
                    onClose={() => setSelectedSession(null)}
                    onSave={async (updated) => {
                        // Optimistic update
                        setSessions(prev => prev.map(s => s.id === updated.id ? updated : s));
                        setSelectedSession(null);

                        // Actual API update
                        try {
                            const res = await fetch('/api/admin/sessions/update', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(updated)
                            });
                            if (!res.ok) console.error('Failed to update session');
                        } catch (err) {
                            console.error(err);
                        }
                    }}
                />
            )}

            {/* Incident Report Modal */}
            <IncidentReportModal
                isOpen={showIncidentModal}
                onClose={() => setShowIncidentModal(false)}
            />
        </main>
    );
}
