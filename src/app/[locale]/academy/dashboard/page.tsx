'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useNotificationStore } from '@/lib/store/useNotificationStore';
import CertificateCard from '@/components/academy/CertificateCard';
import EmptyState from '@/components/academy/EmptyState';
import AcademySkeleton from '@/components/academy/AcademySkeleton';
import RankProgress from '@/components/academy/gamification/RankProgress';
import { getRank, calculateEstimatedXP } from '@/lib/gamification/ranks';
import ActivityHeatmap from '@/components/academy/dashboard/ActivityHeatmap';
import SkillRadar from '@/components/academy/dashboard/SkillRadar';
import BoatMastery from '@/components/academy/dashboard/BoatMastery';
import NotificationContainer from '@/components/academy/notifications/NotificationContainer';
import AchievementToast from '@/components/academy/notifications/AchievementToast';
import SkillUnlockedModal from '@/components/academy/notifications/SkillUnlockedModal';
import NauticalRadar from '@/components/academy/dashboard/NauticalRadar';
import CareerAdvisor from '@/components/academy/dashboard/CareerAdvisor';
import NavigationExperienceMap from '@/components/academy/dashboard/NavigationExperienceMap';
import DailyChallengeWidget from '@/components/academy/dashboard/DailyChallengeWidget';

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
    const t = useTranslations('academy'); // Fallback to 'academy' namespace
    const [data, setData] = useState<DashboardData | null>(null);
    const [cursos, setCursos] = useState<Curso[]>([]);
    const [loading, setLoading] = useState(true);
    const { addNotification } = useNotificationStore();

    // Use try/catch because t.raw might fail if the key is missing or not an array
    let MOTIVATIONAL_QUOTES: string[] = [];
    try {
        MOTIVATIONAL_QUOTES = (t.raw('motivational_quotes') as string[]) || [];
    } catch (e) {
        MOTIVATIONAL_QUOTES = [
            "El que no sabe a qué puerto quiere navegar, nunca tiene viento a favor.",
            "Un mar tranquilo nunca hizo un navegante habilidoso."
        ];
    }

    // Fetch data
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
        async function fetchData() {
            try {
                // 1. Obtener progreso
                const resProgreso = await fetch('/api/academy/progress');
                const progressData = await resProgreso.json();

                if (progressData.error) throw new Error(progressData.error);
                setData(progressData);

                // 2. Obtener cursos para mostrar nombres
                const resCursos = await fetch('/api/academy/courses');
                const coursesData = await resCursos.json();
                setCursos(coursesData.cursos || []);

                // 3. Mostrar mensaje motivacional
                const randomQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
                addNotification({
                    type: 'info',
                    title: '¡Buen viento, Navegante!',
                    message: randomQuote,
                    icon: '🧭',
                    duration: 6000
                });

            } catch (error) {
                console.error('Error cargando dashboard:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    // Detect new achievements/skills to notify
    useEffect(() => {
        if (!data) return;

        // Check for new achievements
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

        // Check for new skills
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

    if (!data) return null;

    const currentXP = calculateEstimatedXP(data.progreso, data.logros);
    const currentRank = getRank(currentXP);

    // Identificar curso activo
    const cursoActivoProgreso = data.progreso
        .filter(p => p.tipo_entidad === 'curso' && p.estado === 'en_progreso')
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0];

    // Si no hay curso en progreso, buscar el primer curso inscrito
    let cursoMostrado: Curso | undefined = undefined;
    let progresoCursoMostrado: any = undefined;

    if (cursoActivoProgreso) {
        cursoMostrado = cursos.find(c => c.id === cursoActivoProgreso.entidad_id);
        progresoCursoMostrado = cursoActivoProgreso;
    } else if (data.is_staff) {
        // Staff has access to everything, show first course as available
        cursoMostrado = cursos[0];
        progresoCursoMostrado = data.progreso.find(p => p.entidad_id === cursoMostrado?.id) || { porcentaje: 0, estado: 'disponible' };
    } else if (data.enrolledCourseIds && data.enrolledCourseIds.length > 0) {
        // Mostrar el primer curso inscrito que el usuario tenga
        cursoMostrado = cursos.find(c => data.enrolledCourseIds.includes(c.id));
        progresoCursoMostrado = data.progreso.find(p => p.entidad_id === cursoMostrado?.id) || { porcentaje: 0, estado: 'disponible' };
    } else {
        // No está inscrito en nada
        cursoMostrado = cursos[0];
        progresoCursoMostrado = { porcentaje: 0, estado: 'no_inscrito' };
    }

    // Calcular "Siguiente Unidad"
    const todasUnidades = data.progreso.filter(p => p.tipo_entidad === 'unidad');
    const proximaUnidadProgreso = todasUnidades.find(p => p.estado === 'disponible' || p.estado === 'en_progreso');

    // Percentaje skills para "Camino a Capitán"
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
        <div className="min-h-screen bg-gradient-to-b from-nautical-black via-nautical-black to-[#0a1628] text-white pb-20">
            <NotificationContainer />
            <AchievementToast />
            <SkillUnlockedModal />

            {/* Header / Resumen General */}
            <div className="relative overflow-hidden border-b border-white/10 bg-white/5 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-transparent" />
                <div className="container mx-auto px-6 py-12 relative">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        {/* Avatar / Rango */}
                        {/* Avatar / Rango replaced by RankProgress */}
                        <div className="w-full md:w-auto">
                            <RankProgress currentXP={currentXP} currentRank={currentRank} />
                        </div>

                        {/* Info Principal */}
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-4xl font-display italic text-white mb-2 leading-none">
                                Hola, <span className="text-accent">{data.user?.full_name?.split(' ')[0] || 'Navegante'}</span>
                            </h1>

                            <div className="flex flex-col gap-2 mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-white/40">Camino a Capitán</div>
                                    <div className="h-1.5 w-32 bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-accent" style={{ width: `${skillsPercent}%` }} />
                                    </div>
                                    <div className="text-[10px] font-bold text-accent">{skillsCount}/12 SKILLS</div>
                                </div>
                                {nextMilestone && (
                                    <div className="text-[10px] text-white/40 italic">
                                        🎯 Próximo Rango: <span className="text-white font-bold">{nextMilestone.name}</span>
                                        {` (faltan ${nextMilestone.target - skillsCount} habilidades)`}
                                    </div>
                                )}
                            </div>

                            {/* Estadísticas rápidas */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="p-4 rounded-lg bg-white/5 border border-white/10 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                                    <div className="text-2xl font-bold text-white mb-1">{data.estadisticas.progreso_global}%</div>
                                    <div className="text-xs uppercase tracking-wider text-white/40">Progreso Total</div>
                                </div>
                                <div className="p-4 rounded-lg bg-white/5 border border-amber-500/20 animate-fade-in shadow-[0_0_15px_rgba(245,158,11,0.05)]" style={{ animationDelay: '0.2s' }}>
                                    <div className="text-2xl font-bold text-amber-500 mb-1 flex items-center gap-2">
                                        🔥 {data.estadisticas.racha_dias}
                                    </div>
                                    <div className="text-xs uppercase tracking-wider text-white/40">Días de Racha</div>
                                </div>
                                <div className="p-4 rounded-lg bg-white/5 border border-white/10 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                                    <div className="text-2xl font-bold text-white mb-1">{(data.estadisticas.horas_totales * 5.2).toFixed(0)} <span className="text-xs text-accent">nm</span></div>
                                    <div className="text-xs uppercase tracking-wider text-white/40">Millas Navegadas</div>
                                </div>
                                <div className="p-4 rounded-lg bg-white/5 border border-white/10 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                                    <div className="text-2xl font-bold text-white mb-1">#{data.estadisticas.posicion_ranking}</div>
                                    <div className="text-xs uppercase tracking-wider text-white/40">Ranking</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">

                {/* Columna Izquierda: Actividad Principal (2/3) */}
                <div className="lg:col-span-2 space-y-12">

                    {/* 🧠 SMART CAREER ADVISOR */}
                    <CareerAdvisor recommendations={data.recommendations || []} />

                    {/* 📊 ACTIVITY HEATMAP */}
                    <ActivityHeatmap data={data.estadisticas.activity_heatmap || []} />

                    {/* 🧭 MAPA DE EXPERIENCIA NÁUTICA */}
                    <NavigationExperienceMap
                        sessions={data.horas || []}
                        locale={params.locale}
                    />

                    {/* 2️⃣ CURSO ACTIVO */}
                    <section>
                        <h2 className="text-xl font-display italic mb-6 flex items-center gap-3">
                            <span className="text-accent">▶</span> En Curso
                        </h2>

                        {cursoMostrado ? (
                            <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 hover:border-accent/40 transition-all duration-300">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="p-8">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <span className="text-xs font-bold uppercase tracking-widest text-accent mb-2 block">
                                                Curso Actual
                                            </span>
                                            <h3 className="text-3xl font-display text-white mb-2">
                                                {params.locale === 'eu' ? cursoMostrado.nombre_eu : cursoMostrado.nombre_es}
                                            </h3>
                                            <p className="text-white/60 line-clamp-2">
                                                {params.locale === 'eu' ? cursoMostrado.descripcion_eu : cursoMostrado.descripcion_es}
                                            </p>
                                        </div>
                                        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-2xl border border-white/10">
                                            ⛵
                                        </div>
                                    </div>

                                    {/* Barra de progreso */}
                                    <div className="mb-6">
                                        <div className="flex justify-between text-xs mb-2">
                                            <span className="text-white/60">Progreso del curso</span>
                                            <span className="text-white font-bold">{Math.round(progresoCursoMostrado?.porcentaje || 0)}%</span>
                                        </div>
                                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-accent transition-all duration-1000 ease-out"
                                                style={{ width: `${progresoCursoMostrado?.porcentaje || 0}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:flex-row gap-4">
                                        {progresoCursoMostrado?.estado === 'no_inscrito' ? (
                                            <Link
                                                href={`/${params.locale}/courses/${cursoMostrado.slug}`}
                                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent text-nautical-black font-bold uppercase tracking-wider text-sm rounded hover:bg-white transition-colors"
                                            >
                                                Inscribirse Ahora →
                                            </Link>
                                        ) : (
                                            <Link
                                                href={`/${params.locale}/academy/course/${cursoMostrado.slug}`}
                                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent text-nautical-black font-bold uppercase tracking-wider text-sm rounded hover:bg-white transition-colors"
                                            >
                                                {progresoCursoMostrado?.estado === 'en_progreso' ? 'Continuar Aprendiendo →' : 'Empezar Curso →'}
                                            </Link>
                                        )}

                                        {proximaUnidadProgreso && (
                                            <Link
                                                href={`/${params.locale}/academy/unit/${proximaUnidadProgreso.entidad_id}`}
                                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-white font-bold uppercase tracking-wider text-sm rounded hover:bg-white/10 transition-colors"
                                            >
                                                Siguiente Unidad 📖
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-8 rounded-xl border border-white/10 bg-white/5 text-center">
                                <p className="text-white/60">No tienes cursos activos.</p>
                                <Link
                                    href={`/${params.locale}/academy`}
                                    className="text-accent hover:underline mt-2 inline-block"
                                >
                                    Explorar cursos
                                </Link>
                            </div>
                        )}
                    </section>

                    {/* 2.1 BITÁCORA DE NAVEGACIÓN (CHART) */}
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-display italic flex items-center gap-3">
                                <span className="text-accent">📊</span> Bitácora de {totalMiles} Millas
                            </h2>
                            <Link href={`/${params.locale}/academy/logbook`} className="text-[10px] uppercase tracking-widest font-black text-accent hover:underline">
                                Ver Detalle Completo →
                            </Link>
                        </div>

                        <div className="p-8 rounded-xl border border-white/10 bg-white/5">
                            <div className="flex items-end justify-between h-40 gap-2">
                                {data.horas.slice(0, 14).reverse().map((h, i) => {
                                    const height = Math.min(100, (parseFloat(h.duracion_h) / 5) * 100); // Base 5h max
                                    return (
                                        <div key={i} className="flex-1 flex flex-col items-center group relative cursor-help">
                                            <div
                                                className="w-full bg-accent/20 rounded-t border-t border-x border-accent/40 group-hover:bg-accent/40 transition-all duration-500"
                                                style={{ height: `${height}%` }}
                                            />
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-nautical-black text-[10px] text-accent px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity border border-accent/20">
                                                {h.duracion_h}h
                                            </div>
                                            <div className="text-[8px] text-white/20 mt-2 font-mono">
                                                {new Date(h.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}
                                            </div>
                                        </div>
                                    );
                                })}
                                {data.horas.length === 0 && (
                                    <div className="w-full h-full flex items-center justify-center text-white/20 italic text-sm">
                                        Empieza a navegar para ver tu racha diaria.
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-display italic flex items-center gap-3">
                                <span className="text-accent">📜</span> Certificados ({data.certificados?.length || 0})
                            </h2>
                            <Link href={`/${params.locale}/academy/certificates`} className="text-[10px] uppercase tracking-widest font-black text-accent hover:underline">
                                Ver todos →
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {data.certificados && data.certificados.length > 0 ? (
                                data.certificados.map((cert: any) => (
                                    <CertificateCard
                                        key={cert.id}
                                        certificate={cert}
                                        studentName={data.user?.full_name || 'Navegante'}
                                        locale={params.locale}
                                    />
                                ))
                            ) : (
                                <EmptyState
                                    title="Travesía por comenzar"
                                    description="Completa un curso o nivel para obtener tu primer certificado oficial de navegación."
                                    imageUrl="/images/empty-state-no-certificates.svg"
                                    actionLabel="Explorar Academia"
                                    actionHref={`/${params.locale}/academy`}
                                />
                            )}
                        </div>
                    </section>

                </div>

                {/* Columna Derecha: Logros y Habilidades (1/3) */}
                <div className="space-y-12">

                    {/* 🌦️ NAUTICAL RADAR (PUENTE DE MANDO) */}
                    <NauticalRadar
                        userRankSlug={currentRank.id}
                        locale={params.locale}
                    />

                    {/* 🧠 RETO DIARIO (MICRO-LEARNING) */}
                    <DailyChallengeWidget locale={params.locale} />

                    {/* 📊 SKILL RADAR */}
                    <SkillRadar skills={data.estadisticas.skill_radar || []} />

                    {/* 🛠️ HERRAMIENTAS */}
                    <section>
                        <h2 className="text-xl font-display italic mb-6 flex items-center gap-3">
                            <span className="text-accent">🛠️</span> Herramientas
                        </h2>
                        <div className="grid grid-cols-1 gap-4">
                            <Link href={`/${params.locale}/academy/tools/flashcards`} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-accent/40 transition-all group flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                    🃏
                                </div>
                                <div>
                                    <h4 className="font-bold text-white group-hover:text-accent transition-colors">Flashcards</h4>
                                    <p className="text-xs text-white/40">Repaso rápido de luces y banderas</p>
                                </div>
                            </Link>
                            <Link href={`/${params.locale}/academy/tools/knots`} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-accent/40 transition-all group flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                    🪢
                                </div>
                                <div>
                                    <h4 className="font-bold text-white group-hover:text-accent transition-colors">Nudos</h4>
                                    <p className="text-xs text-white/40">Guía paso a paso</p>
                                </div>
                            </Link>
                        </div>
                    </section>

                    {/* 3️⃣ HABILIDADES */}
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-display italic flex items-center gap-3">
                                <span className="text-accent">⚡</span> Habilidades
                            </h2>
                            <Link href={`/${params.locale}/academy/skills`} className="text-[10px] uppercase tracking-widest font-black text-accent hover:underline">
                                Ver árbol →
                            </Link>
                        </div>
                        <div className="mb-4">
                            <span className="text-[10px] text-white/40 uppercase tracking-widest">Desbloqueadas: {data.estadisticas.habilidades_desbloqueadas} / 12</span>
                        </div>

                        <div className="grid grid-cols-4 gap-3">
                            {data.habilidades.map((item) => (
                                <div
                                    key={item.habilidad.id}
                                    className="aspect-square rounded-lg bg-accent/10 border border-accent/40 flex items-center justify-center text-2xl relative group cursor-help transition-all hover:bg-accent/20"
                                    title={params.locale === 'eu' ? item.habilidad.nombre_eu : item.habilidad.nombre_es}
                                >
                                    {item.habilidad.icono || '✨'}

                                    {/* Tooltip */}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[150px] p-2 bg-nautical-black border border-white/20 rounded text-xs text-white opacity-0 group-hover:opacity-100 pointer-events-none z-10 text-center transition-opacity">
                                        {params.locale === 'eu' ? item.habilidad.nombre_eu : item.habilidad.nombre_es}
                                    </div>
                                </div>
                            ))}

                            {/* Placeholders para huecos vacíos (hasta 12) */}
                            {Array.from({ length: Math.max(0, 12 - (data.habilidades?.length || 0)) }).map((_, i) => (
                                <div key={i} className="aspect-square rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/10 text-xl">
                                    🔒
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* 🛥️ TU FLOTA */}
                    <BoatMastery data={data.estadisticas.boat_mastery || []} />

                    {/* 🏆 ZONA DE INSIGNIAS (BADGES) */}
                    <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-8">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-3xl -translate-y-1/2 translate-x-1/2" />

                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-display italic text-white flex items-center gap-3">
                                    <span className="text-accent drop-shadow-[0_0_8px_rgba(255,191,0,0.4)]">🏆</span> Mis Insignias
                                </h2>
                                <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] mt-1">
                                    {data.estadisticas.logros_obtenidos} de 30 proezas alcanzadas
                                </p>
                            </div>
                            <Link
                                href={`/${params.locale}/academy/achievements`}
                                className="px-4 py-2 bg-white/5 border border-white/10 rounded text-[10px] uppercase tracking-widest font-black text-accent hover:bg-accent hover:text-nautical-black transition-all"
                            >
                                Galería →
                            </Link>
                        </div>

                        <div className="space-y-6">
                            {/* 🔥 Próximo Logro (CERCANO) */}
                            {data.estadisticas.proximo_logro && (
                                <div className="p-4 rounded-xl bg-gradient-to-r from-accent/10 to-transparent border border-accent/20">
                                    <div className="text-[9px] font-black uppercase tracking-widest text-accent/60 mb-3">En el horizonte...</div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center text-3xl grayscale opacity-30 border border-white/10">
                                            {data.estadisticas.proximo_logro.icono}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-bold text-white mb-1">
                                                {params.locale === 'eu' ? data.estadisticas.proximo_logro.nombre_eu : data.estadisticas.proximo_logro.nombre_es}
                                            </h4>
                                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                <div className="h-full bg-accent/50 animate-pulse" style={{ width: '65%' }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Grid de insignias recientes */}
                            <div className="grid grid-cols-1 gap-3">
                                {data.logros.length > 0 ? (
                                    data.logros.slice(0, 4).map((item) => (
                                        <div
                                            key={item.logro.id}
                                            className="group flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-accent/40 hover:bg-white/[0.08] transition-all duration-500"
                                        >
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 text-yellow-400 flex items-center justify-center border border-yellow-500/30 group-hover:scale-110 transition-transform shadow-lg shadow-yellow-500/5">
                                                {item.logro.icono || '🏅'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-bold text-white group-hover:text-accent transition-colors truncate">
                                                    {params.locale === 'eu' ? item.logro.nombre_eu : item.logro.nombre_es}
                                                </h4>
                                                <p className="text-xs text-white/40 truncate">
                                                    {params.locale === 'eu' ? item.logro.descripcion_eu : item.logro.descripcion_es}
                                                </p>
                                            </div>
                                            <div className="text-[9px] font-black text-accent/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                                +{item.logro.puntos}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-8 text-center border-2 border-dashed border-white/5 rounded-2xl">
                                        <div className="text-4xl mb-4 opacity-20">⚓</div>
                                        <p className="text-xs text-white/30 uppercase tracking-widest font-bold">
                                            Zarpa para obtener insignias
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
}
