import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-guard';
import { getUserEnrollments } from '@/lib/academy/enrollment';
import { withCors, corsHeaders } from '@/lib/api-headers';

export const dynamic = 'force-dynamic';

export async function OPTIONS(request: Request) {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders(request)
    });
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const locale = searchParams.get('locale') || 'es';

        // 1. AUTHENTICATION
        const { user, profile, error } = await requireAuth();
        if (error || !user) {
            return withCors(NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            ), request);
        }

        const is_staff = profile?.rol === 'admin' || profile?.rol === 'instructor';

        // 2. AUTHORIZATION
        const enrolledCourseIds = await getUserEnrollments(user.id);

        // 3. FETCH PROGRESS & METADATA
        const supabase = createClient();

        const [
            resProgress,
            resCourses,
            resLevels
        ] = await Promise.all([
            supabase.from('progreso_alumno').select('*').eq('alumno_id', user.id),
            supabase.from('cursos').select('id, slug, nombre_es, nombre_eu'),
            supabase.from('niveles_formacion').select('id, slug, nombre_es, nombre_eu')
        ]);

        if (resProgress.error) {
            console.error('Progress Error:', resProgress.error);
            return withCors(NextResponse.json({ error: 'Error loading progress' }, { status: 500 }), request);
        }

        const rawProgress = resProgress.data;
        const allCourses = resCourses.data;
        const allLevels = resLevels.data;

        // Create lookup maps
        const courseMap = (allCourses || []).reduce((acc: any, c: any) => ({ ...acc, [c.id]: c }), {});
        const levelMap = (allLevels || []).reduce((acc: any, n: any) => ({ ...acc, [n.id]: n }), {});

        const filteredProgress = (rawProgress || []).map((p: any) => {
            if (p.tipo_entidad === 'curso' && courseMap[p.entidad_id]) {
                return { ...p, slug: courseMap[p.entidad_id].slug, nombre: locale === 'eu' ? courseMap[p.entidad_id].nombre_eu : courseMap[p.entidad_id].nombre_es };
            }
            if (p.tipo_entidad === 'nivel' && levelMap[p.entidad_id]) {
                return { ...p, slug: levelMap[p.entidad_id].slug, nombre: locale === 'eu' ? levelMap[p.entidad_id].nombre_eu : levelMap[p.entidad_id].nombre_es };
            }
            return p;
        });

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

        const cursosProgreso = filteredProgress.filter((p: any) => p.tipo_entidad === 'curso');
        const progresoGlobal = cursosProgreso.length > 0
            ? Math.round(cursosProgreso.reduce((acc: number, c: any) => acc + (c.porcentaje || 0), 0) / cursosProgreso.length)
            : 0;

        // Skill radar
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

        const activityHeatmap = (horas || []).map((h: any) => ({
            date: h.fecha,
            count: Math.ceil(Number(h.duracion_h))
        }));

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
                hours: stats.hours.toFixed(1),
                sessions: stats.sessions,
                level,
                progress: Math.min(100, Math.round(progress)),
                lastUsed: stats.lastUsed
            };
        });

        // 6. ADVANCED CAREER ADVISOR ENGINE (V2)
        const recommendations: any[] = [];
        const userHabilidades = (skills || []).map((s: any) =>
            Array.isArray(s.habilidad) ? s.habilidad[0]?.slug : s.habilidad?.slug
        );

        const totalSessions = (horas || []).length;
        const distinctBoats = new Set((horas || []).map((h: any) => h.embarcacion).filter(Boolean)).size;
        const totalHours = horasTotales;

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentSessions = (horas || []).filter((h: any) => new Date(h.fecha) > thirtyDaysAgo).length;
        const consistencyScore = Math.min(100, (recentSessions / 4) * 100);

        const hasTrimado = userHabilidades.includes('trimador');

        const highWindSessions = (horas || []).filter((h: any) => {
            const meteo = (h.condiciones_meteo || '').toLowerCase();
            const windMatch = meteo.match(/(\d+)\s*(kt|knots|nudos)/);
            return windMatch && parseInt(windMatch[1]) > 15;
        });

        const analysis = {
            consistency: consistencyScore,
            variety: Math.min(100, (distinctBoats / 3) * 100),
            experience: Math.min(100, (totalHours / 100) * 100),
            specialization: hasTrimado ? 80 : 20
        };

        // Decision Tree for "Smart Next Step"
        // LOCALIZED LINKS: //...
        if (nivelesCompletados === 0 && totalSessions === 0) {
            recommendations.push({
                id: 'path-initiation',
                type: 'path',
                title: 'Ruta de Iniciación: De Cero a Navegante',
                message: 'Tu perfil está listo para la transformación. El análisis sugiere comenzar con la base teórica de Vela Ligera para desbloquear tu primer rango oficial.',
                analysis: 'Potencial detectado. Falta registro de horas base.',
                actionLabel: 'Ver Plan de Carrera',
                actionHref: `/${locale}/academy/course/iniciacion-vela-ligera`,
                stats: analysis,
                priority: 'high'
            });
        } else if (highWindSessions.length === 0 && totalHours > 10 && !hasTrimado) {
            recommendations.push({
                id: 'path-heavy-weather',
                type: 'specialization',
                title: 'Especialización: Dominio del Temporal',
                message: 'Tu técnica es sólida en vientos medios, pero el análisis de bitácora muestra una brecha en condiciones >15kt. El siguiente paso lógico es el perfeccionamiento de trimado.',
                analysis: 'Base técnica completada. Falta experiencia en viento fuerte.',
                actionLabel: 'Masterclass de Trimado',
                actionHref: `/${locale}/courses/masterclass-trimado`,
                stats: analysis,
                priority: 'critical'
            });
        } else if (distinctBoats < 2 && totalSessions > 5) {
            recommendations.push({
                id: 'path-versatility',
                type: 'versatility',
                title: 'Reto de Versatilidad: Cambio de Eslora',
                message: 'Has dominado tu embarcación habitual. Para alcanzar el rango de Timonel, el sistema recomienda probar un monotipo diferente o participar en una travesía de crucero.',
                analysis: 'Consistencia alta. Poca variedad de embarcación.',
                actionLabel: 'Explorar Flota',
                actionHref: `/${locale}/rental`,
                stats: analysis,
                priority: 'medium'
            });
        } else if (nivelesCompletados < 7) {
            const nextLevel = (nivelesCompletados + 1);
            recommendations.push({
                id: 'path-next-level',
                type: 'ascension',
                title: `Ascensión a Rango Nivel ${nextLevel}`,
                message: 'Mantienes un rumbo excelente. Tu consistencia es superior al 80% de los alumnos de tu nivel. Sigue acumulando millas para desbloquear el siguiente certificado.',
                analysis: 'Progreso lineal estable. El objetivo es la persistencia.',
                actionLabel: 'Continuar Bitácora',
                actionHref: `/${locale}/academy`,
                stats: analysis,
                priority: 'high'
            });
        }

        return withCors(NextResponse.json({
            user: {
                id: user.id,
                full_name: profile?.nombre ? `${profile.nombre} ${profile.apellidos || ''}`.trim() : user.email,
                avatar_url: profile?.avatar_url,
                is_public: profile?.is_public || false
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
            certificados: certificados || [],
            horas: (horas || []).map((h: any) => ({
                ...h,
                ubicacion: h.ubicacion || null,
                zona_nombre: h.zona_nombre || 'Zona Desconocida'
            })),
            estadisticas: {
                horas_totales: horasTotales,
                puntos_totales: puntosTotales,
                niveles_completados: nivelesCompletados,
                progreso_global: progresoGlobal,
                habilidades_desbloqueadas: skills?.length || 0,
                logros_obtenidos: logros?.length || 0,
                racha_dias: 0,
                posicion_ranking: 1,
                proximo_logro: null,
                activity_heatmap: activityHeatmap,
                skill_radar: skillRadar,
                boat_mastery: boatMastery
            },
            is_staff: profile?.rol === 'admin' || profile?.rol === 'instructor',
            enrolledCourseIds,
            recommendations
        }), request);

    } catch (err) {
        console.error('Error fetching progress:', err);
        return withCors(NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        ), request);
    }
}
