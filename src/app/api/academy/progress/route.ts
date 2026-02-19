
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(request.url);
        const locale = searchParams.get('locale') || 'es';

        // 1. Authenticate User
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Fetch Profile
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

        // 3. Fetch All Progress Related Data
        const [
            { data: progress },
            { data: skills },
            { data: achievements },
            { data: hours },
            { data: certificates },
            { data: enrollments }
        ] = await Promise.all([
            // @ts-ignore
            supabase.from('progreso_alumno').select('*').eq('alumno_id', user.id),
            // @ts-ignore
            supabase.from('habilidades_alumno').select('*, habilidades(*)').eq('alumno_id', user.id),
            // @ts-ignore
            supabase.from('logros_alumno').select('*, logros(*)').eq('alumno_id', user.id),
            // @ts-ignore
            supabase.from('horas_navegacion').select('*').eq('alumno_id', user.id).order('fecha', { ascending: false }),
            // @ts-ignore
            supabase.from('certificados').select('*').eq('alumno_id', user.id),
            // @ts-ignore
            supabase.from('inscripciones').select('curso_id').eq('perfil_id', user.id)
        ]);

        // 4. Calculate Stats & Derived Data
        const totalHours = hours?.reduce((acc, curr) => acc + Number(curr.duracion_h || 0), 0) || 0;
        const totalValidationMiles = totalHours * 5.2;

        const skillsCount = skills?.length || 0;
        const achievementsCount = achievements?.length || 0;

        // Calculate Global Progress (Average of all courses or just general XP view)
        // For now, let's use a simple metric based on completed entities
        const completedCount = progress?.filter((p: any) => p.estado === 'completado').length || 0;
        const totalEntities = progress?.length || 1; // Avoid division by zero
        const globalProgress = Math.min(100, Math.round((completedCount / Math.max(10, totalEntities)) * 100)); // Mock logic for now

        // Process Skills for Radar
        // categories: tecnica, tactica, seguridad, meteorologia, excelencia
        const skillCategories = ['tecnica', 'tactica', 'seguridad', 'meteorologia', 'excelencia'];
        const skillRadar = skillCategories.map(cat => {
            const catSkills = skills?.filter((s: any) => s.habilidades?.categoria === cat) || [];
            // Mock max skills per category usually 2-3
            const val = Math.min(100, (catSkills.length / 3) * 100);
            return {
                subject: cat.charAt(0).toUpperCase() + cat.slice(1),
                A: val,
                fullMark: 100
            };
        });

        // Process Activity Heatmap
        // Map hours to dates
        const activityHeatmap = hours?.map(h => ({
            date: h.fecha,
            count: Math.ceil(Number(h.duracion_h))
        })) || [];

        // Recommendations (Mock for now, can be improved with AI or logic)
        const recommendations = [
            {
                id: 'rec1',
                title: 'Practica Nudos',
                description: 'Mejora tu destreza con los nudos básicos.',
                link: '/academy/tools/knots',
                type: 'practice'
            },
            {
                id: 'rec2',
                title: 'Meteorología Básica',
                description: 'Aprende a interpretar las nubes.',
                link: '/academy/tools/wind-lab',
                type: 'theory'
            }
        ];

        // Structure Response matching DashboardData interface
        const dashboardData = {
            user: {
                full_name: profile?.nombre ? `${profile.nombre} ${profile.apellidos || ''}` : user.email,
                avatar_url: profile?.avatar_url || '',
                id: user.id,
                email: user.email
            },
            progreso: progress || [],
            habilidades: skills?.map((s: any) => ({
                habilidad: s.habilidades,
                fecha_obtencion: s.fecha_obtenido
            })) || [],
            logros: achievements?.map((a: any) => ({
                logro: a.logros,
                fecha_obtencion: a.fecha_obtenido
            })) || [],
            estadisticas: {
                horas_totales: totalHours,
                puntos_totales: achievements?.reduce((acc: number, curr: any) => acc + (curr.logros?.puntos || 0), 0) || 0,
                niveles_completados: progress?.filter((p: any) => p.tipo_entidad === 'nivel' && p.estado === 'completado').length || 0,
                progreso_global: globalProgress,
                habilidades_desbloqueadas: skillsCount,
                logros_obtenidos: achievementsCount,
                racha_dias: 3, // Mock calculation for streak
                posicion_ranking: 42, // Mock ranking
                proximo_logro: null, // To be implemented
                activity_heatmap: activityHeatmap,
                skill_radar: skillRadar,
                boat_mastery: [] // To be implemented
            },
            horas: hours || [],
            certificados: certificates || [],
            is_staff: profile?.role === 'admin' || profile?.role === 'staff',
            enrolledCourseIds: enrollments?.map((e: any) => e.curso_id) || [],
            recommendations: recommendations
        };

        return NextResponse.json(dashboardData);

    } catch (error) {
        console.error('Unexpected error in academy progress API:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
