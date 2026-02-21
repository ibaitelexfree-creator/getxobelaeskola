import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';
import { withCors, corsHeaders } from '@/lib/api-headers';

export const dynamic = 'force-dynamic';

export async function OPTIONS(request: Request) {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders(request)
    });
}

export async function GET(request: Request, { params }: { params: { userId: string } }) {
    try {
        const { userId } = params;
        const { searchParams } = new URL(request.url);
        const locale = searchParams.get('locale') || 'es';

        // 1. AUTHENTICATION (Check who is asking)
        const supabase = createClient();
        const { data: { user: requester } } = await supabase.auth.getUser();

        // 2. FETCH TARGET PROFILE (Use Admin Client to bypass RLS for the check)
        const supabaseAdmin = createAdminClient();
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (profileError || !profile) {
            return withCors(NextResponse.json({ error: 'Profile not found' }, { status: 404 }), request);
        }

        // 3. VISIBILITY CHECK
        // Check if "is_public_profile" exists in the profile object (it might be null or undefined if column missing)
        // Default to false if missing.
        let isPublic = profile.is_public_profile === true;
        const isOwner = requester?.id === userId;

        // Fallback: Check auth metadata if column is missing or false (maybe user set it via settings API fallback)
        if (!isPublic && !isOwner) {
            const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId);
            if (!authError && authUser?.user_metadata?.is_public_profile === true) {
                isPublic = true;
            }
        }

        if (!isPublic && !isOwner) {
            return withCors(NextResponse.json({ error: 'Profile is private' }, { status: 403 }), request);
        }

        // 4. FETCH DATA (Use Admin Client since we established access rights)
        // We reuse the logic from progress/route.ts but targeted at userId

        const [
            resProgress,
            resCourses,
            resLevels
        ] = await Promise.all([
            supabaseAdmin.from('progreso_alumno').select('*').eq('alumno_id', userId),
            supabaseAdmin.from('cursos').select('id, slug, nombre_es, nombre_eu'),
            supabaseAdmin.from('niveles_formacion').select('id, slug, nombre_es, nombre_eu')
        ]);

        const rawProgress = resProgress.data || [];
        const allCourses = resCourses.data || [];
        const allLevels = resLevels.data || [];

        // Maps
        const courseMap = allCourses.reduce((acc: any, c: any) => ({ ...acc, [c.id]: c }), {});
        const levelMap = allLevels.reduce((acc: any, n: any) => ({ ...acc, [n.id]: n }), {});

        const filteredProgress = rawProgress.map((p: any) => {
             if (p.tipo_entidad === 'curso' && courseMap[p.entidad_id]) {
                return { ...p, slug: courseMap[p.entidad_id].slug, nombre: locale === 'eu' ? courseMap[p.entidad_id].nombre_eu : courseMap[p.entidad_id].nombre_es };
            }
            if (p.tipo_entidad === 'nivel' && levelMap[p.entidad_id]) {
                return { ...p, slug: levelMap[p.entidad_id].slug, nombre: locale === 'eu' ? levelMap[p.entidad_id].nombre_eu : levelMap[p.entidad_id].nombre_es };
            }
            return p;
        });

        // Additional Data
        const { data: skills } = await supabaseAdmin
            .from('habilidades_alumno')
            .select('fecha_obtencion, habilidad:habilidad_id(*)')
            .eq('alumno_id', userId);

        const { data: logros } = await supabaseAdmin
            .from('logros_alumno')
            .select('fecha_obtenido, logro:logro_id(*)')
            .eq('alumno_id', userId);

        const { data: horas } = await supabaseAdmin
            .from('horas_navegacion')
            .select('*')
            .eq('alumno_id', userId)
            .order('fecha', { ascending: false });

        const { data: certificados } = await supabaseAdmin
            .from('certificados')
            .select('*, curso:curso_id(nombre_es, nombre_eu), nivel:nivel_id(nombre_es, nombre_eu)')
            .eq('alumno_id', userId);

        // 5. CALCULATE STATISTICS (Same as progress/route.ts)
        const horasTotales = horas?.reduce((acc: number, h: any) => acc + Number(h.duracion_h), 0) || 0;
        const puntosTotales = filteredProgress.reduce((acc: number, p: any) => acc + (p.puntos_obtenidos || 0), 0) || 0;
        const nivelesCompletados = filteredProgress.filter((p: any) => p.tipo_entidad === 'nivel' && p.estado === 'completado').length;

        const cursosProgreso = filteredProgress.filter((p: any) => p.tipo_entidad === 'curso');
        const progresoGlobal = cursosProgreso.length > 0
            ? Math.round(cursosProgreso.reduce((acc: number, c: any) => acc + (c.porcentaje || 0), 0) / cursosProgreso.length)
            : 0;

        // Skill Radar
        const categoriesMap: Record<string, string> = {
            'tecnica': 'Maniobra',
            'seguridad': 'Seguridad',
            'meteorologia': 'Meteorología',
            'tactica': 'Táctica',
            'excelencia': 'Liderazgo'
        };

        const skillRadar = Object.entries(categoriesMap).map(([dbCat, uiLabel]) => {
            const userSkillsInCategory = (skills || []).filter((s: any) => s.habilidad?.categoria === dbCat).length;
            const maxEstimate = dbCat === 'tecnica' ? 6 : dbCat === 'excelencia' ? 1 : 2;
            const score = Math.min(100, Math.round((userSkillsInCategory / maxEstimate) * 100));
            return { subject: uiLabel, A: score, fullMark: 100 };
        });

        // Activity Heatmap
        const activityHeatmap = (horas || []).map((h: any) => ({
            date: h.fecha,
            count: Math.ceil(Number(h.duracion_h))
        }));

        // Boat Mastery
        const boatStats: Record<string, { hours: number, sessions: number, lastUsed: string }> = {};
        (horas || []).forEach((h: any) => {
            const boatName = h.embarcacion || 'Barco Genérico';
            if (!boatStats[boatName]) {
                boatStats[boatName] = { hours: 0, sessions: 0, lastUsed: h.fecha };
            }
            boatStats[boatName].hours += Number(h.duracion_h);
            boatStats[boatName].sessions += 1;
            if (new Date(h.fecha) > new Date(boatStats[boatName].lastUsed)) {
                boatStats[boatName].lastUsed = h.fecha;
            }
        });

        const boatMastery = Object.entries(boatStats).map(([name, stats]) => {
            let level = 'Iniciado';
            let progress = (stats.hours / 5) * 100;
            if (stats.hours >= 20) {
                level = 'Maestro';
                progress = 100;
            } else if (stats.hours >= 5) {
                level = 'Avanzado';
                progress = ((stats.hours - 5) / 15) * 100;
            }
            return {
                name,
                hours: stats.hours, // Keep as number for interface, format in UI if needed
                sessions: stats.sessions,
                level,
                progress: Math.min(100, Math.round(progress)),
                lastUsed: stats.lastUsed
            };
        });

        // 6. BUILD RESPONSE (PublicProfile Interface)
        // We filter sensitive data.

        const responseData = {
            user: {
                id: profile.id,
                full_name: profile.nombre ? `${profile.nombre} ${profile.apellidos || ''}`.trim() : 'Navegante',
                avatar_url: profile.avatar_url,
                bio: profile.bio || '', // Assuming bio might exist or default empty
                created_at: profile.created_at || new Date().toISOString(),
                is_public: isPublic
            },
            stats: {
                total_hours: horasTotales,
                total_points: puntosTotales,
                levels_completed: nivelesCompletados,
                global_progress: progresoGlobal,
                skills_unlocked: skills?.length || 0,
                badges_earned: logros?.length || 0,
                ranking_position: 0, // Placeholder
                streak_days: 0 // Placeholder or calculate if needed
            },
            badges: (logros || []).map((l: any) => ({
                id: l.logro.id,
                slug: l.logro.slug,
                name: locale === 'eu' ? l.logro.nombre_eu : l.logro.nombre_es,
                description: locale === 'eu' ? l.logro.descripcion_eu : l.logro.descripcion_es,
                icon: l.logro.icono,
                points: l.logro.puntos,
                rarity: l.logro.rareza,
                earned_at: l.fecha_obtenido
            })),
            skills: (skills || []).map((s: any) => ({
                id: s.habilidad.id,
                slug: s.habilidad.slug,
                name: locale === 'eu' ? s.habilidad.nombre_eu : s.habilidad.nombre_es,
                category: s.habilidad.categoria,
                icon: s.habilidad.icono,
                earned_at: s.fecha_obtencion
            })),
            certificates: (certificados || []).map((c: any) => ({
                id: c.id,
                name: locale === 'eu' ? c.nivel?.nombre_eu || c.curso?.nombre_eu : c.nivel?.nombre_es || c.curso?.nombre_es,
                course_name: locale === 'eu' ? c.curso?.nombre_eu : c.curso?.nombre_es,
                issued_at: c.fecha_emision,
                url: c.url_pdf
            })),
            logbook: (horas || []).map((h: any) => ({
                id: h.id,
                date: h.fecha,
                duration_hours: Number(h.duracion_h),
                boat_name: h.embarcacion,
                location: h.zona_nombre,
                conditions: h.condiciones_meteo,
                role: h.rol
            })),
            activity_heatmap: activityHeatmap,
            skill_radar: skillRadar,
            boat_mastery: boatMastery
        };

        return withCors(NextResponse.json(responseData), request);

    } catch (err) {
        console.error('Error fetching public profile:', err);
        return withCors(NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        ), request);
    }
}
