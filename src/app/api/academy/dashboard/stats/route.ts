import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
        }

        // 1. Perfil y Rango
        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', user.id)
            .single();

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
        const { data: progress } = await supabase
            .from('progreso_alumno')
            .select('*')
            .eq('alumno_id', user.id);

        const coursesEnrolled = progress?.filter(p => p.tipo_entidad === 'curso').length || 0;
        const coursesCompleted = progress?.filter(p => p.tipo_entidad === 'curso' && p.estado === 'completado').length || 0;
        const unitsCompleted = progress?.filter(p => p.tipo_entidad === 'unidad' && p.estado === 'completado').length || 0;

        // 3. Logros Recientes
        const { data: recentAchievements } = await supabase
            .from('logros_alumno')
            .select('logros(nombre_es, icono, puntos)')
            .eq('alumno_id', user.id)
            .order('fecha_obtenido', { ascending: false })
            .limit(3);

        const totalPoints = progress?.reduce((acc, p) => acc + (p.puntos_obtenidos || 0), 0) || 0;

        // 4. Horas de Navegación
        const { data: hoursData } = await supabase
            .from('horas_navegacion')
            .select('duracion_h')
            .eq('alumno_id', user.id);

        const totalHours = hoursData?.reduce((acc, curr) => acc + Number(curr.duracion_h), 0) || 0;

        // 5. Siguiente Unidad (Quick Resume)
        // Buscamos la primera unidad que esté 'en_progreso' o 'disponible' en un curso activo
        // Para simplificar buscamos el curso con mayor progreso incompleto
        const activeCourse = progress?.find(p => p.tipo_entidad === 'curso' && p.estado === 'en_progreso');
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
                nextUnit = availableUnits[0];
            }
        }

        return NextResponse.json({
            identity: {
                name: profile?.full_name || user.email,
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
                totalHours,
                totalPoints
            },
            activity: {
                nextUnit,
                recentAchievements: recentAchievements?.map(a => a.logros) || []
            }
        });

    } catch (error) {
        console.error('Error stats dashboard:', error);
        return NextResponse.json({ error: 'Error al obtener estadísticas' }, { status: 500 });
    }
}
