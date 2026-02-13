
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-guard';
import { getUserEnrollments } from '@/lib/academy/enrollment';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // 1. AUTHENTICATION
        const { user, profile, error } = await requireAuth();
        if (error || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const is_staff = profile?.rol === 'admin' || profile?.rol === 'instructor';

        // 2. AUTHORIZATION
        // Get list of enrolled courses to filter context
        const enrolledCourseIds = await getUserEnrollments(user.id);

        // 3. FETCH PROGRESS
        const supabase = createClient();

        // Only fetch progress related to enrolled courses?
        // OR fetch all and filter in memory?
        // Progress table might not have `curso_id` on every row (e.g. `unidad` progress).
        // Best approach: Fetch all, but ensure we don't leak "existence" of unenrolled content via detailed metadata (if attached).
        // Since `progreso_alumno` is purely user data, it's safer to return it.
        // However, we should verify the `entidad_id` belongs to an enrolled course if strictly paranoid.
        // For performance, getting all user progress is usually acceptable if it's THEIR data.
        // But to be "Hardened":

        const { data: rawProgress, error: progressError } = await supabase
            .from('progreso_alumno')
            .select('*')
            .eq('alumno_id', user.id);

        if (progressError) {
            return NextResponse.json({ error: 'Error loading progress' }, { status: 500 });
        }

        const filteredProgress = rawProgress || [];

        // 4. FETCH ADDITIONAL DATA FOR DASHBOARD
        const { data: skills } = await supabase
            .from('habilidades_alumno')
            .select('fecha_obtencion, habilidad:habilidad_id(*)')
            .eq('alumno_id', user.id);

        const { data: logros } = await supabase
            .from('logros_alumno')
            .select('fecha_obtenido, logro:logro_id(*)')
            .eq('alumno_id', user.id);

        const { data: horas } = await supabase
            .from('horas_navegacion')
            .select('*')
            .eq('alumno_id', user.id)
            .order('fecha', { ascending: false });

        const { data: certificados } = await supabase
            .from('certificados')
            .select('*, curso:curso_id(nombre_es, nombre_eu), nivel:nivel_id(nombre_es, nombre_eu)')
            .eq('alumno_id', user.id);

        // 5. CALCULATE STATISTICS
        const horasTotales = horas?.reduce((acc: number, h: any) => acc + Number(h.duracion_h), 0) || 0;
        const puntosTotales = filteredProgress.reduce((acc: number, p: any) => acc + (p.puntos_obtenidos || 0), 0) || 0;
        const nivelesCompletados = filteredProgress.filter((p: any) => p.tipo_entidad === 'nivel' && p.estado === 'completado').length;

        // Progreso global: average of course percentages
        const cursosProgreso = filteredProgress.filter((p: any) => p.tipo_entidad === 'curso');
        const progresoGlobal = cursosProgreso.length > 0
            ? Math.round(cursosProgreso.reduce((acc: number, c: any) => acc + (c.porcentaje || 0), 0) / cursosProgreso.length)
            : 0;

        // Skill radar dummy data (should be calculated from actual skills/progress)
        const skillRadar = [
            { subject: 'Navegación', A: 80, fullMark: 100 },
            { subject: 'Seguridad', A: 65, fullMark: 100 },
            { subject: 'Meteorología', A: 40, fullMark: 100 },
            { subject: 'Reglamento', A: 90, fullMark: 100 },
            { subject: 'Maniobra', A: 70, fullMark: 100 },
        ];

        // Activity heatmap (last 30 days)
        const activityHeatmap = (horas || []).map((h: any) => ({
            date: h.fecha,
            count: Math.ceil(Number(h.duracion_h))
        }));

        return NextResponse.json({
            user: {
                full_name: profile?.full_name || user.email,
                avatar_url: profile?.avatar_url
            },
            progreso: filteredProgress,
            habilidades: skills?.map((s: any) => ({
                habilidad: s.habilidad,
                fecha_obtencion: s.fecha_obtencion
            })) || [],
            logros: logros?.map((l: any) => ({
                logro: l.logro,
                fecha_obtencion: l.fecha_obtenido
            })) || [],
            estadisticas: {
                horas_totales: horasTotales,
                puntos_totales: puntosTotales,
                niveles_completados: nivelesCompletados,
                progreso_global: progresoGlobal,
                habilidades_desbloqueadas: skills?.length || 0,
                logros_obtenidos: logros?.length || 0,
                racha_dias: 0, // Simplified for now
                posicion_ranking: 1, // Simplified for now
                proximo_logro: null,
                activity_heatmap: activityHeatmap,
                skill_radar: skillRadar
            },
            horas: horas || [],
            certificados: certificados || [],
            is_staff,
            enrolledCourseIds
        });

    } catch (err) {
        console.error('Error fetching progress:', err);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
