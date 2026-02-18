'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useAcademyData } from '@/hooks/useAcademyData';
import { useNotificationStore } from '@/lib/store/useNotificationStore';
import AcademySkeleton from '@/components/academy/AcademySkeleton';
import { Compass, Book, Ship, Anchor, Globe, Shield, Wind, ChevronRight } from 'lucide-react';

export default function AcademyMain({ params }: { params: { locale: string } }) {
    const t = useTranslations('academy');
    const { niveles, progreso, cursosPorNivel, enrollments, loading, error, getEstadoNivel } = useAcademyData();
    const { addNotification } = useNotificationStore();

    const locale = params.locale;

    const ACADEMY_TOOLS = [
        {
            id: 'logbook',
            label: 'Bitácora',
            desc: 'Tu diario de navegación personal',
            icon: <Book className="w-6 h-6" />,
            color: 'bg-emerald-500/10 text-emerald-400',
            href: `/${locale}/academy/logbook`
        },
        {
            id: 'nomenclature',
            label: 'Partes del Barco',
            desc: 'Aprende la anatomía del velero',
            icon: <Ship className="w-6 h-6" />,
            color: 'bg-amber-500/10 text-amber-500',
            href: `/${locale}/academy/tools/nomenclature`
        },
        {
            id: 'chart-plotter',
            label: 'Navegación',
            desc: 'Cartografía e instrumentos digitales',
            icon: <Globe className="w-6 h-6" />,
            color: 'bg-blue-500/10 text-blue-400',
            href: `/${locale}/academy/tools/chart-plotter`
        },
        {
            id: 'knots',
            label: 'Taller de Nudos',
            desc: 'Domina el arte de la cabuyería',
            icon: <Anchor className="w-6 h-6" />,
            color: 'bg-orange-500/10 text-orange-400',
            href: `/${locale}/academy/tools/knots`
        },
        {
            id: 'wind-lab',
            label: 'Meteorología',
            desc: 'Laboratorio táctico de viento',
            icon: <Wind className="w-6 h-6" />,
            color: 'bg-cyan-500/10 text-cyan-400',
            href: `/${locale}/academy/tools/wind-lab`
        },
        {
            id: 'skills',
            label: 'Seguridad',
            desc: 'Habilidades técnicas esenciales',
            icon: <Shield className="w-6 h-6" />,
            color: 'bg-red-500/10 text-red-400',
            href: `/${locale}/academy/skills`
        }
    ];

    useEffect(() => {
        if (error) {
            addNotification({
                type: 'error',
                title: 'Error de conexión',
                message: 'No se pudieron cargar los datos de la academia.',
                icon: '⚠️'
            });
        }
    }, [error, addNotification]);

    if (loading) {
        return <AcademySkeleton />;
    }

    return (
        <div className="min-h-screen bg-premium-mesh text-white pb-32">
            {/* Elegant Header */}
            <header className="relative overflow-hidden border-b border-white/10 bg-white/5 backdrop-blur-md pt-24 pb-16">
                <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
                <div className="container mx-auto px-6 relative">
                    <div className="max-w-4xl animate-premium-in">
                        <span className="text-accent uppercase tracking-[1em] text-[10px] font-black block mb-6 drop-shadow-sm" aria-hidden="true">
                            Escuela Náutica Digital
                        </span>
                        <h1 className="text-4xl md:text-8xl font-display italic text-white mb-8 leading-tight">
                            Tu Viaje de <span className="text-accent underline decoration-accent/20 underline-offset-[16px]">Formación</span>
                        </h1>
                        <p className="text-lg md:text-xl text-white/70 leading-relaxed max-w-2xl font-light">
                            Explora los 7 niveles de excelencia náutica. Cada etapa desbloquea nuevos conocimientos,
                            desde los fundamentos del mar hasta el mando de grandes embarcaciones.
                        </p>
                    </div>
                </div>
            </header>

            {/* Level Map Grid */}
            <main className="container mx-auto px-6 py-24">
                <div className="max-w-6xl mx-auto space-y-32">
                    {/* ... (Level cards) */}
                    <section className="space-y-12">
                        {error && niveles.length === 0 && (
                            <div className="text-center py-20 animate-fade-in">
                                <div className="inline-block p-6 glass-card border-red-500/20 bg-red-500/5 mb-8">
                                    <span className="text-4xl mb-4 block">⚠️</span>
                                    <h2 className="text-xl font-display italic text-white mb-2">Error de Conexión</h2>
                                    <p className="text-white/50 text-sm max-w-sm mx-auto mb-6">
                                        No hemos podido establecer comunicación con la bitácora académica.
                                        Por favor, comprueba tu conexión y vuelve a intentarlo.
                                    </p>
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="px-8 py-3 bg-accent text-nautical-black text-xs font-black uppercase tracking-widest hover:bg-white transition-all"
                                    >
                                        Recargar Bitácora ⚓
                                    </button>
                                </div>
                                <p className="text-[10px] font-mono text-white/20 uppercase tracking-[0.3em]">
                                    ID CAUSA: {error}
                                </p>
                            </div>
                        )}

                        {niveles.map((nivel, index) => {
                            const estado = getEstadoNivel(nivel);
                            const progresoNivel = progreso.find(p => p.nivel_id === nivel.id);
                            const porcentaje = progresoNivel?.porcentaje || 0;
                            const isLocked = estado === 'bloqueado' && Number(nivel.orden) !== 1;
                            const nivelCursos = cursosPorNivel[nivel.id] || [];

                            const isPaywallLocked = isLocked && nivelCursos.length > 0 && !nivelCursos.some(c => enrollments.includes(c.id));

                            let targetHref = '#';
                            if (isPaywallLocked && nivelCursos.length > 0) {
                                targetHref = `/${params.locale}/courses/${nivelCursos[0].slug}`;
                            } else if (!isLocked) {
                                if (nivelCursos.length > 0) {
                                    targetHref = `/${params.locale}/academy/course/${nivelCursos[0].slug}`;
                                } else {
                                    targetHref = `/${params.locale}/academy/level/${nivel.slug}`;
                                }
                            }

                            const prereqNames = (nivel.prerequisitos || [])
                                .map(id => niveles.find(n => n.id === id))
                                .filter(Boolean)
                                .map(n => params.locale === 'eu' ? n!.nombre_eu : n!.nombre_es);

                            const ariaLabel = isPaywallLocked
                                ? `${nivel.nombre_es}. Curso no adquirido. Ir a página de compra.`
                                : isLocked
                                    ? `${nivel.nombre_es}. Nivel bloqueado. Requiere: ${prereqNames.join(', ')}.`
                                    : `${nivel.nombre_es}. Nivel ${estado}. Ver cursos disponibles.`;

                            return (
                                <div key={nivel.id} className="relative group">
                                    {index < niveles.length - 1 && (
                                        <div className="absolute left-[60px] top-[140px] w-px h-16 bg-gradient-to-b from-accent/20 to-transparent hidden lg:block" aria-hidden="true" />
                                    )}

                                    <Link
                                        href={targetHref}
                                        className={`block outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-nautical-black rounded-sm group ${(isLocked && !isPaywallLocked) ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                        aria-label={ariaLabel}
                                        onClick={(e) => (isLocked && !isPaywallLocked) && e.preventDefault()}
                                        prefetch={false}
                                    >
                                        <article className={`
                                            relative p-8 lg:p-12 glass-card overflow-hidden transition-all duration-700
                                            ${isLocked ? 'opacity-40 grayscale blur-[1px] hover:blur-0 hover:opacity-60' : 'hover:scale-[1.01] hover:border-accent/40'}
                                            ${estado === 'completado' ? 'border-accent/40 bg-accent/[0.03]' : ''}
                                        `}>
                                            <div className={`absolute top-0 right-0 w-64 h-64 blur-[100px] -translate-y-1/2 translate-x-1/2 rounded-full pointer-events-none transition-opacity duration-700
                                                ${estado === 'completado' ? 'bg-accent/20 opacity-100' : 'bg-white/5 opacity-0 group-hover:opacity-100'}
                                            `} aria-hidden="true" />

                                            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-10 relative z-10">
                                                <div className="flex-shrink-0">
                                                    <div className={`
                                                        w-24 h-24 lg:w-32 lg:h-32 rounded-full flex items-center justify-center text-4xl lg:text-6xl
                                                        border-2 transition-all duration-700
                                                        ${isLocked ? 'bg-white/5 border-white/10' : 'bg-accent/10 border-accent/40 group-hover:bg-accent/20 group-hover:border-accent'}
                                                        ${estado === 'completado' ? 'bg-accent/30 border-accent scale-110 shadow-[0_0_30px_rgba(255,77,0,0.2)]' : ''}
                                                    `} aria-hidden="true">
                                                        {isLocked ? '🔒' : nivel.icono}
                                                    </div>
                                                    <div className="text-center mt-4">
                                                        <span className="text-sm uppercase tracking-[0.4em] text-white/40 font-black">
                                                            Nivel {nivel.orden}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex-1 text-center lg:text-left">
                                                    <header className="mb-4">
                                                        <h2 className="text-3xl lg:text-5xl font-display italic text-white mb-4 group-hover:text-accent transition-colors leading-tight">
                                                            {params.locale === 'eu' ? nivel.nombre_eu : nivel.nombre_es}
                                                        </h2>
                                                        {isLocked && prereqNames.length > 0 ? (
                                                            <div className="bg-red-500/10 border border-red-500/20 rounded-sm py-2 px-4 mb-4 inline-block">
                                                                <p className="text-[10px] font-black uppercase tracking-widest text-red-400">
                                                                    Requiere completar: {prereqNames.join(', ')}
                                                                </p>
                                                            </div>
                                                        ) : (
                                                            <p className="text-lg text-white/60 font-light leading-relaxed max-w-2xl">
                                                                {params.locale === 'eu' ? nivel.descripcion_eu : nivel.descripcion_es}
                                                            </p>
                                                        )}
                                                    </header>

                                                    {!isLocked && (
                                                        <div className="flex flex-wrap justify-center lg:justify-start gap-8 text-sm uppercase tracking-widest font-bold text-white/60">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-accent text-lg">📚</span> {nivel.duracion_teorica_h}h Teoría
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-accent text-lg">⛵</span> {nivel.duracion_practica_h}h Práctica
                                                            </div>
                                                        </div>
                                                    )}

                                                    {!isLocked && (estado === 'en_progreso' || (porcentaje > 0 && porcentaje < 100)) && (
                                                        <div className="mt-8 max-w-sm mx-auto lg:mx-0" aria-label={`Progreso: ${porcentaje}%`}>
                                                            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-accent transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(255,191,0,0.5)]"
                                                                    style={{ width: `${porcentaje}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-[9px] uppercase tracking-[0.3em] font-black text-accent mt-2 block">
                                                                {porcentaje}% COMPLETADO
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex-shrink-0 pt-2 lg:min-w-[140px] text-right">
                                                    {estado === 'completado' && (
                                                        <div className="inline-block px-6 py-2 bg-accent text-nautical-black text-xs font-black uppercase tracking-[0.2em] rounded-sm shadow-xl animate-fade-in">
                                                            ✓ Alcanzado
                                                        </div>
                                                    )}

                                                    {isPaywallLocked && (
                                                        <div className="inline-block px-6 py-2 bg-accent/10 border border-accent/40 text-accent text-xs font-black uppercase tracking-[0.2em] rounded-sm flex items-center justify-center gap-2 animate-pulse">
                                                            <span>🛍️</span> Adquirir
                                                        </div>
                                                    )}

                                                    {isLocked && !isPaywallLocked && (
                                                        <div className="inline-block px-6 py-2 bg-white/5 border border-white/10 text-white/30 text-xs font-black uppercase tracking-[0.2em] rounded-sm flex items-center justify-center gap-2">
                                                            <span>🔒</span> Bloqueado
                                                        </div>
                                                    )}

                                                    {!isLocked && estado !== 'completado' && (
                                                        <div className="text-accent font-black text-sm uppercase tracking-widest mt-4 lg:mt-0 lg:opacity-0 lg:group-hover:opacity-100 lg:translate-x-4 lg:group-hover:translate-x-0 transition-all duration-500 whitespace-nowrap">
                                                            {nivel.orden === 1 ? 'Iniciar Aventura' : 'Siguiente Paso →'}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </article>
                                    </Link>
                                </div>
                            );
                        })}
                    </section>

                    {/* Tools Section */}
                    <section className="animate-fade-in">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-display text-white mb-4 italic">Herramientas de <span className="text-accent">Navegación</span></h2>
                            <p className="text-white/40 uppercase tracking-widest text-[10px] font-black">Instrumentos esenciales para tu formación</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {ACADEMY_TOOLS.map((tool) => (
                                <Link
                                    key={tool.id}
                                    href={tool.href}
                                    prefetch={false}
                                    className="group bg-white/[0.03] border border-white/10 rounded-2xl p-6 hover:bg-white/[0.07] hover:border-accent/30 transition-all duration-500 flex flex-col items-center text-center gap-4"
                                >
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg ${tool.color}`}>
                                        {tool.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold mb-1 tracking-tight group-hover:text-accent transition-colors">{tool.label}</h3>
                                        <p className="text-white/40 text-[10px] uppercase tracking-wider">{tool.desc}</p>
                                    </div>
                                    <div className="mt-2 text-accent opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                                        <ChevronRight size={18} />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
