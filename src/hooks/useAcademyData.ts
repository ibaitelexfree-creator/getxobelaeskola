import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiUrl } from '@/lib/api';

export interface Nivel {
    id: string;
    slug: string;
    nombre_es: string;
    nombre_eu: string;
    orden: number;
    descripcion_es: string;
    descripcion_eu: string;
    objetivo_formativo_es: string;
    perfil_alumno_es: string;
    duracion_teorica_h: number;
    duracion_practica_h: number;
    icono: string;
    prerequisitos: string[];
}

export interface ProgresoNivel {
    nivel_id: string;
    estado: 'no_iniciado' | 'en_progreso' | 'completado' | 'bloqueado';
    porcentaje: number;
}

export function useAcademyData() {
    const [niveles, setNiveles] = useState<Nivel[]>([]);
    const [progreso, setProgreso] = useState<ProgresoNivel[]>([]);
    const [enrollments, setEnrollments] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isStaff, setIsStaff] = useState(false);

    const [cursosPorNivel, setCursosPorNivel] = useState<Record<string, any[]>>({});
    const [unlockStatus, setUnlockStatus] = useState<any>(null);

    useEffect(() => {
        let isMounted = true;
        async function fetchData() {
            setLoading(true);
            setError(null);
            try {
                // Fetch in parallel with absolute URLs and credentials for cross-origin (mobile)
                const fetchOptions = {
                    credentials: 'include' as RequestCredentials,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                };

                const [resNiveles, resProgreso, resCursos, resEnrollments, resUnlockStatus] = await Promise.all([
                    fetch(apiUrl('/api/levels'), fetchOptions),
                    fetch(apiUrl('/api/progress'), fetchOptions),
                    fetch(apiUrl('/api/courses'), fetchOptions),
                    fetch(apiUrl('/api/enrollments'), fetchOptions),
                    fetch(apiUrl('/api/unlock-status'), fetchOptions)
                ]);

                if (!isMounted) return;

                // Levels is critical
                if (!resNiveles.ok) {
                    const errData = await resNiveles.json().catch(() => ({}));
                    throw new Error(errData.error || `Failed to fetch levels: ${resNiveles.status}`);
                }

                const dataNiveles = await resNiveles.json();
                const dataCursos = await resCursos.json().catch(() => ({ cursos: [] }));

                let dataEnrollments: string[] = [];
                if (resEnrollments.ok) {
                    const jsonEnroll = await resEnrollments.json().catch(() => ({}));
                    dataEnrollments = jsonEnroll.enrollments || [];
                }

                let progresoNiveles: ProgresoNivel[] = [];
                if (resProgreso.ok) {
                    const dataProgreso = await resProgreso.json().catch(() => ({}));
                    progresoNiveles = dataProgreso.progreso?.filter(
                        (p: any) => p.tipo_entidad === 'nivel'
                    ) || [];
                    setIsStaff(!!dataProgreso.is_staff);
                }

                let dataUnlock = null;
                if (resUnlockStatus.ok) {
                    dataUnlock = await resUnlockStatus.json().catch(() => null);
                }

                // Map courses to levels
                const mappedCursos: Record<string, any[]> = {};
                (dataCursos.cursos || []).forEach((c: any) => {
                    const nid = c.nivel_formacion_id;
                    if (nid) {
                        if (!mappedCursos[nid]) mappedCursos[nid] = [];
                        mappedCursos[nid].push(c);
                    }
                });

                setNiveles(dataNiveles.niveles || []);
                setProgreso(progresoNiveles);
                setCursosPorNivel(mappedCursos);
                setEnrollments(dataEnrollments);
                setUnlockStatus(dataUnlock);
            } catch (err) {
                if (isMounted) {
                    const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
                    setError(`Error al cargar academia: ${errorMessage}`);
                    console.error('Error in useAcademyData:', err);
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        fetchData();
        return () => { isMounted = false; };
    }, []);

    const getEstadoNivel = useCallback((nivel: Nivel): 'bloqueado' | 'disponible' | 'en_progreso' | 'completado' => {
        // 0. Primary Truth: unlockStatus from API (Fase 6)
        if (unlockStatus?.niveles?.[nivel.id]) {
            const status = unlockStatus.niveles[nivel.id];
            // Normalize status strings from DB ('no_iniciado' -> 'disponible' for UI)
            if (status === 'completado' || status === 'distincion') return 'completado';
            if (status === 'en_progreso') return 'en_progreso';
            if (status === 'no_iniciado' || status === 'available') return 'disponible';
            if (status === 'bloqueado' || status === 'locked') return 'bloqueado';
        }

        // 1. Fallback / Staff Bypass
        if (isStaff) return 'disponible';

        // 2. Paywall Check (Ensures even if DB says 'bloqueado' we know it's because of purchase)
        const levelCourses = cursosPorNivel[nivel.id] || [];
        if (levelCourses.length > 0) {
            const isEnrolled = levelCourses.some(c => enrollments.includes(c.id));
            if (!isEnrolled) return 'bloqueado';
        }

        return 'bloqueado';
    }, [unlockStatus, enrollments, cursosPorNivel, isStaff]);

    return {
        niveles,
        progreso,
        cursosPorNivel,
        enrollments,
        loading,
        error,
        getEstadoNivel
    };
}

