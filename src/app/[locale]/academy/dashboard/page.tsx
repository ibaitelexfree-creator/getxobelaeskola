'use client';

import React, { useEffect, useState } from 'react';
import WaveAnimation from '@/components/ui/WaveAnimation';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { X, Book, Ship, Globe, Anchor, Wind, Shield, ChevronRight } from 'lucide-react';
import { useNotificationStore } from '@/lib/store/useNotificationStore';
import dynamic from 'next/dynamic';

const CertificateCard = dynamic(() => import('@/components/academy/CertificateCard'), { ssr: false });
const EmptyState = dynamic(() => import('@/components/academy/EmptyState'), { ssr: false });
const RankProgress = dynamic(() => import('@/components/academy/gamification/RankProgress'), { ssr: false });
const ActivityHeatmap = dynamic(() => import('@/components/academy/dashboard/ActivityHeatmap'), { ssr: false });
const SkillRadar = dynamic(() => import('@/components/academy/dashboard/SkillRadar'), { ssr: false });
const BoatMastery = dynamic(() => import('@/components/academy/dashboard/BoatMastery'), { ssr: false });
const NauticalRadar = dynamic(() => import('@/components/academy/dashboard/NauticalRadar'), { ssr: false });
const CareerAdvisor = dynamic(() => import('@/components/academy/dashboard/CareerAdvisor'), { ssr: false });
const NavigationExperienceMap = dynamic(() => import('@/components/academy/dashboard/NavigationExperienceMap'), { ssr: false });
const DailyChallengeWidget = dynamic(() => import('@/components/academy/dashboard/DailyChallengeWidget'), { ssr: false });
const AchievementsWidget = dynamic(() => import('@/components/academy/dashboard/AchievementsWidget'), { ssr: false });

import AcademySkeleton from '@/components/academy/AcademySkeleton';
import { getRank, calculateEstimatedXP } from '@/lib/gamification/ranks';
import NotificationContainer from '@/components/academy/notifications/NotificationContainer';
import AchievementToast from '@/components/academy/notifications/AchievementToast';
import SkillUnlockedModal from '@/components/academy/notifications/SkillUnlockedModal';
import { apiUrl } from '@/lib/api';

// --- Interfaces ---

interface Habilidad {
    id: string;
    slug: string;
    nombre_es: string;
    nombre_eu: string;
    descripcion_es: string;
    descripcion_eu: string;
    icono: string;
    categoria: string;
}

interface Logro {
    id: string;
    slug: string;
    nombre_es: string;
    nombre_eu: string;
    descripcion_es: string;
    descripcion_eu: string;
    icono: string;
    puntos: number;
    rareza: string;
}

interface Curso {
    id: string;
    slug: string;
    nombre_es: string;
    nombre_eu: string;
    descripcion_es: string;
    descripcion_eu: string;
    imagen_url: string;
    nivel_formacion_id: string;
}

interface ProgresoItem {
    id: string;
    tipo_entidad: 'nivel' | 'curso' | 'modulo' | 'unidad';
    entidad_id: string;
    estado: 'bloqueado' | 'disponible' | 'en_progreso' | 'completado';
    porcentaje: number;
    updated_at: string;
    secciones_vistas?: any;
}

interface Stats {
    horas_totales: number;
    puntos_totales: number;
    niveles_completados: number;
    progreso_global: number;
    habilidades_desbloqueadas: number;
    logros_obtenidos: number;
    racha_dias: number;
    posicion_ranking: number;
    proximo_logro: any;
    activity_heatmap: any[];
    skill_radar: any[];
    boat_mastery: any[];
}

interface LogroItem {
    logro: {
        id: string;
        nombre_es: string;
        nombre_eu: string;
        descripcion_es: string;
        descripcion_eu: string;
        icono: string;
        puntos: number;
        rareza: string;
    };
    fecha_obtencion: string;
}

interface HabilidadItem {
    habilidad: {
        id: string;
        nombre_es: string;
        nombre_eu: string;
        descripcion_es: string;
        descripcion_eu: string;
        icono: string;
        categoria: string;
    };
    fecha_obtencion: string;
}

interface DashboardData {
    user: {
        full_name: string;
        avatar_url: string;
    };
    progreso: any[];
    habilidades: HabilidadItem[];
    logros: LogroItem[];
    estadisticas: Stats;
    horas: any[];
    certificados: any[];
    is_staff: boolean;
    enrolledCourseIds: string[];
    recommendations?: any[];
}

export default function DashboardPage({ params }: { params: { locale: string } }) {
    // Hooks
    const t = useTranslations('academy');
    const [data, setData] = useState<DashboardData | null>(null);
    const [cursos, setCursos] = useState<Curso[]>([]);
    const [loading, setLoading] = useState(true);
    const { addNotification, clearNotifications } = useNotificationStore();

    let MOTIVATIONAL_QUOTES: string[] = [];
    try {
        MOTIVATIONAL_QUOTES = (t.raw('motivational_quotes') as string[]) || [];
    } catch (e) {
        MOTIVATIONAL_QUOTES = [
            "El que no sabe a qué puerto quiere navegar, nunca tiene viento a favor.",
            "Un mar tranquilo nunca hizo un navegante habilidoso."
        ];
    }

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
        async function fetchData() {
            try {
                const resProgreso = await fetch(apiUrl(`/api/academy/progress?locale=${params.locale}`));
                const progressData = await resProgreso.json();

                if (progressData.error) throw new Error(progressData.error);
                setData(progressData);

                const resCursos = await fetch(apiUrl('/api/academy/courses'));
                const coursesData = await resCursos.json();
                setCursos(coursesData.cursos || []);

                // Clear any previous notifications to ensure only one quote is shown
                clearNotifications();

                const randomQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
                addNotification({
                    type: 'info',
                    title: '¡Buen viento, Navegante!',
                    message: randomQuote,
                    icon: '🧭',
                    duration: 12000 // Doubled duration as requested
                });

            } catch (error) {
                console.error('Error cargando dashboard:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    useEffect(() => {
        if (!data) return;

        const lastSeenLogros = JSON.parse(localStorage.getItem('seen_logros') || '[]');
        const currentLogros = data.logros.map(l => l.logro.id);
        const newLogros = data.logros.filter(l => !lastSeenLogros.includes(l.logro.id));

        newLogros.forEach(l => {
            addNotification({
                type: 'achievement',
                title: l.logro.nombre_es,
                message: l.logro.descripcion_es,
                icon: l.logro.icono,
                data: { rareza: l.logro.rareza, puntos: l.logro.puntos }
            });
        });

        if (newLogros.length > 0) {
            localStorage.setItem('seen_logros', JSON.stringify(currentLogros));
        }

        const lastSeenSkills = JSON.parse(localStorage.getItem('seen_skills') || '[]');
        const currentSkills = data.habilidades.map(s => s.habilidad.id);
        const newSkills = data.habilidades.filter(s => !lastSeenSkills.includes(s.habilidad.id));

        newSkills.forEach(s => {
            addNotification({
                type: 'skill',
                title: s.habilidad.nombre_es,
                message: s.habilidad.descripcion_es,
                icon: s.habilidad.icono,
                data: { category: s.habilidad.categoria }
            });
        });

        if (newSkills.length > 0) {
            localStorage.setItem('seen_skills', JSON.stringify(currentSkills));
        }
    }, [data, addNotification]);

    if (loading) {
        return <AcademySkeleton />;
    }

    if (!data) {
        return (
            <div className="min-h-screen bg-nautical-black flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center text-accent mb-6">
                    <X size={40} />
                </div>
                <h2 className="text-2xl font-display text-foreground mb-2 italic">No se pudo cargar tu bitácora</h2>
                <p className="text-foreground/60 mb-8 max-w-xs">Parece que hay un problema de conexión o tu sesión ha expirado.</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-8 py-3 bg-accent text-nautical-black font-black uppercase tracking-widest text-xs rounded"
                >
                    Reintentar
                </button>
                <Link href={`/${params.locale}/student/dashboard`} className="mt-4 text-foreground/20 text-[10px] uppercase tracking-widest hover:text-foreground transition-colors">
                    Volver al Panel Principal
                </Link>
            </div>
        );
    }

    const currentXP = calculateEstimatedXP(data.progreso, data.logros);
    const currentRank = getRank(currentXP);

    const cursoActivoProgreso = data.progreso
        .filter(p => p.tipo_entidad === 'curso' && p.estado === 'en_progreso')
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0];

    let cursoMostrado: Curso | undefined = undefined;
    let progresoCursoMostrado: any = undefined;

    if (cursoActivoProgreso) {
        cursoMostrado = cursos.find(c => c.id === cursoActivoProgreso.entidad_id);
        progresoCursoMostrado = cursoActivoProgreso;
    } else if (data.is_staff) {
        cursoMostrado = cursos[0];
        progresoCursoMostrado = data.progreso.find(p => p.entidad_id === cursoMostrado?.id) || { porcentaje: 0, estado: 'disponible' };
    } else if (data.enrolledCourseIds && data.enrolledCourseIds.length > 0) {
        cursoMostrado = cursos.find(c => data.enrolledCourseIds.includes(c.id));
        progresoCursoMostrado = data.progreso.find(p => p.entidad_id === cursoMostrado?.id) || { porcentaje: 0, estado: 'disponible' };
    } else {
        cursoMostrado = cursos[0];
        progresoCursoMostrado = { porcentaje: 0, estado: 'no_inscrito' };
    }

    const todasUnidades = data.progreso.filter(p => p.tipo_entidad === 'unidad');
    const proximaUnidadProgreso = todasUnidades.find(p => p.estado === 'disponible' || p.estado === 'en_progreso');

    const skillsCount = data.estadisticas.habilidades_desbloqueadas;
    const skillsPercent = (skillsCount / 12) * 100;
    const totalMiles = (data.estadisticas.horas_totales * 5.2).toFixed(1);

    const getNextMilestone = (count: number) => {
        if (count < 1) return { name: 'Marinero', target: 1 };
        if (count < 4) return { name: 'Timonel', target: 4 };
        if (count < 7) return { name: 'Patrón', target: 7 };
        if (count < 10) return { name: 'Capitán', target: 10 };
        return null;
    };

    const nextMilestone = getNextMilestone(skillsCount);

    return (
        <div className="min-h-screen relative bg-background text-foreground pb-20 overflow-hidden">
            <WaveAnimation />
            <h1 className="sr-only">Dashboard de Academia | Getxo Bela Eskola</h1>
            <NotificationContainer />
            <AchievementToast />
            <SkillUnlockedModal />

            {/* Header / Resumen General */}
            <div className="relative overflow-hidden border-b border-card-border bg-card backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-transparent" />
                <div className="container mx-auto px-6 py-12 relative">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="w-full md:w-auto">
                            <RankProgress currentXP={currentXP} currentRank={currentRank} />
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-4xl font-display italic text-foreground mb-2 leading-none">
                                Hola, <span className="text-accent">{data.user?.full_name?.split(' ')[0] || 'Navegante'}</span>
                            </h1>

                            <div className="flex flex-col gap-2 mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-foreground/60">Camino a Capitán</div>
                                    <div className="h-1.5 w-32 bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-accent" style={{ width: `${skillsPercent}%` }} />
                                    </div>
                                    <div className="text-[10px] font-bold text-accent">{skillsCount}/12 SKILLS</div>
                                </div>
                                {nextMilestone && (
                                    <div className="text-[10px] text-foreground/60 italic">
                                        🎯 Próximo Rango: <span className="text-foreground font-bold">{nextMilestone.name}</span>
                                        {` (faltan ${nextMilestone.target - skillsCount} habilidades)`}
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="p-4 rounded-lg bg-card border border-card-border animate-fade-in" style={{ animationDelay: '0.1s' }}>
                                    <div className="text-2xl font-bold text-foreground mb-1">{data.estadisticas.progreso_global}%</div>
                                    <div className="text-xs uppercase tracking-wider text-foreground/60">Progreso Total</div>
                                </div>
                                <div className="p-4 rounded-lg bg-card border border-amber-500/20 animate-fade-in shadow-[0_0_15px_rgba(245,158,11,0.05)]" style={{ animationDelay: '0.2s' }}>
                                    <div className="text-2xl font-bold text-amber-500 mb-1 flex items-center gap-2">
                                        🔥 {data.estadisticas.racha_dias}
                                    </div>
                                    <div className="text-xs uppercase tracking-wider text-foreground/60">Días de Racha</div>
                                </div>
                                <div className="p-4 rounded-lg bg-card border border-card-border animate-fade-in" style={{ animationDelay: '0.3s' }}>
                                    <div className="text-2xl font-bold text-foreground mb-1">{(data.estadisticas.horas_totales * 5.2).toFixed(0)} <span className="text-xs text-accent">nm</span></div>
                                    <div className="text-xs uppercase tracking-wider text-foreground/60">Millas Navegadas</div>
                                </div>
                                <div className="p-4 rounded-lg bg-card border border-card-border animate-fade-in" style={{ animationDelay: '0.4s' }}>
                                    <div className="text-2xl font-bold text-foreground mb-1">#{data.estadisticas.posicion_ranking}</div>
                                    <div className="text-xs uppercase tracking-wider text-foreground/60">Ranking</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-8">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {[
                        {
                            id: 'logbook',
                            label: 'Bitácora',
                            icon: <Book className="w-5 h-5" />,
                            color: 'text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20',
                            href: `/${params.locale}/academy/logbook`
                        },
                        {
                            id: 'nomenclature',
                            label: 'Partes',
                            icon: <Ship className="w-5 h-5" />,
                            color: 'text-amber-500 bg-amber-500/10 hover:bg-amber-500/20',
                            href: `/${params.locale}/academy/tools/nomenclature`
                        },
                        {
                            id: 'chart-plotter',
                            label: 'Navegación',
                            icon: <Globe className="w-5 h-5" />,
                            color: 'text-blue-400 bg-blue-500/10 hover:bg-blue-500/20',
                            href: `/${params.locale}/academy/tools/chart-plotter`
                        },
                        {
                            id: 'knots',
                            label: 'Nudos',
                            icon: <Anchor className="w-5 h-5" />,
                            color: 'text-orange-400 bg-orange-500/10 hover:bg-orange-500/20',
                            href: `/${params.locale}/academy/tools/knots`
                        },
                        {
                            id: 'wind-lab',
                            label: 'Viento',
                            icon: <Wind className="w-5 h-5" />,
                            color: 'text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20',
                            href: `/${params.locale}/academy/tools/wind-lab`
                        },
                        {
                            id: 'skills',
                            label: 'Seguridad',
                            icon: <Shield className="w-5 h-5" />,
                            color: 'text-red-400 bg-red-500/10 hover:bg-red-500/20',
                            href: `/${params.locale}/academy/skills`
                        }
                    ].map((tool) => (
                        <Link
                            key={tool.id}
                            href={tool.href}
                            prefetch={false}
                            className={`flex flex-col items-center justify-center p-4 rounded-xl border border-card-border transition-all duration-300 group ${tool.color}`}
                        >
                            <div className="mb-2 transition-transform group-hover:scale-110">
                                {tool.icon}
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest">{tool.label}</span>
                        </Link>
                    ))}
                </div>
            </div>

            <div className="container mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-12">
                    <CareerAdvisor recommendations={data.recommendations || []} />
                    <ActivityHeatmap data={data.estadisticas.activity_heatmap || []} />

                    <NavigationExperienceMap sessions={data.horas || []} />

                    {/* Certificates Section */}
                    {data.certificados && data.certificados.length > 0 && (
                        <section>
                            <h2 className="text-xl font-display italic mb-6 flex items-center gap-3">
                                <span className="text-accent">▶</span> Certificados & Diplomas
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {data.certificados.map((cert: any) => (
                                    <CertificateCard
                                        key={cert.id}
                                        certificate={cert}
                                        studentName={data.user?.full_name}
                                        locale={params.locale}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    <section>
                        <h2 className="text-xl font-display italic mb-6 flex items-center gap-3">
                            <span className="text-accent">▶</span> En Curso
                        </h2>
                        {cursoMostrado ? (
                            <div className="group relative overflow-hidden rounded-xl border border-card-border bg-card hover:border-accent/40 transition-all duration-300">
                                <div className="p-8">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <span className="text-xs font-bold uppercase tracking-widest text-accent mb-2 block">Curso Actual</span>
                                            <h3 className="text-3xl font-display text-foreground mb-2">{params.locale === 'eu' ? cursoMostrado.nombre_eu : cursoMostrado.nombre_es}</h3>
                                            <p className="text-foreground/60 line-clamp-2">{params.locale === 'eu' ? cursoMostrado.descripcion_eu : cursoMostrado.descripcion_es}</p>
                                        </div>
                                    </div>
                                    <div className="mb-6">
                                        <div className="flex justify-between text-xs mb-2">
                                            <span className="text-foreground/60">Progreso del curso</span>
                                            <span className="text-foreground font-bold">{Math.round(progresoCursoMostrado?.porcentaje || 0)}%</span>
                                        </div>
                                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                            <div className="h-full bg-accent transition-all duration-1000 ease-out" style={{ width: `${progresoCursoMostrado?.porcentaje || 0}%` }} />
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <Link href={`/${params.locale}/academy/course/${cursoMostrado.slug}`} className="px-6 py-3 bg-accent text-nautical-black font-bold uppercase tracking-wider text-sm rounded">Continuar →</Link>
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </section>
                </div>

                <div className="space-y-12">
                    <NauticalRadar userRankSlug={currentRank.id} locale={params.locale} />
                    <DailyChallengeWidget locale={params.locale} />
                    <AchievementsWidget logros={data.logros || []} locale={params.locale} />
                    <SkillRadar skills={data.estadisticas.skill_radar || []} />
                    <BoatMastery data={data.estadisticas.boat_mastery || []} />
                </div>
            </div>
        </div>
    );
}
