'use client';

import dynamic from 'next/dynamic';
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { getApiUrl } from '@/lib/platform';
import { Menu, X, ChevronRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import DashboardSkeleton from '@/components/student/DashboardSkeleton';

// Dynamic Imports for Optimization
const StudentProfileSidebar = dynamic(() => import('@/components/student/StudentProfileSidebar'));
const MembershipWidget = dynamic(() => import('@/components/student/MembershipWidget'));
const DailyChallengeWidget = dynamic(() => import('@/components/student/DailyChallengeWidget'));
const WeatherPremium = dynamic(() => import('@/components/shared/WeatherPremium'), { ssr: false });
const MobileStudentHub = dynamic(() => import('@/components/student/MobileStudentHub'));
const NotificationPermissionBanner = dynamic(() => import('@/components/dashboard/NotificationPermissionBanner'), { ssr: false });
const QuickContact = dynamic(() => import('@/components/student/QuickContact'));
const DashboardRefresh = dynamic(() => import('@/components/student/DashboardRefresh'));
const EmptyState = dynamic(() => import('@/components/ui/EmptyState'));
const BonosWallet = dynamic(() => import('@/components/student/BonosWallet'));
const BonoPurchaseModal = dynamic(() => import('@/components/student/BonoPurchaseModal'));
const DailyNauticalQuote = dynamic(() => import('@/components/student/DailyNauticalQuote'));

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
    const [isMobile, setIsMobile] = useState(false);
    const [isBonoModalOpen, setIsBonoModalOpen] = useState(false);

    const router = useRouter();

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getSession().then(({ data: { session } }: any) => {
            if (!session) {
                router.replace(`/${locale}/auth/login?returnTo=${encodeURIComponent(`/${locale}/student/dashboard`)}`);
            }
        });
    }, [locale, router]);

    useEffect(() => {
        async function fetchDashboardData() {
            try {
                const res = await fetch(getApiUrl('/api/student/dashboard-stats'));
                const json = await res.json();

                if (json.error === 'Unauthorized') {
                    router.replace(`/${locale}/auth/login?returnTo=${encodeURIComponent(`/${locale}/student/dashboard`)}`);
                    return;
                }

                setData(json);
            } catch (e) {
                console.error('Error fetching dashboard data:', e);
            } finally {
                setLoading(false);
            }
        }
        fetchDashboardData();
    }, [locale, router]);

    useEffect(() => {
        const checkMobile = () => {
            const isCapacitor = typeof window !== 'undefined' && !!(window as any).Capacitor?.isNativePlatform?.();
            const isNarrow = window.innerWidth < 768;
            setIsMobile(isCapacitor || isNarrow);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const {
        profile,
        user,
        inscripciones = [],
        rentals = [],
        bonos = [],
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

    const formatDate = useCallback((date: string | Date | undefined) => {
        if (!date) return '--/--/----';
        try {
            return new Date(date).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (e) {
            return '--/--/----';
        }
    }, []);

    const formatDateTime = useCallback((date: string | Date | undefined, time?: string) => {
        if (!date) return '--/--/----';
        const datePart = formatDate(date);
        return time ? `${datePart} — ${time}` : datePart;
    }, [formatDate]);

    // Memoize categories to avoid re-filtering on every render
    const { upcomingInscripciones, pastInscripciones, upcomingRentals, pastRentals } = useMemo(() => {
        const tday = new Date();
        tday.setHours(0, 0, 0, 0);

        return {
            upcomingInscripciones: inscripciones.filter((ins: any) => {
                const dateStr = ins.ediciones_curso?.fecha_inicio || ins.metadata?.start_date;
                return !dateStr || new Date(dateStr) >= tday;
            }),
            pastInscripciones: inscripciones.filter((ins: any) => {
                const dateStr = ins.ediciones_curso?.fecha_inicio || ins.metadata?.start_date;
                return dateStr && new Date(dateStr) < tday;
            }),
            upcomingRentals: rentals.filter((rent: any) => {
                return !rent.fecha_reserva || new Date(rent.fecha_reserva) >= tday;
            }),
            pastRentals: rentals.filter((rent: any) => {
                return rent.fecha_reserva && new Date(rent.fecha_reserva) < tday;
            })
        };
    }, [inscripciones, rentals]);

    if (loading) {
        return <DashboardSkeleton />;
    }

    return (
        <div className="relative min-h-screen bg-nautical-black">
            <div className="bg-mesh" />

            {/* Mobile View - Visible only on small screens */}
            <div className="md:hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-[80px] rounded-full pointer-events-none" />
                <div className="absolute bottom-20 left-0 w-48 h-48 bg-blue-500/5 blur-[60px] rounded-full pointer-events-none" />
                <MobileStudentHub
                    profile={profile}
                    upcomingInscripciones={upcomingInscripciones}
                    upcomingRentals={upcomingRentals}
                    academyStats={academyStats}
                    locale={locale}
                    t={t}
                />
            </div>

            {/* Desktop View - Hidden on mobile */}
            <div className="hidden md:flex flex-col lg:flex-row gap-8 p-4 lg:p-8 pt-44 lg:pt-48 max-w-[1600px] mx-auto relative z-10">
                <StudentProfileSidebar profile={profile} email={user?.email || ''} locale={locale} />

                <main className="flex-1 space-y-12 max-w-5xl">
                    <NotificationPermissionBanner />

                    <header>
                        <span className="text-accent uppercase tracking-widest text-xs font-semibold mb-4 block">
                            {t.eyebrow}
                        </span>
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-display mb-4 text-white leading-[1.1]">
                            {(() => {
                                const welcome = t.welcome || 'Hola, {name}';
                                const parts = welcome.includes('{{NAME}}') ? welcome.split('{{NAME}}') : welcome.split('{name}');
                                return (
                                    <>
                                        {parts[0]}
                                        <span className="text-accent italic">{profile?.nombre || 'Navegante'}</span>
                                        {parts[1] || ''}
                                    </>
                                );
                            })()}
                        </h1>
                        <p className="text-foreground/60 font-medium tracking-wide">{t.subtitle}</p>
                    </header>

                    <DashboardRefresh hasData={hasAnyData} />

                    <div className="mb-12">
                        <WeatherPremium />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        <div className="lg:col-span-2 space-y-16">
                            <BonosWallet
                                bonos={bonos}
                                locale={locale}
                                onBuyClick={() => setIsBonoModalOpen(true)}
                            />

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

                                <div className="bg-gradient-to-br from-[#0a1628] to-[#010816] p-1 lg:p-1 border border-accent/20 rounded-sm relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-9xl pointer-events-none group-hover:scale-110 group-hover:opacity-[0.07] transition-all duration-1000">🎓</div>

                                    <div className="bg-[#050c18] p-8 rounded-[1px] relative z-10">
                                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-10">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-8 h-8 bg-accent/10 flex items-center justify-center rounded-full text-accent shadow-[0_0_15px_rgba(var(--accent-rgb),0.2)]">
                                                        <Sparkles size={14} />
                                                    </div>
                                                    <h3 className="text-2xl font-display italic text-white">{t.academy_widget.card_title}</h3>
                                                </div>

                                                <p className="text-white/50 text-sm max-w-md mb-8 leading-relaxed">
                                                    {hasAcademyActivity ? t.academy_widget.card_desc_active : t.academy_widget.card_desc_inactive}
                                                </p>

                                                <div className="grid grid-cols-3 gap-4 lg:gap-8">
                                                    <div className="space-y-1">
                                                        <div className="text-3xl font-black text-white italic tracking-tighter leading-none">{totalMiles}</div>
                                                        <div className="text-[8px] uppercase tracking-[0.2em] text-accent/60 font-medium">Millas</div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="text-3xl font-black text-white italic tracking-tighter leading-none">{academyLevels}</div>
                                                        <div className="text-[8px] uppercase tracking-[0.2em] text-accent/60 font-medium">{t.academy_widget.stats_levels}</div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="text-3xl font-black text-white italic tracking-tighter leading-none">{academyCerts}</div>
                                                        <div className="text-[8px] uppercase tracking-[0.2em] text-accent/60 font-medium">{t.academy_widget.stats_certs}</div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-center gap-6 w-full md:w-auto">
                                                {/* Progress Circular Visual */}
                                                <div className="relative w-32 h-32 flex items-center justify-center">
                                                    <svg className="w-full h-full transform -rotate-90">
                                                        <circle
                                                            cx="64"
                                                            cy="64"
                                                            r="58"
                                                            fill="transparent"
                                                            stroke="currentColor"
                                                            strokeWidth="4"
                                                            className="text-white/5"
                                                        />
                                                        <circle
                                                            cx="64"
                                                            cy="64"
                                                            r="58"
                                                            fill="transparent"
                                                            stroke="currentColor"
                                                            strokeWidth="4"
                                                            strokeDasharray={364}
                                                            strokeDashoffset={364 - (Math.min(totalMiles, 100) / 100) * 364}
                                                            className="text-accent shadow-[0_0_15px_rgba(var(--accent-rgb),0.5)] transition-all duration-1000 ease-out"
                                                        />
                                                    </svg>
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                                        <span className="text-[9px] uppercase tracking-widest text-white/30 font-bold">Goal</span>
                                                        <span className="text-sm font-black text-white">100 Mi</span>
                                                    </div>
                                                </div>

                                                <Link href={`/${locale}/academy/dashboard`} className="w-full md:w-auto px-10 py-4 bg-accent text-nautical-black font-black uppercase tracking-[0.2em] text-[10px] rounded hover:bg-white hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(var(--accent-rgb),0.3)] text-center">
                                                    {hasAcademyActivity ? t.academy_widget.btn_continue : t.academy_widget.btn_start}
                                                </Link>
                                            </div>
                                        </div>
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

                            <section>
                                <div className="flex justify-between items-end mb-8">
                                    <h2 className="text-xs uppercase tracking-widest text-accent font-bold">{t.rentals_section.title}</h2>
                                    <Link href={`/${locale}/rental`} className="text-[10px] uppercase tracking-widest text-foreground/40 hover:text-accent transition-colors">
                                        {t.rentals_section.new_rental}
                                    </Link>
                                </div>
                                {upcomingRentals.length > 0 ? (
                                    <div className="space-y-6">
                                        {upcomingRentals.map((rent: any) => {
                                            const status = getStatusInfo(rent);
                                            const itemName = rent.servicios_alquiler ? (locale === 'es' ? rent.servicios_alquiler.nombre_es : rent.servicios_alquiler.nombre_eu) : 'Alquiler de Material';
                                            return (
                                                <div key={rent.id} className="bg-card p-6 border border-card-border flex justify-between items-center group hover:border-accent/30 transition-all rounded-sm">
                                                    <div className="flex items-center gap-6">
                                                        <div className="w-12 h-12 bg-accent/10 flex items-center justify-center text-accent text-xl rounded-sm">🌊</div>
                                                        <div>
                                                            <h3 className="text-lg font-display text-white group-hover:text-accent transition-colors">{itemName}</h3>
                                                            <p className="text-xs text-foreground/40 font-light">
                                                                {formatDateTime(rent.fecha_reserva, rent.hora_inicio)}
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
                                    <EmptyState icon="🌊" title={t.rentals_section.empty_title} subtitle={t.rentals_section.empty_subtitle} actionLabel={t.rentals_section.btn_reserve} actionHref={`/${locale}/rental`} />
                                )}
                            </section>

                            {/* History Section */}
                            {(pastInscripciones.length > 0 || pastRentals.length > 0) && (
                                <section className="pt-16 border-t border-white/5">
                                    <h2 className="text-xs uppercase tracking-widest text-foreground/20 mb-8 font-bold">{t.history_section.title}</h2>
                                    <div className="space-y-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                                        {[...pastInscripciones, ...pastRentals].sort((a, b) => new Date(b.fecha_reserva || b.ediciones_curso?.fecha_inicio || 0).getTime() - new Date(a.fecha_reserva || a.ediciones_curso?.fecha_inicio || 0).getTime()).slice(0, 3).map((item: any) => (
                                            <div key={item.id} className="flex justify-between items-center py-4 border-b border-white/5 last:border-0 text-sm">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-8 h-8 bg-white/5 flex items-center justify-center text-xs rounded-sm">✓</div>
                                                    <div>
                                                        <div className="text-white/60 font-medium">
                                                            {item.cursos ? (locale === 'es' ? item.cursos.nombre_es : item.cursos.nombre_eu) : (item.servicios_alquiler ? (locale === 'es' ? item.servicios_alquiler.nombre_es : item.servicios_alquiler.nombre_eu) : 'Actividad pasada')}
                                                        </div>
                                                        <div className="text-[10px] text-white/20 uppercase tracking-tighter">
                                                            {formatDate(item.fecha_reserva || item.ediciones_curso?.fecha_inicio)}
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className="text-[10px] uppercase tracking-widest text-white/20">{t.history_section.completed}</span>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>

                        <div className="lg:col-span-1 space-y-8">
                            <DailyNauticalQuote locale={locale} />
                            <DailyChallengeWidget locale={locale} />
                            <QuickContact />
                        </div>
                    </div>
                </main>
            </div>

            <BonoPurchaseModal
                isOpen={isBonoModalOpen}
                onClose={() => setIsBonoModalOpen(false)}
                locale={locale}
            />
        </div>
    );
}
