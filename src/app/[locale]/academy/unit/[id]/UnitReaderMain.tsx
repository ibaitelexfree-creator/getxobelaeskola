'use client';

import UnitSkeleton from '@/components/academy/UnitSkeleton';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { UnlockStatusBadge, UnlockStatus } from '@/components/academy/UnlockStatusBadge';
import { SimpleEvaluation } from '@/components/academy/evaluation';
import { useAcademyFeedback } from '@/hooks/useAcademyFeedback';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { useNotificationStore } from '@/lib/store/useNotificationStore';
import { useUnitProgress } from '@/hooks/useUnitProgress';
import { checkAchievements } from '@/lib/gamification/AchievementEngine';
import { useAcademyMode } from '@/lib/store/useAcademyMode';
import { InteractiveMission, useMissionStore } from '@/components/academy/interactive-engine';
import { apiUrl } from '@/lib/api';
import { offlineSyncManager } from '@/lib/offline/sync-manager';

interface Unidad {
    id: string;
    nombre_es: string;
    nombre_eu: string;
    orden: number;
    objetivos_es: string[];
    objetivos_eu: string[];
    contenido_teorico_es: string;
    contenido_teorico_eu: string;
    contenido_practico_es: string;
    contenido_practico_eu: string;
    errores_comunes_es: string[];
    errores_comunes_eu: string[];
    recursos_json: any;
    recursos_adicionales_json: any;
    duracion_estimada_min: number;
    modulo: {
        id: string;
        nombre_es: string;
        nombre_eu: string;
        orden: number;
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
    };
}

interface Navegacion {
    anterior: { id: string; nombre_es: string; nombre_eu: string } | null;
    siguiente: { id: string; nombre_es: string; nombre_eu: string } | null;
    total: number;
    posicion: number;
}

export default function UnitReaderMain({
    params
}: {
    params: { locale: string; id: string }
}) {
    const t = useTranslations('academy');
    const router = useRouter();
    const { showMessage, checkForNewAchievements } = useAcademyFeedback();
    const { addNotification } = useNotificationStore();

    const [unidad, setUnidad] = useState<Unidad | null>(null);
    const [navegacion, setNavegacion] = useState<Navegacion | null>(null);
    const [progreso, setProgreso] = useState<any>(null);
    const [unlockStatus, setUnlockStatus] = useState<Record<string, UnlockStatus>>({});
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'teoria' | 'practica' | 'errores'>('teoria');
    const [completando, setCompletando] = useState(false);
    const [mostrandoQuiz, setMostrandoQuiz] = useState(false);
    const [zenMode, setZenMode] = useState(false);
    const { mode } = useAcademyMode();
    const isExplorationMode = mode === 'exploration';
    const { isComplete: isMissionComplete } = useMissionStore();

    // Initial load
    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch(apiUrl(`/api/academy/unit/${params.id}`));
                const data = await res.json();

                if (data.error) {
                    console.error(data.error);
                } else {
                    setUnidad(data.unidad);
                    setNavegacion(data.navegacion);
                    setProgreso(data.progreso);

                    try {
                        const resStatus = await fetch(apiUrl('/api/unlock-status'));
                        const dataStatus = await resStatus.json();
                        setUnlockStatus(dataStatus || {});
                    } catch (e) {
                        console.error('Error loading unlock status', e);
                    }
                }
            } catch (error) {
                console.error('Error al cargar unidad:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [params.id]);

    // Use shared logic for progress tracking
    const {
        tiempoLectura,
        seccionesVistas,
        registrarLectura,
        puedeCompletar,
        mensajeRequisito,
        setSeccionesVistas
    } = useUnitProgress({
        unidadId: unidad?.id,
        isCompletado: progreso?.estado === 'completado',
        erroresComunes: params.locale === 'eu' ? unidad?.errores_comunes_eu : unidad?.errores_comunes_es
    });

    // Set Initial sections viewed from server if available
    useEffect(() => {
        if (progreso?.secciones_vistas) {
            setSeccionesVistas(progreso.secciones_vistas);
        }
    }, [progreso, setSeccionesVistas]);

    // Register read on tab change
    useEffect(() => {
        if (activeTab) {
            registrarLectura(activeTab);
        }
    }, [activeTab, registrarLectura]);

    const marcarComoCompletada = async () => {
        if (!unidad || completando) return;

        if (!puedeCompletar) {
            // Check if there is an interactive mission that needs completion
            // Check if there is an interactive mission that needs completion
            const hasMission = unidad.recursos_json?.tipo_contenido;
            if (hasMission && !isMissionComplete) {
                addNotification({
                    type: 'warning',
                    title: 'Misión Pendiente',
                    message: 'Debes completar el desafío interactivo antes de finalizar.',
                    icon: '🎮'
                });
                return;
            }

            addNotification({
                type: 'warning',
                title: 'No has terminado',
                message: mensajeRequisito || 'Completa la lectura antes de continuar.',
                icon: '⚠️'
            });
            return;
        }

        setCompletando(true);
        // Optimistic update
        const prevProgreso = progreso;
        setProgreso({ estado: 'completado', porcentaje: 100 });

        try {
            if (typeof navigator !== 'undefined' && !navigator.onLine) {
                offlineSyncManager.addToQueue(
                    '/api/academy/progress/update',
                    'POST',
                    {
                        tipo_entidad: 'unidad',
                        entidad_id: unidad.id,
                        estado: 'completado',
                        porcentaje: 100
                    }
                );
                addNotification({
                    type: 'info',
                    title: 'Guardado Offline',
                    message: 'El progreso se sincronizará cuando recuperes la conexión.',
                    icon: 'wifi-off'
                });

                // Trigger achievement check (optimistic)
                checkForNewAchievements();

                if (navegacion?.siguiente) {
                    setTimeout(() => {
                        router.push(`/${params.locale}/academy/unit/${navegacion.siguiente!.id}`);
                    }, 1500);
                }
                setCompletando(false);
                return;
            }

            const res = await fetch(apiUrl('/api/academy/progress/update'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tipo_entidad: 'unidad',
                    entidad_id: unidad.id,
                    estado: 'completado',
                    porcentaje: 100
                })
            });

            if (res.ok) {
                addNotification({
                    type: 'success',
                    title: '¡Buen trabajo!',
                    message: 'Unidad marcada como completada.',
                    icon: '✅'
                });

                // Trigger achievement check
                checkForNewAchievements();

                if (navegacion?.siguiente) {
                    setTimeout(() => {
                        router.push(`/${params.locale}/academy/unit/${navegacion.siguiente!.id}`);
                    }, 1500);
                }
            } else {
                throw new Error('Failed to update progress');
            }
        } catch (error) {
            console.error('Error al marcar como completada:', error);
            // Rollback optimistic update
            setProgreso(prevProgreso);
            addNotification({
                type: 'error',
                title: 'Error',
                message: 'No se pudo guardar el progreso. Inténtalo de nuevo.',
                icon: '❌'
            });
        } finally {
            setCompletando(false);
        }
    };

    if (loading) {
        return <UnitSkeleton />;
    }

    if (!unidad) {
        return (
            <div className="min-h-screen bg-nautical-black flex items-center justify-center">
                <div className="text-center">
                    <p className="text-white/80 text-xl">Unidad no encontrada</p>
                    <Link href={`/${params.locale}/academy`} className="text-accent underline mt-4 inline-block">Volver al Mapa</Link>
                </div>
            </div>
        );
    }

    const currentStatus = unlockStatus[params.id];
    const isLocked = currentStatus === 'locked';

    if (isLocked && !isExplorationMode) {
        return (
            <div className="min-h-screen bg-nautical-black flex items-center justify-center">
                <div className="text-center p-8 bg-white/5 rounded-lg border border-white/10 max-w-md">
                    <div className="text-6xl mb-4">🔒</div>
                    <h1 className="text-2xl font-display italic text-white mb-2">Contenido Bloqueado</h1>
                    <p className="text-white/80 mb-6">Debes completar las unidades anteriores.</p>
                    <Link
                        href={`/${params.locale}/academy/module/${unidad.modulo.id}`}
                        className="inline-block px-6 py-2 bg-accent text-nautical-black font-bold rounded-sm hover:bg-accent/90"
                    >
                        Volver al Módulo
                    </Link>
                </div>
            </div>
        );
    }

    const isCompletada = progreso?.estado === 'completado';

    return (
        <div className="min-h-screen bg-nautical-black text-white">
            {/* Exploration Mode Banner */}
            {isExplorationMode && (
                <div className="fixed top-28 right-6 z-40 bg-blue-500/20 backdrop-blur border border-blue-500/40 px-4 py-2 rounded-full flex items-center gap-2 pointer-events-none">
                    <span className="text-blue-300 text-xs font-bold uppercase tracking-widest">🔭 Modo Exploración</span>
                </div>
            )}
            {/* Header fijo */}
            {!zenMode && (
                <div className="fixed top-0 left-0 right-0 z-50 bg-nautical-black/95 backdrop-blur-md border-b border-white/10 transition-transform duration-300">
                    <div className="container mx-auto px-6 py-4">
                        <div className="flex items-center justify-between">
                            <Breadcrumbs
                                items={[
                                    { label: 'Academy', href: `/${params.locale}/academy` },
                                    { label: `Módulo ${unidad.modulo.orden}`, href: `/${params.locale}/academy/module/${unidad.modulo.id}` },
                                    { label: `Unidad ${unidad.orden}` }
                                ]}
                            />
                            <div className="flex items-center gap-4" role="status" aria-live="polite">
                                <span className="text-xs text-white/80" aria-label={`Página ${navegacion?.posicion} de ${navegacion?.total}`}>
                                    {navegacion?.posicion} de {navegacion?.total}
                                </span>
                                {isCompletada && (
                                    <span className="px-3 py-1 bg-accent/20 text-accent text-[8px] uppercase tracking-widest font-black rounded-full border border-accent/30">
                                        ✓ Completada
                                    </span>
                                )}
                                <UnlockStatusBadge status={currentStatus || 'available'} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Zen Mode Toggle (Floating) */}
            <button
                onClick={() => setZenMode(!zenMode)}
                className={`fixed top-4 right-4 z-[60] w-10 h-10 rounded-full flex items-center justify-center transition-all focus-ring ${zenMode ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-transparent text-white/50 hover:text-white'}`}
                title={zenMode ? "Salir de Modo Zen" : "Modo Zen (Lectura sin distracciones)"}
                aria-label={zenMode ? "Salir de Modo Zen" : "Activar Modo Zen"}
                aria-pressed={zenMode}
            >
                <span role="img" aria-hidden="true">{zenMode ? '✕' : '👁️'}</span>
            </button>

            {/* Contenido principal */}
            <div className="pt-24 pb-32">
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto">
                        <div className="mb-12">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 rounded-full bg-accent/20 border-2 border-accent flex items-center justify-center">
                                    <span className="text-accent font-black text-2xl">{unidad.orden}</span>
                                </div>
                                <div className="flex-1">
                                    <span className="text-accent uppercase tracking-[0.4em] text-[10px] font-black block mb-1">Unidad Didáctica {unidad.orden}</span>
                                    <h1 className="text-3xl md:text-5xl font-display italic text-white leading-tight">
                                        {params.locale === 'eu' ? unidad.nombre_eu : unidad.nombre_es}
                                    </h1>
                                </div>
                            </div>

                            {unidad.objetivos_es && unidad.objetivos_es.length > 0 && (
                                <section className="bg-white/5 border border-white/10 rounded-sm p-6" aria-labelledby="objetivos-title">
                                    <h2 id="objetivos-title" className="text-[10px] uppercase tracking-widest text-accent font-black mb-4">
                                        <span className="mr-2" role="img" aria-hidden="true">🎯</span>
                                        Objetivos
                                    </h2>
                                    <ul className="space-y-2">
                                        {(params.locale === 'eu' ? unidad.objetivos_eu : unidad.objetivos_es).map((objetivo: string, i: number) => (
                                            <li key={i} className="flex items-start gap-3">
                                                <span className="text-accent mt-0.5" aria-hidden="true">→</span>
                                                <span className="text-white/90 text-sm">{objetivo}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            )}
                        </div>

                        <div className="mb-8">
                            <div className="flex flex-wrap gap-3" role="tablist" aria-label="Secciones de la unidad">
                                <button
                                    role="tab"
                                    id="tab-teoria"
                                    aria-selected={activeTab === 'teoria'}
                                    aria-controls="panel-teoria"
                                    onClick={() => setActiveTab('teoria')}
                                    className={`px-6 py-3 rounded-full text-xs uppercase tracking-widest transition-all duration-300 focus-ring ${activeTab === 'teoria'
                                        ? 'bg-accent text-nautical-black font-bold shadow-lg shadow-accent/20 transform scale-105'
                                        : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                                        }`}
                                >
                                    <span role="img" aria-hidden="true" className="mr-2">📚</span>
                                    Teoría
                                </button>
                                <button
                                    role="tab"
                                    id="tab-practica"
                                    aria-selected={activeTab === 'practica'}
                                    aria-controls="panel-practica"
                                    onClick={() => setActiveTab('practica')}
                                    className={`px-6 py-3 rounded-full text-xs uppercase tracking-widest transition-all duration-300 focus-ring ${activeTab === 'practica'
                                        ? 'bg-accent text-nautical-black font-bold shadow-lg shadow-accent/20 transform scale-105'
                                        : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                                        }`}
                                >
                                    <span role="img" aria-hidden="true" className="mr-2">⛵</span>
                                    Práctica
                                </button>
                                {unidad.errores_comunes_es && unidad.errores_comunes_es.length > 0 && (
                                    <button
                                        role="tab"
                                        id="tab-errores"
                                        aria-selected={activeTab === 'errores'}
                                        aria-controls="panel-errores"
                                        onClick={() => setActiveTab('errores')}
                                        className={`px-6 py-3 rounded-full text-xs uppercase tracking-widest transition-all duration-300 focus-ring ${activeTab === 'errores'
                                            ? 'bg-red-500 text-white font-bold shadow-lg shadow-red-500/20 transform scale-105'
                                            : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                                            }`}
                                    >
                                        <span role="img" aria-hidden="true" className="mr-2">⚠️</span>
                                        Errores
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Interactive Mission Section */}
                        {unidad.recursos_json?.tipo_contenido && (
                            <div className="mb-12 animate-premium-in">
                                <InteractiveMission
                                    data={unidad.recursos_json}
                                    onComplete={(score) => {
                                        // setMisionCompletada(true); // Ya no es necesario, el store lo maneja
                                        addNotification({
                                            type: 'success',
                                            title: 'Desafío Superado',
                                            message: `Has completado la misión con ${score} puntos.`,
                                            icon: '🎯'
                                        });
                                        // Check achievements
                                        checkAchievements(unidad.recursos_json.tipo_contenido, score / 100);
                                    }}
                                />
                            </div>
                        )}

                        <div className="prose prose-invert prose-lg max-w-none">
                            <div
                                role="tabpanel"
                                id="panel-teoria"
                                aria-labelledby="tab-teoria"
                                hidden={activeTab !== 'teoria'}
                                tabIndex={0}
                                className="focus:outline-none focus:ring-2 focus:ring-accent/50 rounded-sm"
                            >
                                {activeTab === 'teoria' && (
                                    <div className="space-y-8">
                                        <div className="bg-white/5 border border-white/10 rounded-sm p-8">
                                            <div className="text-white/90 leading-relaxed whitespace-pre-wrap"
                                                dangerouslySetInnerHTML={{ __html: params.locale === 'eu' ? unidad.contenido_teorico_eu || '' : unidad.contenido_teorico_es || '' }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div
                                role="tabpanel"
                                id="panel-practica"
                                aria-labelledby="tab-practica"
                                hidden={activeTab !== 'practica'}
                                tabIndex={0}
                                className="focus:outline-none focus:ring-2 focus:ring-accent/50 rounded-sm"
                            >
                                {activeTab === 'practica' && (
                                    <div className="bg-accent/5 border border-accent/20 rounded-sm p-8">
                                        <div className="text-white/90 leading-relaxed whitespace-pre-wrap"
                                            dangerouslySetInnerHTML={{ __html: params.locale === 'eu' ? unidad.contenido_practico_eu || '' : unidad.contenido_practico_es || '' }}
                                        />
                                    </div>
                                )}
                            </div>

                            <div
                                role="tabpanel"
                                id="panel-errores"
                                aria-labelledby="tab-errores"
                                hidden={activeTab !== 'errores'}
                                tabIndex={0}
                                className="focus:outline-none focus:ring-2 focus:ring-accent/50 rounded-sm"
                            >
                                {activeTab === 'errores' && (
                                    <div className="bg-red-500/5 border border-red-500/20 rounded-sm p-8 text-white/90">
                                        <ul className="space-y-4">
                                            {(params.locale === 'eu' ? unidad.errores_comunes_eu : unidad.errores_comunes_es).map((error: string, i: number) => (
                                                <li key={i} className="flex items-start gap-3">
                                                    <span className="text-red-400 text-xl mt-0.5" aria-hidden="true">⚠️</span>
                                                    <span>{error}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-12 border-t border-white/10 pt-12">
                            {isExplorationMode && !isCompletada ? (
                                <div className="bg-blue-500/10 border border-blue-500/20 rounded-sm p-8 text-center">
                                    <h2 className="text-xl font-display italic text-blue-200 mb-2">Modo Exploración</h2>
                                    <p className="text-white/80 text-sm">Estás explorando libremente. Para realizar el quiz y guardar tu progreso, debes desbloquear esta unidad en el modo estructurado.</p>
                                </div>
                            ) : (
                                !mostrandoQuiz ? (
                                    <div className="bg-accent/5 border border-accent/20 rounded-sm p-8 text-center">
                                        <h2 className="text-2xl font-display italic text-white mb-3">Quiz de Evaluación</h2>
                                        <p className="text-white/80 mb-6">Demuestra lo que has aprendido.</p>
                                        <button
                                            onClick={() => setMostrandoQuiz(true)}
                                            disabled={!puedeCompletar && !isCompletada}
                                            className="px-8 py-4 bg-accent text-nautical-black font-black text-sm uppercase tracking-wider rounded-sm hover:bg-accent/90 disabled:opacity-30 transition-all focus-ring"
                                        >
                                            {isCompletada ? '🔄 Repetir Quiz' : '▶️ Comenzar Quiz'}
                                        </button>
                                        {!puedeCompletar && !isCompletada && (
                                            <p className="text-xs text-white/70 mt-2">{mensajeRequisito}</p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="bg-white/5 border border-white/10 rounded-sm p-8">
                                        <SimpleEvaluation
                                            entidadTipo="unidad"
                                            entidadId={unidad.id}
                                            titulo={`${t('quiz')}: ${params.locale === 'eu' ? unidad.nombre_eu : unidad.nombre_es}`}
                                            onComplete={() => {
                                                setMostrandoQuiz(false);
                                                setProgreso({ estado: 'completado', porcentaje: 100 });
                                                checkForNewAchievements();
                                                // Refresh progress if needed
                                            }}
                                        />
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <nav className={`fixed bottom-0 left-0 right-0 bg-nautical-black/95 backdrop-blur-md border-t border-white/10 transition-transform duration-300 ${zenMode ? 'translate-y-full' : 'translate-y-0'}`} aria-label="Navegación de unidades">
                <div className="container mx-auto px-6 py-6 flex items-center justify-between max-w-4xl mx-auto">
                    {navegacion?.anterior ? (
                        <Link
                            href={`/${params.locale}/academy/unit/${navegacion.anterior.id}`}
                            className="px-6 py-3 bg-white/5 border border-white/10 rounded-sm text-sm hover:bg-white/10 focus-ring"
                            aria-label={`Unidad anterior: ${params.locale === 'eu' ? navegacion.anterior.nombre_eu : navegacion.anterior.nombre_es}`}
                        >
                            ← Anterior
                        </Link>
                    ) : <div />}

                    {/* Hide complete button in exploration mode if not completed */}
                    {/* Hide complete button in exploration mode if not completed */}
                    {!isCompletada && !isExplorationMode && (
                        <button
                            onClick={marcarComoCompletada}
                            disabled={completando || (unidad.recursos_json?.tipo_contenido && !isMissionComplete)}
                            className={`
                                px-8 py-3 font-black uppercase text-sm rounded-sm transition-all focus-ring
                                ${unidad.recursos_json?.tipo_contenido && !isMissionComplete
                                    ? 'bg-white/10 text-white/40 cursor-not-allowed border border-white/5'
                                    : 'bg-accent text-nautical-black hover:bg-white'}
                            `}
                            title={unidad.recursos_json?.tipo_contenido && !isMissionComplete ? "Completa la misión primero" : ""}
                            aria-label={unidad.recursos_json?.tipo_contenido && !isMissionComplete ? "Completar unidad (bloqueado, misión pendiente)" : "Marcar unidad como completada"}
                        >
                            {completando ? 'Guardando...' : (unidad.recursos_json?.tipo_contenido && !isMissionComplete ? 'Misión Pendiente 🔒' : '✓ Completar')}
                        </button>
                    )}

                    {navegacion?.siguiente ? (
                        <Link
                            href={`/${params.locale}/academy/unit/${navegacion.siguiente.id}`}
                            className="px-8 py-3 bg-accent/20 border border-accent/40 text-accent rounded-sm text-sm hover:bg-accent/30 focus-ring"
                            aria-label={`Siguiente unidad: ${params.locale === 'eu' ? navegacion.siguiente.nombre_eu : navegacion.siguiente.nombre_es}`}
                        >
                            Siguiente →
                        </Link>
                    ) : <div />}
                </div>
            </nav>
        </div >
    );
}
