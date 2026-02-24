'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { UnlockStatusBadge, UnlockStatusResponse, LockedContentOverlay } from '@/components/academy/UnlockStatusBadge';
import { apiUrl } from '@/lib/api';

interface Curso {
    id: string;
    slug: string;
    nombre_es: string;
    nombre_eu: string;
    descripcion_es: string;
    descripcion_eu: string;
    duracion_h: number;
    horas_teoricas: number;
    horas_practicas: number;
    orden_en_nivel: number;
}

interface Nivel {
    id: string;
    slug: string;
    nombre_es: string;
    nombre_eu: string;
    descripcion_es: string;
    objetivo_formativo_es: string;
    perfil_alumno_es: string;
    duracion_teorica_h: number;
    duracion_practica_h: number;
    icono: string;
    orden: number;
    descripcion_eu: string;
}

export default function LevelDetailMain({
    params
}: {
    params: { locale: string; slug: string }
}) {
    const t = useTranslations('academy');
    const [nivel, setNivel] = useState<Nivel | null>(null);
    const [cursos, setCursos] = useState<Curso[]>([]);
    const [unlockStatus, setUnlockStatus] = useState<UnlockStatusResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const resNiveles = await fetch(apiUrl('/api/academy/levels'));
                const dataNiveles = await resNiveles.json();
                const nivelActual = dataNiveles.niveles?.find((n: Nivel) => n.slug === params.slug);

                if (nivelActual) {
                    setNivel(nivelActual);
                    const resCursos = await fetch(apiUrl(`/api/academy/courses?level_id=${nivelActual.id}`));
                    const dataCursos = await resCursos.json();
                    setCursos(dataCursos.cursos || []);

                    try {
                        const resStatus = await fetch(apiUrl('/api/unlock-status'));
                        const dataStatus = await resStatus.json();
                        setUnlockStatus(dataStatus || null);
                    } catch (e) { console.error(e); }
                }
            } catch (error) { console.error(error); } finally { setLoading(false); }
        }
        fetchData();
    }, [params.slug]);

    if (loading) {
        return (
            <div className="min-h-screen bg-nautical-black flex items-center justify-center" aria-live="polite">
                <div className="text-center">
                    <div className="text-6xl mb-4 animate-bounce-slow" aria-hidden="true">⚓</div>
                    <p className="text-white/60 text-lg font-display italic">Explorando el nivel...</p>
                </div>
            </div>
        );
    }

    if (!nivel) {
        return (
            <div className="min-h-screen bg-nautical-black flex items-center justify-center text-white">
                <div className="text-center">
                    <p className="text-xl font-display italic text-white/60 mb-8">Nivel no encontrado</p>
                    <Link href={`/${params.locale}/academy`} className="btn">
                        Volver a la Academia
                    </Link>
                </div>
            </div>
        );
    }

    const currentLevelStatus = unlockStatus?.niveles?.[nivel.id];
    const isLevelLocked = currentLevelStatus === 'locked' || currentLevelStatus === 'bloqueado';

    if (isLevelLocked) {
        return (
            <div className="min-h-screen bg-nautical-black pt-20">
                <LockedContentOverlay
                    title="Nivel Bloqueado"
                    message="Debes completar los niveles previos para acceder a este conocimiento."
                    backPath={`/${params.locale}/academy`}
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-premium-mesh text-white pb-32">
            {/* Nav / Breadcrumb (Aesthetic) */}
            <nav className="container mx-auto px-6 py-8" aria-label="Breadcrumb">
                <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] font-bold text-white/40">
                    <Link href={`/${params.locale}/academy`} className="hover:text-accent transition-colors">Academia</Link>
                    <span aria-hidden="true">/</span>
                    <span className="text-white/80">Nivel {nivel.orden}</span>
                </div>
            </nav>

            {/* Premium Header */}
            <header className="container mx-auto px-6 mb-24">
                <div className="flex flex-col lg:flex-row items-center lg:items-end gap-12 animate-premium-in">
                    <div className="relative">
                        <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-full bg-accent/10 border-2 border-accent flex items-center justify-center text-7xl shadow-[0_0_50px_rgba(255,77,0,0.15)]" aria-hidden="true">
                            {nivel.icono}
                        </div>
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-accent text-nautical-black text-[9px] font-black uppercase tracking-widest rounded-sm shadow-xl">
                            NIVEL {nivel.orden}
                        </div>
                    </div>

                    <div className="text-center lg:text-left flex-1">
                        <h1 className="text-4xl lg:text-8xl font-display italic text-white mb-6 leading-tight">
                            {(params.locale === 'eu' ? nivel.nombre_eu : nivel.nombre_es) || nivel.nombre_es}
                        </h1>
                        <p className="text-xl lg:text-2xl text-white/70 font-light leading-relaxed max-w-3xl">
                            {(params.locale === 'eu' ? nivel.descripcion_eu : nivel.descripcion_es) || nivel.descripcion_es}
                        </p>
                    </div>

                    <div className="hidden xl:flex gap-12 text-right">
                        <div>
                            <span className="block text-[10px] font-black text-accent tracking-[0.4em] mb-2 uppercase">Teoría</span>
                            <span className="text-4xl font-display text-white">{nivel.duracion_teorica_h}h</span>
                        </div>
                        <div className="w-px h-16 bg-white/10" aria-hidden="true" />
                        <div>
                            <span className="block text-[10px] font-black text-accent tracking-[0.4em] mb-2 uppercase">Práctica</span>
                            <span className="text-4xl font-display text-white">{nivel.duracion_practica_h}h</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Courses List */}
            <main className="container mx-auto px-6">
                <div className="max-w-5xl mx-auto space-y-8">
                    <header className="mb-12 border-b border-white/10 pb-6 flex items-end justify-between">
                        <h2 className="text-3xl font-display italic text-white group flex items-center gap-4">
                            Cursos Disponibles
                            <span className="text-sm font-sans not-italic text-white/40 tracking-widest">({cursos.length})</span>
                        </h2>
                    </header>

                    {cursos.map((curso, index) => {
                        const status = unlockStatus?.cursos?.[curso.id] || 'bloqueado';
                        const isLocked = status === 'locked' || status === 'bloqueado';
                        const ariaLabel = isLocked
                            ? `${curso.nombre_es}. Curso bloqueado.`
                            : `${curso.nombre_es}. Estado: ${status}. Ver detalles del curso.`;

                        return (
                            <Link
                                key={curso.id}
                                href={isLocked ? '#' : `/${params.locale}/academy/course/${curso.slug}`}
                                className={`
                                    block glass-card p-8 lg:p-12 transition-all duration-500 group outline-none focus-visible:ring-2 focus-visible:ring-accent
                                    ${isLocked ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:scale-[1.01] hover:border-accent/40'}
                                `}
                                aria-label={ariaLabel}
                                onClick={(e) => isLocked && e.preventDefault()}
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-4 mb-4">
                                            <span className="text-[10px] font-black text-accent tracking-[0.5em] uppercase" aria-hidden="true">
                                                0{index + 1}
                                            </span>
                                            <h3 className="text-3xl lg:text-4xl font-display italic text-white group-hover:text-accent transition-colors leading-none">
                                                {(params.locale === 'eu' ? curso.nombre_eu : curso.nombre_es) || curso.nombre_es}
                                            </h3>
                                        </div>
                                        <p className="text-white/60 font-light leading-relaxed max-w-2xl text-lg">
                                            {(params.locale === 'eu' ? curso.descripcion_eu : curso.descripcion_es) || curso.descripcion_es}
                                        </p>

                                        <div className="flex flex-wrap gap-8 mt-8 text-[9px] font-bold text-white/30 uppercase tracking-[0.3em]">
                                            <div className="flex items-center gap-2">⏱️ {curso.duracion_h}h Totales</div>
                                            <div className="flex items-center gap-2">📚 {curso.horas_teoricas}h Teoría</div>
                                            <div className="flex items-center gap-2">⛵ {curso.horas_practicas}h Práctica</div>
                                        </div>
                                    </div>

                                    <div className="flex-shrink-0 flex items-center gap-6">
                                        <UnlockStatusBadge status={status} />
                                        {!isLocked && (
                                            <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-nautical-black transition-all duration-500" aria-hidden="true">
                                                →
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}
