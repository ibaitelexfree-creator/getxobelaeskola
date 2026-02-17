'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { UnlockStatusBadge, UnlockStatusResponse, LockedContentOverlay } from '@/components/academy/UnlockStatusBadge';
import { SimpleEvaluation } from '@/components/academy/evaluation';
import { apiUrl } from '@/lib/api';

interface Unidad {
    id: string;
    nombre_es: string;
    nombre_eu: string;
    slug: string;
    orden: number;
    objetivos_es: string[];
    objetivos_eu: string[];
    duracion_estimada_min: number;
}

interface Modulo {
    id: string;
    nombre_es: string;
    nombre_eu: string;
    descripcion_es: string;
    descripcion_eu: string;
    orden: number;
    objetivos_json: any;
    duracion_estimada_h: number;
    curso: {
        id: string;
        slug: string;
        nombre_es: string;
        nombre_eu: string;
        nivel_formacion: {
            slug: string;
            nombre_es: string;
            nombre_eu: string;
            orden: number;
        };
    };
}

export default function ModuleDetailMain({
    params
}: {
    params: { locale: string; id: string }
}) {
    const t = useTranslations('academy');
    const [modulo, setModulo] = useState<Modulo | null>(null);
    const [unidades, setUnidades] = useState<Unidad[]>([]);
    const [progreso, setProgreso] = useState<any>(null);
    const [progresoUnidades, setProgresoUnidades] = useState<any[]>([]);
    const [unlockStatus, setUnlockStatus] = useState<UnlockStatusResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [mostrandoExamen, setMostrandoExamen] = useState(false);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch(apiUrl(`/api/academy/module/${params.id}`));
                const data = await res.json();
                if (!data.error) {
                    setModulo(data.modulo);
                    setUnidades(data.unidades || []);
                    setProgreso(data.progreso);
                    setProgresoUnidades(data.progreso_unidades || []);
                    try {
                        const resStatus = await fetch(apiUrl('/api/academy/unlock-status'));
                        const dataStatus = await resStatus.json();
                        setUnlockStatus(dataStatus || null);
                    } catch (e) { console.error(e); }
                }
            } catch (error) { console.error(error); } finally { setLoading(false); }
        }
        fetchData();
    }, [params.id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-nautical-black flex items-center justify-center" aria-live="polite">
                <div className="text-center">
                    <div className="text-6xl mb-4 animate-bounce-slow" aria-hidden="true">⚓</div>
                    <p className="text-white/60 text-lg font-display italic">Navegando el módulo...</p>
                </div>
            </div>
        );
    }

    if (!modulo) {
        return (
            <div className="min-h-screen bg-nautical-black flex items-center justify-center text-white">
                <div className="text-center">
                    <p className="text-xl font-display italic text-white/60 mb-8">Módulo no encontrado</p>
                    <Link href={`/${params.locale}/academy`} className="btn">
                        Volver a la Academia
                    </Link>
                </div>
            </div>
        );
    }

    const currentModuleStatus = unlockStatus?.modulos?.[params.id] || 'bloqueado';
    const isModuleLocked = currentModuleStatus === 'locked' || currentModuleStatus === 'bloqueado';

    if (isModuleLocked) {
        return (
            <div className="min-h-screen bg-nautical-black pt-20">
                <LockedContentOverlay
                    title="Módulo Bloqueado"
                    message="Navega a través de los contenidos previos para abrir este módulo."
                    backPath={`/${params.locale}/academy/course/${modulo.curso.slug}`}
                />
            </div>
        );
    }

    const unidadesCompletadas = progresoUnidades.filter(p => p.estado === 'completado').length;

    return (
        <div className="min-h-screen bg-premium-mesh text-white pb-32">
            {/* Breadcrumb / Context */}
            <nav className="container mx-auto px-6 py-8" aria-label="Breadcrumb">
                <div className="flex flex-wrap items-center gap-4 text-[10px] uppercase tracking-[0.3em] font-bold text-white/40">
                    <Link href={`/${params.locale}/academy`} className="hover:text-accent transition-colors">Academia</Link>
                    <span aria-hidden="true">/</span>
                    <Link href={`/${params.locale}/academy/level/${modulo.curso.nivel_formacion.slug}`} className="hover:text-accent transition-colors">
                        {params.locale === 'eu' ? modulo.curso.nivel_formacion.nombre_eu : modulo.curso.nivel_formacion.nombre_es}
                    </Link>
                    <span aria-hidden="true">/</span>
                    <Link href={`/${params.locale}/academy/course/${modulo.curso.slug}`} className="hover:text-accent transition-colors">
                        {params.locale === 'eu' ? modulo.curso.nombre_eu : modulo.curso.nombre_es}
                    </Link>
                    <span aria-hidden="true">/</span>
                    <span className="text-white/80">Módulo {modulo.orden}</span>
                </div>
            </nav>

            {/* Premium Header */}
            <header className="container mx-auto px-6 mb-20 animate-premium-in">
                <div className="max-w-4xl">
                    <span className="text-accent uppercase tracking-[0.4em] text-[10px] font-black block mb-6 px-4 py-1 border border-accent/20 w-fit">
                        MÓDULO {modulo.orden}
                    </span>
                    <h1 className="text-4xl md:text-8xl font-display italic text-white mb-8 leading-tight">
                        {params.locale === 'eu' ? modulo.nombre_eu : modulo.nombre_es}
                    </h1>
                    <p className="text-xl lg:text-2xl text-white/60 font-light leading-relaxed max-w-3xl">
                        {params.locale === 'eu' ? modulo.descripcion_eu : modulo.descripcion_es}
                    </p>
                </div>
            </header>

            {/* Units List */}
            <main className="container mx-auto px-6">
                <div className="max-w-4xl mx-auto space-y-4">
                    <header className="flex justify-between items-end border-b border-white/10 pb-6 mb-10">
                        <h2 className="text-3xl font-display italic text-white">Unidades Didácticas</h2>
                        <div className="text-[10px] tracking-widest text-white/30 font-black uppercase">
                            {unidadesCompletadas} / {unidades.length} Completadas
                        </div>
                    </header>

                    {unidades.map((unidad, index) => {
                        const status = unlockStatus?.unidades?.[unidad.id] || 'bloqueado';
                        const isLocked = status === 'locked' || status === 'bloqueado';
                        const isCompleted = status === 'completado';
                        const ariaLabel = isLocked
                            ? `Unidad ${unidad.orden}: ${unidad.nombre_es}. Bloqueada.`
                            : `Unidad ${unidad.orden}: ${unidad.nombre_es}. Estado: ${status}. Leer unidad.`;

                        return (
                            <Link
                                key={unidad.id}
                                href={isLocked ? '#' : `/${params.locale}/academy/unit/${unidad.id}`}
                                className={`
                                    block glass-card p-6 lg:p-8 transition-all duration-500 group outline-none focus-visible:ring-2 focus-visible:ring-accent
                                    ${isLocked ? 'opacity-40 grayscale cursor-not-allowed' : 'hover:scale-[1.01] hover:border-accent/30'}
                                    ${isCompleted ? 'border-accent/20 bg-accent/[0.02]' : ''}
                                `}
                                aria-label={ariaLabel}
                                onClick={(e) => isLocked && e.preventDefault()}
                            >
                                <div className="flex items-center justify-between gap-6">
                                    <div className="flex items-center gap-6">
                                        <div className={`
                                            w-12 h-12 rounded-full border flex items-center justify-center font-display italic text-xl transition-all duration-500
                                            ${isLocked ? 'border-white/10 text-white/20' : 'border-accent/40 text-accent group-hover:bg-accent group-hover:text-nautical-black'}
                                            ${isCompleted ? 'bg-accent/10 border-accent' : ''}
                                        `} aria-hidden="true">
                                            {unidad.orden}
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-display italic text-white group-hover:text-accent transition-colors leading-tight">
                                                {params.locale === 'eu' ? unidad.nombre_eu : unidad.nombre_es}
                                            </h3>
                                            <div className="flex gap-4 mt-1 text-[8px] uppercase tracking-widest text-white/30 font-bold">
                                                <span>{unidad.duracion_estimada_min} mins de lectura</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        {isCompleted && <span className="text-accent text-sm" title="Completado">✓</span>}
                                        <UnlockStatusBadge status={status} />
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Exam Section */}
                {!mostrandoExamen && unidadesCompletadas === unidades.length && unidades.length > 0 && (
                    <section className="mt-20 max-w-4xl mx-auto p-12 lg:p-16 border-2 border-accent/40 rounded-sm bg-accent/[0.03] text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-waves opacity-10 pointer-events-none" aria-hidden="true" />
                        <div className="relative z-10">
                            <span className="text-accent uppercase tracking-[0.5em] text-[9px] font-black block mb-6">Contenido Finalizado</span>
                            <h2 className="text-4xl lg:text-5xl font-display italic text-white mb-8">Examen de Conocimientos</h2>
                            <p className="text-white/60 font-light text-lg mb-10 max-w-xl mx-auto">
                                Has navegado por todas las unidades de este módulo. Realiza el examen para validar tu aprendizaje y continuar tu formación.
                            </p>
                            <button
                                onClick={() => setMostrandoExamen(true)}
                                className="px-12 py-5 bg-accent text-nautical-black font-black uppercase tracking-[0.3em] text-[10px] hover:bg-white transition-all duration-500 shadow-xl"
                            >
                                Iniciar Evaluación 🏁
                            </button>
                        </div>
                    </section>
                )}

                {mostrandoExamen && (
                    <section className="mt-12 max-w-4xl mx-auto glass-panel p-10 lg:p-16 border-accent/40 shadow-2xl animate-fade-in text-white">
                        <SimpleEvaluation
                            entidadTipo="modulo"
                            entidadId={modulo.id}
                            titulo={`Examen del Módulo: ${modulo.nombre_es}`}
                            onComplete={() => {
                                setMostrandoExamen(false);
                                window.location.reload();
                            }}
                        />
                    </section>
                )}
            </main>
        </div>
    );
}
