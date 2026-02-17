'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { UnlockStatusBadge, UnlockStatusResponse, LockedContentOverlay } from '@/components/academy/UnlockStatusBadge';
import { SimpleEvaluation } from '@/components/academy/evaluation';
import { apiUrl } from '@/lib/api';

interface Modulo {
    id: string;
    nombre_es: string;
    nombre_eu: string;
    slug: string;
    orden: number;
    descripcion_es: string;
    descripcion_eu: string;
    objetivos_json: any;
    duracion_estimada_h: number;
    num_unidades: number;
}

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
    nivel_formacion: {
        id: string;
        slug: string;
        nombre_es: string;
        nombre_eu: string;
        orden: number;
    };
    instructor?: {
        nombre: string;
        foto_url: string;
    };
}

interface Progreso {
    estado: string;
    porcentaje: number;
}

export default function CourseDetailMain({
    params
}: {
    params: { locale: string; slug: string }
}) {
    const t = useTranslations('academy');
    const [curso, setCurso] = useState<Curso | null>(null);
    const [modulos, setModulos] = useState<Modulo[]>([]);
    const [progreso, setProgreso] = useState<Progreso | null>(null);
    const [unlockStatus, setUnlockStatus] = useState<UnlockStatusResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [mostrandoExamenFinal, setMostrandoExamenFinal] = useState(false);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch(apiUrl(`/api/academy/course/${params.slug}`));
                const data = await res.json();

                if (data.error) {
                    console.error(data.error);
                } else {
                    setCurso(data.curso);
                    setModulos(data.modulos || []);
                    setProgreso(data.progreso);

                    try {
                        const resStatus = await fetch(apiUrl('/api/academy/unlock-status'));
                        const dataStatus = await resStatus.json();
                        setUnlockStatus(dataStatus || null);
                    } catch (e) {
                        console.error('Error loading unlock status', e);
                    }
                }
            } catch (error) {
                console.error('Error al cargar curso:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [params.slug]);

    if (loading) {
        return (
            <div className="min-h-screen bg-nautical-black flex items-center justify-center" aria-live="polite">
                <div className="text-center">
                    <div className="text-6xl mb-4 animate-bounce-slow" aria-hidden="true">⚓</div>
                    <p className="text-white/60 text-lg font-display italic">Preparando el programa...</p>
                </div>
            </div>
        );
    }

    if (!curso) {
        return (
            <div className="min-h-screen bg-nautical-black flex items-center justify-center">
                <div className="text-center">
                    <p className="text-xl font-display italic text-white/60 mb-8">Curso no encontrado</p>
                    <Link href={`/${params.locale}/academy`} className="btn">
                        Volver a la Academia
                    </Link>
                </div>
            </div>
        );
    }

    const currentCourseStatus = unlockStatus?.cursos?.[curso.id] || 'bloqueado';
    const isCourseLocked = currentCourseStatus === 'locked' || currentCourseStatus === 'bloqueado';

    if (isCourseLocked) {
        return (
            <div className="min-h-screen bg-nautical-black pt-20">
                <LockedContentOverlay
                    title="Curso Bloqueado"
                    message="Navega primero por los niveles anteriores para desbloquear este curso."
                    backPath={`/${params.locale}/academy/level/${curso.nivel_formacion.slug}`}
                />
            </div>
        );
    }

    const totalUnidades = modulos.reduce((sum, m) => sum + m.num_unidades, 0);

    return (
        <div className="min-h-screen bg-premium-mesh text-white pb-32">
            {/* Nav / Breadcrumb */}
            <nav className="container mx-auto px-6 py-8" aria-label="Breadcrumb">
                <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] font-bold text-white/40">
                    <Link href={`/${params.locale}/academy`} className="hover:text-accent transition-colors">Academia</Link>
                    <span aria-hidden="true">/</span>
                    <Link href={`/${params.locale}/academy/level/${curso.nivel_formacion.slug}`} className="hover:text-accent transition-colors">
                        {params.locale === 'eu' ? curso.nivel_formacion.nombre_eu : curso.nivel_formacion.nombre_es}
                    </Link>
                    {curso.nombre_es.toLowerCase() !== curso.nivel_formacion.nombre_es.toLowerCase() && (
                        <>
                            <span aria-hidden="true">/</span>
                            <span className="text-white/80">{params.locale === 'eu' ? curso.nombre_eu : curso.nombre_es}</span>
                        </>
                    )}
                </div>
            </nav>

            {/* Premium Cinematic Header */}
            <header className="relative min-h-[60vh] flex items-center overflow-hidden mb-24">
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/images/course-detail-header-sailing.jpg"
                        alt={curso.nombre_es}
                        fill
                        priority
                        className="object-cover grayscale opacity-30"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-nautical-black via-nautical-black/80 to-transparent" />
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-5xl mx-auto animate-premium-in">
                        {curso.nombre_es.toLowerCase() !== curso.nivel_formacion.nombre_es.toLowerCase() && (
                            <span className="text-accent uppercase tracking-[0.5em] text-[10px] font-black block mb-6 px-4 py-1 border border-accent/20 w-fit bg-accent/5 backdrop-blur-sm">
                                NIVEL {curso.nivel_formacion.orden} · {params.locale === 'eu' ? curso.nivel_formacion.nombre_eu : curso.nivel_formacion.nombre_es}
                            </span>
                        )}

                        <h1 className="text-4xl md:text-8xl lg:text-9xl font-display italic text-white mb-8 leading-tight drop-shadow-2xl">
                            {params.locale === 'eu' ? curso.nombre_eu : curso.nombre_es}
                        </h1>

                        <p className="text-xl lg:text-2xl text-white/70 font-light leading-relaxed mb-12 max-w-2xl drop-shadow-lg">
                            {params.locale === 'eu' ? curso.descripcion_eu : curso.descripcion_es}
                        </p>

                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl">
                            <div className="glass-panel p-6 border-white/10 hover:border-accent/40 transition-colors group">
                                <div className="text-4xl font-display italic text-accent mb-2">{modulos.length}</div>
                                <div className="text-[9px] uppercase tracking-widest text-white/40 font-black">Módulos</div>
                            </div>
                            <div className="glass-panel p-6 border-white/10 hover:border-accent/40 transition-colors group">
                                <div className="text-4xl font-display italic text-accent mb-2">{totalUnidades}</div>
                                <div className="text-[9px] uppercase tracking-widest text-white/40 font-black">Unidades</div>
                            </div>
                            <div className="glass-panel p-6 border-white/10 hover:border-accent/40 transition-colors group">
                                <div className="text-4xl font-display italic text-accent mb-2">{curso.duracion_h}h</div>
                                <div className="text-[9px] uppercase tracking-widest text-white/40 font-black">Duración</div>
                            </div>
                            {curso.instructor && (
                                <div className="glass-panel p-6 border-white/10 flex items-center gap-4">
                                    <div className="relative w-12 h-12 rounded-full overflow-hidden border border-white/20">
                                        <Image src={curso.instructor.foto_url || "/images/instructor-avatar-default.jpg"} alt={curso.instructor.nombre} fill className="object-cover" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-white">{curso.instructor.nombre}</div>
                                        <div className="text-[8px] uppercase text-white/40 tracking-widest">Instructor</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Program Details List */}
            <main className="container mx-auto px-6">
                <div className="max-w-5xl mx-auto space-y-12">
                    <header className="mb-16">
                        <h2 className="text-4xl lg:text-5xl font-display italic text-white">Programa Académico</h2>
                        <div className="w-24 h-px bg-accent/40 mt-6" aria-hidden="true" />
                    </header>

                    <div className="grid gap-6">
                        {modulos.map((modulo, idx) => {
                            const status = unlockStatus?.modulos?.[modulo.id] || 'bloqueado';
                            const isLocked = status === 'locked' || status === 'bloqueado';
                            const ariaLabel = isLocked
                                ? `Módulo ${modulo.orden}: ${modulo.nombre_es}. Bloqueado.`
                                : `Módulo ${modulo.orden}: ${modulo.nombre_es}. Desbloqueado. Ver contenido.`;

                            return (
                                <Link
                                    key={modulo.id}
                                    href={isLocked ? '#' : `/${params.locale}/academy/module/${modulo.id}`}
                                    className={`
                                        block glass-card p-10 transition-all duration-700 group outline-none focus-visible:ring-2 focus-visible:ring-accent
                                        ${isLocked ? 'opacity-40 grayscale cursor-not-allowed' : 'hover:scale-[1.01] hover:border-accent/40'}
                                    `}
                                    aria-label={ariaLabel}
                                    onClick={(e) => isLocked && e.preventDefault()}
                                >
                                    <div className="flex flex-col md:flex-row md:items-center gap-10">
                                        <div className={`
                                            flex-shrink-0 w-16 h-16 rounded-full border-2 flex items-center justify-center font-display italic text-2xl transition-all duration-500
                                            ${isLocked ? 'border-white/10 text-white/20' : 'border-accent text-accent group-hover:bg-accent group-hover:text-nautical-black'}
                                        `} aria-hidden="true">
                                            {modulo.orden}
                                        </div>

                                        <div className="flex-1">
                                            <h3 className="text-3xl font-display italic text-white mb-4 group-hover:text-accent transition-colors">
                                                {params.locale === 'eu' ? modulo.nombre_eu : modulo.nombre_es}
                                            </h3>
                                            <p className="text-lg text-white/50 font-light leading-relaxed line-clamp-2">
                                                {params.locale === 'eu' ? modulo.descripcion_eu : modulo.descripcion_es}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-8">
                                            <div className="text-right hidden sm:block">
                                                <div className="text-white font-bold">{modulo.num_unidades}</div>
                                                <div className="text-[9px] uppercase tracking-widest text-white/30">Unidades</div>
                                            </div>
                                            <UnlockStatusBadge status={status} />
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>

                    {/* Final Evaluation Section */}
                    {!mostrandoExamenFinal && progreso?.porcentaje === 100 && (
                        <section className="mt-24 p-12 lg:p-20 relative overflow-hidden border border-accent/40 rounded-sm group bg-accent/[0.03]">
                            <div className="absolute inset-0 bg-waves opacity-20 pointer-events-none" aria-hidden="true" />
                            <div className="relative z-10 text-center max-w-2xl mx-auto">
                                <span className="text-accent uppercase tracking-[0.6em] text-[10px] font-black block mb-6 animate-pulse">Reto Final Desbloqueado</span>
                                <h2 className="text-5xl lg:text-7xl font-display italic text-white mb-10 leading-tight">
                                    Examen de <span className="italic">Certificación</span>
                                </h2>
                                <p className="text-white/60 font-light text-lg leading-relaxed mb-12">
                                    Has demostrado dominio en todos los módulos. Es el momento de poner a prueba tus conocimientos para obtener el certificado oficial de este nivel.
                                </p>
                                <button
                                    onClick={() => setMostrandoExamenFinal(true)}
                                    className="px-16 py-6 bg-accent text-nautical-black font-black uppercase tracking-[0.3em] text-xs hover:bg-white transition-all duration-700 shadow-[0_0_30px_rgba(255,77,0,0.3)] hover:shadow-white/20"
                                >
                                    Realizar Examen Final 🎯
                                </button>
                            </div>
                        </section>
                    )}

                    {mostrandoExamenFinal && (
                        <section className="mt-12 glass-panel p-12 lg:p-16 border-accent/40 animate-fade-in shadow-2xl">
                            <SimpleEvaluation
                                entidadTipo="curso"
                                entidadId={curso.id}
                                titulo={`Examen Final de Certificación`}
                                onComplete={() => {
                                    setMostrandoExamenFinal(false);
                                    window.location.reload();
                                }}
                            />
                        </section>
                    )}
                </div>
            </main>
        </div>
    );
}
