import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { esquemaCursos } from '@/lib/academy/course-schema';
import { calculateAcademyProgress } from '@/lib/academy/progress-calculator';

// Define explicit interfaces for query results to satisfy TypeScript
interface Profile {
    nombre: string;
    apellidos: string;
    avatar_url: string;
}

interface ProgressItem {
    id: string;
    alumno_id: string;
    tipo_entidad: 'curso' | 'modulo' | 'unidad';
    entidad_id: string;
    estado: 'completado' | 'en_progreso' | 'disponible' | 'bloqueado';
    puntos_obtenidos: number;
    // ... potentially other fields
}

interface Achievement {
    logros: {
        nombre_es: string;
        icono: string;
        puntos: number;
    } | null;
}

interface NavigationHour {
    duracion_h: number | string | null;
}

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
        }

        // 1. Perfil y Rango
        const { data: profileData } = await supabase
            .from('profiles')
            .select('nombre, apellidos, avatar_url')
            .eq('id', user.id)
            .single();

        const profile = profileData as unknown as Profile | null;

        const { data: skills } = await supabase
            .from('habilidades_alumno')
            .select('habilidad_id');

        const skillCount = skills?.length || 0;

        // Calcular Rango según FASE 7
        let rango = 'Grumete';
        let color = 'text-slate-400';
        if (skillCount >= 10) { rango = 'Capitán'; color = 'text-yellow-400'; }
        else if (skillCount >= 7) { rango = 'Patrón'; color = 'text-purple-400'; }
        else if (skillCount >= 4) { rango = 'Timonel'; color = 'text-blue-400'; }
        else if (skillCount >= 1) { rango = 'Marinero'; color = 'text-green-400'; }

        // 2. Progreso Académico
        const { data: progressData } = await supabase
            .from('progreso_alumno')
            .select('*')
            .eq('alumno_id', user.id);

        const progress = (progressData || []) as unknown as ProgressItem[];

        const coursesEnrolled = progress.filter(p => p.tipo_entidad === 'curso').length;
        const coursesCompleted = progress.filter(p => p.tipo_entidad === 'curso' && p.estado === 'completado').length;
        const unitsCompleted = progress.filter(p => p.tipo_entidad === 'unidad' && p.estado === 'completado').length;

        // Calcular Progreso de Academia (Refactor con esquema estático)
        const completedModuleIds = new Set(
            progress.filter(p => p.tipo_entidad === 'modulo' && p.estado === 'completado')
                .map(p => p.entidad_id)
        );

        const academyProgress = calculateAcademyProgress(completedModuleIds, esquemaCursos.modules);

        // 3. Logros Recientes
        const { data: recentAchievementsData } = await supabase
            .from('logros_alumno')
            .select('logros(nombre_es, icono, puntos)')
            .eq('alumno_id', user.id)
            .order('fecha_obtenido', { ascending: false })
            .limit(3);

        const recentAchievements = (recentAchievementsData || []) as unknown as Achievement[];

        const totalPoints = progress.reduce((acc, p) => acc + (p.puntos_obtenidos || 0), 0);

        // 4. Horas de Navegación
        const { data: hoursData } = await supabase
            .from('horas_navegacion')
            .select('duracion_h')
            .eq('alumno_id', user.id);

        const hours = (hoursData || []) as unknown as NavigationHour[];

        const totalHours = hours.reduce((acc, curr) => acc + Number(curr.duracion_h || 0), 0);

        // 5. Siguiente Unidad (Quick Resume)
        // Buscamos la primera unidad que esté 'en_progreso' o 'disponible' en un curso activo
        // Para simplificar buscamos el curso con mayor progreso incompleto
        const activeCourse = progress.find(p => p.tipo_entidad === 'curso' && p.estado === 'en_progreso');
        let nextUnit = null;

        if (activeCourse) {
            // Buscar unidades de este curso que no estén completadas
            // Esto requiere saber la estructura, pero podemos hacer un aproximado con las de estado 'disponible'
            const { data: availableUnits } = await supabase
                .from('progreso_alumno')
                .select('entidad_id, unidades_didacticas(nombre_es, slug)')
                .eq('alumno_id', user.id)
                .eq('tipo_entidad', 'unidad')
                .eq('estado', 'disponible')
                .limit(1);

            if (availableUnits && availableUnits.length > 0) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                nextUnit = availableUnits[0] as any;
            }
        }

        return NextResponse.json({
            identity: {
                name: profile?.nombre ? `${profile.nombre} ${profile.apellidos || ''}`.trim() : user.email,
                avatar: profile?.avatar_url,
                rango,
                rangoColor: color,
                skillCount,
                totalSkills: 12
            },
            stats: {
                coursesEnrolled,
                coursesCompleted,
                unitsCompleted,
                academyProgress,
                totalHours,
                totalPoints
            },
            activity: {
                nextUnit,
                recentAchievements: recentAchievements.map(a => a.logros).filter(Boolean) || []
            }
        });

    } catch (error) {
        console.error('Error stats dashboard:', error);
        return NextResponse.json({ error: 'Error al obtener estadísticas' }, { status: 500 });
    }
}
