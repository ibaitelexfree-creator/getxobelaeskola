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

        // 2. Fetch Inscriptions with nested joins
        const startInscriptions = performance.now();
        const { data: inscriptionsData, error: inscriptionsError } = await supabase
            .from('inscripciones')
            .select(`
                *,
                cursos:curso_id(id, nombre_es, nombre_eu, slug),
                ediciones_curso:edicion_id(
                    id,
                    curso_id,
                    fecha_inicio,
                    fecha_fin,
                    cursos:curso_id(id, nombre_es, nombre_eu, slug)
                )
            `)
            .eq('perfil_id', user.id);

        const endInscriptions = performance.now();
        console.log(`[DashboardStats] Inscriptions fetch took: ${(endInscriptions - startInscriptions).toFixed(2)}ms`);

        if (inscriptionsError) {
            console.error('Error fetching inscriptions:', inscriptionsError);
        }

        const enrichedInscriptions = inscriptionsData || [];

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
            { data: userBonos }
        ] = await Promise.all([
            supabase.from('progreso_alumno').select('id, tipo_entidad, estado, updated_at, created_at').eq('alumno_id', user.id),
            supabase.from('certificados').select('id').eq('alumno_id', user.id),
            supabase.from('horas_navegacion').select('duracion_h').eq('alumno_id', user.id),
            supabase.from('bonos_usuario')
                .select(`
                    *,
                    tipos_bono (nombre, description, categorias_validas)
                `)
                .eq('usuario_id', user.id)
                .in('estado', ['activo', 'agotado'])
        ]);

        // Fetch Total Modules for enrolled courses
        const enrolledCourseIds = enrichedInscriptions
            .map(ins => ins.curso_id)
            .filter(Boolean);

        const { count: totalModules } = await supabase
            .from('modulos')
            .select('*', { count: 'exact', head: true })
            .in('curso_id', enrolledCourseIds);

        const totalHours = horas?.reduce((acc, curr) => acc + Number(curr.duracion_h), 0) || 0;
        const totalMiles = totalHours * 5.2;
        const academyLevels = progress?.filter(p => p.tipo_entidad === 'nivel' && p.estado === 'completado').length || 0;
        const academyCerts = certs?.length || 0;
        const hasAcademyActivity = (progress?.length || 0) > 0;

        // Streak Calculation
        const activityDates = (progress || [])
            .map(p => {
                const dateStr = p.updated_at || p.created_at;
                return dateStr ? new Date(dateStr).toISOString().split('T')[0] : null;
            })
            .filter((d): d is string => Boolean(d))
            .sort((a, b) => b.localeCompare(a));

        const uniqueDates = Array.from(new Set(activityDates));

        let currentStreak = 0;
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        if (uniqueDates.length > 0) {
            // Check if the streak is active (today or yesterday has activity)
            if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
                currentStreak = 1;
                let lastDate = new Date(uniqueDates[0]);

                for (let i = 1; i < uniqueDates.length; i++) {
                    const currentDate = new Date(uniqueDates[i]);
                    const diffTime = Math.abs(lastDate.getTime() - currentDate.getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    if (diffDays === 1) {
                        currentStreak++;
                        lastDate = currentDate;
                    } else {
                        break;
                    }
                }
            }
        }

        // Global Progress Calculation
        const completedModules = (progress || []).filter(p => p.tipo_entidad === 'modulo' && p.estado === 'completado').length;
        const safeTotalModules = totalModules || 1; // Prevent division by zero
        const globalProgress = Math.min(100, Math.round((completedModules / safeTotalModules) * 100));

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
                currentStreak,
                globalProgress,
                completedModules,
                totalModules: totalModules || 0
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
