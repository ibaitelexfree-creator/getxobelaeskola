'use client';

import React, { useEffect, useState } from 'react';
import StudentProfileSidebar from '@/components/student/StudentProfileSidebar';
import MembershipWidget from '@/components/student/MembershipWidget';
import DashboardRefresh from '@/components/student/DashboardRefresh';
import EmptyState from '@/components/ui/EmptyState';
import DailyChallengeWidget from '@/components/student/DailyChallengeWidget';
import Link from 'next/link';

interface DashboardItem {
    id: string;
    estado_pago?: string;
    fecha_reserva?: string;
    ediciones_curso?: { fecha_inicio: string; fecha_fin: string; cursos?: { nombre_es: string; nombre_eu: string; slug: string } };
    metadata?: { start_date: string; end_date?: string };
    cursos?: { nombre_es: string; nombre_eu: string; slug: string };
    servicios_alquiler?: { nombre_es: string; nombre_eu: string };
    hora_inicio?: string;
    opcion_seleccionada?: string;
    estado_entrega?: string;
}

export default function StudentDashboardClient({
    locale,
    translations: t
}: {
    locale: string,
    translations: any
}) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchDashboardData() {
            try {
                const res = await fetch('/api/student/dashboard-stats');
                const json = await res.json();
                setData(json);
            } catch (e) {
                console.error('Error fetching dashboard data:', e);
            } finally {
                setLoading(false);
            }
        }
        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-nautical-black flex items-center justify-center">
                <div className="text-accent animate-spin text-4xl">⚓</div>
            </div>
        );
    }

    const {
        profile,
        user,
        inscripciones = [],
        rentals = [],
        academyStats = {}
    } = data || {};

    const {
        totalHours = 0,
        totalMiles = 0,
        academyLevels = 0,
        academyCerts = 0,
        hasAcademyActivity = false
    } = academyStats;

    const hasAnyData = inscripciones.length > 0 || rentals.length > 0;

    const getStatusInfo = (item: DashboardItem) => {
        const isPaid = item.estado_pago === 'pagado';
        if (!isPaid) return { label: 'PENDIENTE DE PAGO', color: 'text-amber-500 border-amber-500/30', paid: false };

        const dateStr = item.fecha_reserva || (item.ediciones_curso?.fecha_inicio) || item.metadata?.start_date;
        if (!dateStr) return { label: 'PENDIENTE', color: 'text-green-500 border-green-500/30', paid: true };

        const itemDate = new Date(dateStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (itemDate < today) return { label: 'COMPLETADO', color: 'text-white/40 border-white/10', paid: true };
        return { label: 'PENDIENTE', color: 'text-green-500 border-green-500/30', paid: true };
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingInscripciones = inscripciones.filter((ins: any) => {
        const dateStr = ins.ediciones_curso?.fecha_inicio || ins.metadata?.start_date;
        if (!dateStr) return true;
        return new Date(dateStr) >= today;
    });

    const pastInscripciones = inscripciones.filter((ins: any) => {
        const dateStr = ins.ediciones_curso?.fecha_inicio || ins.metadata?.start_date;
        if (!dateStr) return false;
        return new Date(dateStr) < today;
    });

    const upcomingRentals = rentals.filter((rent: any) => {
        if (!rent.fecha_reserva) return true;
        return new Date(rent.fecha_reserva) >= today;
    });

    const pastRentals = rentals.filter((rent: any) => {
        if (!rent.fecha_reserva) return false;
        return new Date(rent.fecha_reserva) < today;
    });

    const formatDate = (date: string | Date | undefined) => {
        if (!date) return '--/--/----';
        return new Date(date).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const formatDateTime = (date: string | Date | undefined, time?: string) => {
        const d = formatDate(date);
        if (!time) return d;
        return `${d} - ${time.slice(0, 5)}h`;
    };

    return (
        <main className="min-h-screen pt-32 pb-24 px-6 relative">
            <div className="bg-mesh" />

            <div className="container mx-auto">
                <header className="mb-16">
                    <span className="text-accent uppercase tracking-widest text-xs font-semibold mb-4 block">
                        {t.eyebrow}
                    </span>
                    <h1 className="text-4xl md:text-7xl font-display mb-4">
                        {t.welcome.replace('{name}', profile?.nombre || 'Navegante')}
                    </h1>
                    <p className="text-foreground/40 font-light">{t.subtitle}</p>
                </header>

                <DashboardRefresh hasData={hasAnyData} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-16">
                        <MembershipWidget
                            status={profile?.status_socio || 'no_socio'}
                            locale={locale}
                        />

                        <section>
                            <div className="flex justify-between items-end mb-8">
                                <h2 className="text-xs uppercase tracking-widest text-accent font-bold">{t.academy_widget.title}</h2>
                                <Link href={`/${locale}/academy/dashboard`} className="text-[10px] uppercase tracking-widest text-foreground/40 hover:text-accent transition-colors">
                                    {t.academy_widget.go_to_panel}
                                </Link>
                            </div>

                            <div className="bg-gradient-to-r from-[#0a1628] to-[#0f213a] p-8 border border-accent/20 rounded-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-5 text-9xl pointer-events-none group-hover:scale-110 transition-transform duration-700">🎓</div>
                                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                                    <div>
                                        <h3 className="text-2xl font-display italic text-white mb-2">{t.academy_widget.card_title}</h3>
                                        <p className="text-white/60 text-sm max-w-md mb-6">
                                            {hasAcademyActivity ? t.academy_widget.card_desc_active : t.academy_widget.card_desc_inactive}
                                        </p>
                                        <div className="flex gap-6 mb-8 md:mb-0">
                                            <div>
                                                <div className="text-2xl font-bold text-accent">{totalMiles}</div>
                                                <div className="text-[9px] uppercase tracking-widest text-white/40">Millas Navegadas</div>
                                            </div>
                                            <div>
                                                <div className="text-2xl font-bold text-accent">{academyLevels}</div>
                                                <div className="text-[9px] uppercase tracking-widest text-white/40">{t.academy_widget.stats_levels}</div>
                                            </div>
                                            <div>
                                                <div className="text-2xl font-bold text-accent">{academyCerts}</div>
                                                <div className="text-[9px] uppercase tracking-widest text-white/40">{t.academy_widget.stats_certs}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <Link href={`/${locale}/academy/dashboard`} className="px-8 py-3 bg-accent text-nautical-black font-bold uppercase tracking-widest text-xs rounded hover:bg-white transition-all">
                                        {hasAcademyActivity ? t.academy_widget.btn_continue : t.academy_widget.btn_start}
                                    </Link>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xs uppercase tracking-widest text-accent mb-8 font-bold">{t.courses_section.title}</h2>
                            {upcomingInscripciones.length > 0 ? (
                                <div className="space-y-6">
                                    {upcomingInscripciones.map((ins: any) => {
                                        const edition = ins.ediciones_curso;
                                        const course = ins.cursos || edition?.cursos;
                                        const courseName = course ? (locale === 'es' ? course.nombre_es : course.nombre_eu) : 'Reserva de Curso';
                                        const status = getStatusInfo(ins);
                                        return (
                                            <div key={ins.id} className="bg-card p-6 border border-card-border flex justify-between items-center group hover:border-accent/30 transition-all rounded-sm">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-12 h-12 bg-accent/10 flex items-center justify-center text-accent text-xl rounded-sm">⛵</div>
                                                    <div>
                                                        <h3 className="text-lg font-display text-white group-hover:text-accent transition-colors">{courseName}</h3>
                                                        <p className="text-xs text-foreground/40 font-light">
                                                            {edition?.fecha_inicio ? `Del ${formatDate(edition.fecha_inicio)}` : 'Pendiente de asignar'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-3 text-right">
                                                    <span className={`text-[9px] uppercase tracking-widest px-3 py-1 border font-bold ${status.color}`}>{status.label}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <EmptyState icon="⛵" title={t.courses_section.empty_title} subtitle={t.courses_section.empty_subtitle} actionLabel={t.courses_section.btn_explore} actionHref={`/${locale}/courses`} />
                            )}
                        </section>
                    </div>

                    <div className="lg:col-span-1 space-y-8">
                        <DailyChallengeWidget locale={locale} />
                        <StudentProfileSidebar profile={profile} email={user?.email || ''} locale={locale} />
                    </div>
                </div>
            </div>
        </main>
    );
}
