
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env');
const env = fs.readFileSync(envPath, 'utf8').split('\n').reduce((acc, line) => {
    const [key, ...value] = line.split('=');
    if (key && value) acc[key.trim()] = value.join('=').trim();
    return acc;
}, {});

// Mock user ID from a profile I know exists or a random one
const testUserId = '00000000-0000-0000-0000-000000000000';

async function simulateDashboardStats() {
    try {
        const supabase = createClient(
            env.NEXT_PUBLIC_SUPABASE_URL,
            env.SUPABASE_SERVICE_ROLE_KEY
        );

        console.log("Simulating dashboard stats for user:", testUserId);

        // 1. Fetch Profile
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', testUserId)
            .single();

        if (profileError && profileError.code !== 'PGRST116') {
            throw profileError;
        }

        // 2. Fetch Inscriptions
        const { data: rawInscriptions, error: insError } = await supabase
            .from('inscripciones')
            .select('*')
            .eq('perfil_id', testUserId);

        if (insError) throw insError;

        // Fetch Reference data
        const [
            { data: editions, error: edError },
            { data: allCourses, error: courseError }
        ] = await Promise.all([
            supabase.from('ediciones_curso').select('id, curso_id, fecha_inicio, fecha_fin'),
            supabase.from('cursos').select('id, nombre_es, nombre_eu, slug')
        ]);

        if (edError) throw edError;
        if (courseError) throw courseError;

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
        const { data: rentals, error: rentError } = await supabase
            .from('reservas_alquiler')
            .select(`
                *,
                servicios_alquiler (id, nombre_es, nombre_eu)
            `)
            .eq('perfil_id', testUserId);

        if (rentError) throw rentError;

        // 4. Academy Stats
        const [
            { data: progress, error: progError },
            { data: certs, error: certError },
            { data: horas, error: hrError }
        ] = await Promise.all([
            supabase.from('progreso_alumno').select('id, tipo_entidad, estado').eq('alumno_id', testUserId),
            supabase.from('certificados').select('id').eq('alumno_id', testUserId),
            supabase.from('horas_navegacion').select('duracion_h').eq('alumno_id', testUserId)
        ]);

        if (progError) throw progError;
        if (certError) throw certError;
        if (hrError) throw hrError;

        const totalHours = horas?.reduce((acc, curr) => acc + Number(curr.duracion_h), 0) || 0;
        const totalMiles = totalHours * 5.2;
        const academyLevels = progress?.filter(p => p.tipo_entidad === 'nivel' && p.estado === 'completado').length || 0;
        const academyCerts = certs?.length || 0;
        const hasAcademyActivity = (progress?.length || 0) > 0;

        console.log("Success! Academy Stats:");
        console.log({ totalHours, totalMiles, academyLevels, academyCerts, hasAcademyActivity });

    } catch (e) {
        console.error("Dashboard Stats Simulation FAILED:", e);
    }
}

simulateDashboardStats();
