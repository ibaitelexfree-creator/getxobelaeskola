import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 1. Fetch Profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        // 2. Fetch Inscriptions
        const { data: rawInscriptions } = await supabase
            .from('inscripciones')
            .select('*')
            .eq('perfil_id', user.id);

        // Fetch Reference data for Inscriptions (minimal set for performance)
        const [
            { data: editions },
            { data: allCourses }
        ] = await Promise.all([
            supabase.from('ediciones_curso').select('id, curso_id, fecha_inicio, fecha_fin'),
            supabase.from('cursos').select('id, nombre_es, nombre_eu, slug')
        ]);

        const enrichedInscriptions = (rawInscriptions || []).map(ins => {
            const ed = (editions || []).find(e => e.id === ins.edicion_id);
            const courseDirect = (allCourses || []).find(c => c.id === ins.curso_id);
            const courseViaEd = ed ? (allCourses || []).find(c => c.id === ed.curso_id) : null;

            return {
                ...ins,
                cursos: courseDirect || null,
                ediciones_curso: ed ? {
                    ...ed,
                    cursos: courseViaEd || null
                } : null
            };
        });

        // Extract enrolled course IDs for progress calculation
        const enrolledCourseIds = enrichedInscriptions
            .map(ins => ins.curso_id || ins.ediciones_curso?.curso_id)
            .filter(Boolean) as string[];

        // 3. Fetch Rentals
        const { data: rentals } = await supabase
            .from('reservas_alquiler')
            .select(`
                *,
                servicios_alquiler (id, nombre_es, nombre_eu)
            `)
            .eq('perfil_id', user.id);

        // 4. Academy Stats
        const [
            { data: progress },
            { data: certs },
            { data: horas },
            { data: userBonos },
            { count: totalModules },
            { count: completedModules }
        ] = await Promise.all([
            supabase.from('progreso_alumno').select('id, tipo_entidad, estado').eq('alumno_id', user.id),
            supabase.from('certificados').select('id').eq('alumno_id', user.id),
            supabase.from('horas_navegacion').select('duracion_h').eq('alumno_id', user.id),
            supabase.from('bonos_usuario')
                .select(`
                    *,
                    tipos_bono (nombre, description, categorias_validas)
                `)
                .eq('usuario_id', user.id)
                .in('estado', ['activo', 'agotado']),
            supabase.from('modulos')
                .select('id', { count: 'exact', head: true })
                .in('curso_id', enrolledCourseIds.length > 0 ? enrolledCourseIds : ['00000000-0000-0000-0000-000000000000']),
            supabase.from('progreso_alumno')
                .select('id', { count: 'exact', head: true })
                .eq('alumno_id', user.id)
                .eq('tipo_entidad', 'modulo')
                .eq('estado', 'completado')
        ]);

        const totalHours = horas?.reduce((acc, curr) => acc + Number(curr.duracion_h), 0) || 0;
        const totalMiles = totalHours * 5.2;
        const academyLevels = progress?.filter(p => p.tipo_entidad === 'nivel' && p.estado === 'completado').length || 0;
        const academyCerts = certs?.length || 0;
        const hasAcademyActivity = (progress?.length || 0) > 0;

        // Calculate Global Progress
        const safeTotalModules = totalModules || 0;
        const safeCompletedModules = completedModules || 0;
        const globalProgress = safeTotalModules > 0
            ? Math.round((safeCompletedModules / safeTotalModules) * 100)
            : 0;

        return NextResponse.json({
            profile: profile || null,
            user: {
                id: user.id,
                email: user.email
            },
            inscripciones: enrichedInscriptions,
            rentals: rentals || [],
            bonos: userBonos || [],
            academyStats: {
                totalHours: Math.round(totalHours * 10) / 10,
                totalMiles: Math.round(totalMiles),
                academyLevels,
                academyCerts,
                hasAcademyActivity,
                currentStreak: profile?.current_streak || 0,
                globalProgress,
                totalModules: safeTotalModules,
                completedModules: safeCompletedModules
            }
        });

    } catch (error: any) {
        console.error('CRITICAL: Error fetching dashboard stats:', error);

        // Detailed error logging for debugging
        if (error.code) console.error('Error Code:', error.code);
        if (error.message) console.error('Error Message:', error.message);
        if (error.details) console.error('Error Details:', error.details);
        if (error.stack) console.error('Error Stack:', error.stack);

        return NextResponse.json(
            {
                error: 'Internal Server Error',
                message: error.message || 'Unknown error',
                code: error.code || 'UNKNOWN'
            },
            { status: 500 }
        );
    }
}
