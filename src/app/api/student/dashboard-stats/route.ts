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
            supabase.from('progreso_alumno').select('id, tipo_entidad, estado').eq('alumno_id', user.id),
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

        const totalHours = horas?.reduce((acc, curr) => acc + Number(curr.duracion_h), 0) || 0;
        const totalMiles = totalHours * 5.2;
        const academyLevels = progress?.filter(p => p.tipo_entidad === 'nivel' && p.estado === 'completado').length || 0;
        const academyCerts = certs?.length || 0;
        const hasAcademyActivity = (progress?.length || 0) > 0;

        // 5. Study Sessions Aggregation
        const [
            { data: evaluations },
            { data: progressDetails },
            { data: achievements }
        ] = await Promise.all([
            supabase.from('intentos_evaluacion')
                .select('created_at, tiempo_empleado_seg, puntuacion, preguntas_json')
                .eq('alumno_id', user.id),
            supabase.from('progreso_alumno')
                .select('updated_at, tipo_entidad')
                .eq('alumno_id', user.id)
                .in('tipo_entidad', ['modulo', 'unidad']),
            supabase.from('logros_alumno')
                .select('fecha_obtenido, logros (puntos)')
                .eq('alumno_id', user.id)
        ]);

        const sessionsMap = new Map<string, {
            date: string;
            duration: number;
            modulesVisited: number;
            questionsAnswered: number;
            xpEarned: number;
        }>();

        const getSession = (dateStr: string) => {
            const date = dateStr ? dateStr.split('T')[0] : new Date().toISOString().split('T')[0];
            if (!sessionsMap.has(date)) {
                sessionsMap.set(date, {
                    date,
                    duration: 0,
                    modulesVisited: 0,
                    questionsAnswered: 0,
                    xpEarned: 0
                });
            }
            return sessionsMap.get(date)!;
        };

        // Process Evaluations
        (evaluations || []).forEach(ev => {
            const session = getSession(ev.created_at);
            session.duration += ev.tiempo_empleado_seg || 0;
            // Assuming preguntas_json is an array of questions or has a length property
            let questionCount = 0;
            if (Array.isArray(ev.preguntas_json)) {
                questionCount = ev.preguntas_json.length;
            } else if (ev.preguntas_json && typeof ev.preguntas_json === 'object' && !Array.isArray(ev.preguntas_json)) {
                // Handle case where it might be an object with keys
                 questionCount = Object.keys(ev.preguntas_json).length;
            }

            session.questionsAnswered += questionCount;
            session.xpEarned += Number(ev.puntuacion) || 0;
        });

        // Process Progress (Modules/Units)
        (progressDetails || []).forEach(prog => {
            const session = getSession(prog.updated_at);
            session.modulesVisited += 1;
            // Estimate duration: 15 mins (900s) per module visit if not tracked elsewhere
            session.duration += 900;
        });

        // Process Achievements
        (achievements || []).forEach(ach => {
            const session = getSession(ach.fecha_obtenido);
            session.xpEarned += (ach.logros as any)?.puntos || 0;
        });

        const studySessions = Array.from(sessionsMap.values()).sort((a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );

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
                hasAcademyActivity
            },
            studySessions
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
