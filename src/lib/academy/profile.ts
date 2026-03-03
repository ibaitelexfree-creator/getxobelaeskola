import { createClient } from '@/lib/supabase/server';

export async function getPublicProfile(userId: string) {
    const supabase = createClient();

    try {
        // 1. Get Profile & Check Visibility
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, nombre, apellidos, avatar_url, is_public, rol')
            .eq('id', userId)
            .single();

        if (profileError || !profile) {
            console.error('Error fetching profile:', profileError);
            return null;
        }

        // Check if public or if requester is owner
        const { data: { user } } = await supabase.auth.getUser();
        const isOwner = user?.id === userId;

        if (!profile.is_public && !isOwner) {
            return { error: 'private', isOwner: false };
        }

        // 2. Fetch Stats
        const { data: progress } = await supabase
            .from('progreso_alumno')
            .select('*')
            .eq('alumno_id', userId);

        const modulesCompleted = progress?.filter((p: any) => p.tipo_entidad === 'modulo' && p.estado === 'completado').length || 0;
        const coursesCompleted = progress?.filter((p: any) => p.tipo_entidad === 'curso' && p.estado === 'completado').length || 0;

        // 3. Fetch Badges
        const { data: badges } = await supabase
            .from('logros_alumno')
            .select(`
                fecha_obtenido,
                logro:logros (
                    id, slug, nombre_es, nombre_eu, descripcion_es, descripcion_eu, icono, rareza
                )
            `)
            .eq('alumno_id', userId);

        // 4. Fetch Logbook
        const { data: logbook } = await supabase
            .from('horas_navegacion')
            .select('*')
            .eq('alumno_id', userId)
            .order('fecha', { ascending: false })
            .limit(20);

        const totalHours = logbook?.reduce((acc: number, entry: any) => acc + (Number(entry.duracion_h) || 0), 0) || 0;

        // 5. Fetch Certificates
        const { data: certificates } = await supabase
            .from('certificados')
            .select(`
                *,
                curso:cursos (nombre_es, nombre_eu),
                nivel:niveles_formacion (nombre_es, nombre_eu)
            `)
            .eq('alumno_id', userId);

        return {
            profile,
            stats: {
                modulesCompleted,
                coursesCompleted,
                totalHours,
                totalMiles: (totalHours * 5.2).toFixed(1)
            },
            badges: badges || [],
            logbook: logbook || [],
            certificates: certificates || [],
            isOwner
        };
    } catch (error) {
        console.error('Unexpected error in getPublicProfile:', error);
        return null;
    }
}
