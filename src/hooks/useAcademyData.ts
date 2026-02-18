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

                const [resNiveles, resProgreso, resCursos, resEnrollments] = await Promise.all([
                    fetch(apiUrl('/api/levels'), fetchOptions),
                    fetch(apiUrl('/api/progress'), fetchOptions),
                    fetch(apiUrl('/api/courses'), fetchOptions),
                    fetch(apiUrl('/api/enrollments'), fetchOptions)
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
        // 0. Staff Bypass
        if (isStaff) {
            const currentProg = progreso.find(p => p.nivel_id === nivel.id);
            if (currentProg?.estado === 'completado') return 'completado';
            if (currentProg?.estado === 'en_progreso') return 'en_progreso';
            return 'disponible';
        }

        // 1. Check Course Enrollment First (Paywall)
        // If the level has courses, user MUST own at least one to access the level
        const levelCourses = cursosPorNivel[nivel.id] || [];
        if (levelCourses.length > 0) {
            const isEnrolled = levelCourses.some(c => enrollments.includes(c.id));
            if (!isEnrolled) return 'bloqueado';
        }

        // 2. Check direct progress
        const progresoNivel = progreso.find(p => p.nivel_id === nivel.id);
        if (progresoNivel) {
            return progresoNivel.estado === 'completado' ? 'completado' :
                progresoNivel.estado === 'en_progreso' ? 'en_progreso' : 'disponible';
        }

        // 3. First level is always available (if enrolled or free)
        if (nivel.orden === 1) return 'disponible';

        // 4. Check prerequisites
        if (nivel.prerequisitos && nivel.prerequisitos.length > 0) {
            const prerequisitosCumplidos = nivel.prerequisitos.every(prereqId => {
                const prereqProgreso = progreso.find(p => p.nivel_id === prereqId);
                return prereqProgreso?.estado === 'completado';
            });
            return prerequisitosCumplidos ? 'disponible' : 'bloqueado';
        }

        // 5. Fallback: Check previous level by order
        const nivelAnterior = niveles.find(n => n.orden === nivel.orden - 1);
        if (nivelAnterior) {
            const progresoAnterior = progreso.find(p => p.nivel_id === nivelAnterior.id);
            return progresoAnterior?.estado === 'completado' ? 'disponible' : 'bloqueado';
        }

        return 'bloqueado';
    }, [progreso, niveles, enrollments, cursosPorNivel, isStaff]);

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

