
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-guard';
import { verifyUnitAccess } from '@/lib/academy/enrollment';
// Import Rate Limiter
import { rateLimit } from '@/lib/security/rate-limit';
import { withCors, corsHeaders } from '@/lib/api-headers';

export const dynamic = 'force-dynamic';

export async function OPTIONS(request: Request) {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders(request)
    });
}

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { user, error } = await requireAuth();
        if (error || !user) {
            return withCors(NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            ), request);
        }

        // --- RATE LIMITING (Phase 5) ---
        // Limit: 60 requests per minute per user
        const limitResult = rateLimit(user.id, 60, 60);
        if (!limitResult.success) {
            return withCors(NextResponse.json(
                {
                    error: 'Too Many Requests',
                    retry_after: Math.ceil((limitResult.reset - Date.now()) / 1000)
                },
                { status: 429 }
            ), request);
        }
        // -------------------------------

        const hasAccess = await verifyUnitAccess(user.id, params.id);

        if (!hasAccess) {
            return withCors(NextResponse.json(
                { error: 'Resource not found' },
                { status: 404 }
            ), request);
        }

        const supabase = createClient();
        const { data: unidad, error: unidadError } = await supabase
            .from('unidades_didacticas')
            .select(`
                *,
                modulo:modulo_id (
                    id,
                    nombre_es,
                    nombre_eu,
                    orden,
                    curso:curso_id (
                        id,
                        slug,
                        nombre_es,
                        nombre_eu,
                        nivel_formacion:nivel_formacion_id (
                            slug,
                            nombre_es,
                            nombre_eu,
                            orden
                        )
                    )
                )
            `)
            .eq('id', params.id)
            .single();

        if (unidadError || !unidad) {
            return withCors(NextResponse.json(
                { error: 'Resource not found' },
                { status: 404 }
            ), request);
        }

        // Fetch activities (Specifically written exercises for peer review)
        const { data: actividades } = await supabase
            .from('actividades')
            .select('id, tipo, titulo_es, titulo_eu, descripcion_es, descripcion_eu, rubrica')
            .eq('unidad_id', params.id)
            .eq('tipo', 'ejercicio_escrito');

        // Fetch user attempts for these activities
        let intentos = [];
        if (actividades && actividades.length > 0) {
            const actividadIds = actividades.map((a: any) => a.id);
            const { data: intentosData } = await supabase
                .from('intentos_actividad')
                .select('id, actividad_id, estado_revision, datos_json, created_at')
                .eq('alumno_id', user.id)
                .in('actividad_id', actividadIds);

            intentos = intentosData || [];
        }

        const { data: unidadesHermanas } = await supabase
            .from('unidades_didacticas')
            .select('id, orden, nombre_es, nombre_eu')
            .eq('modulo_id', unidad.modulo_id)
            .order('orden');

        const currentIndex = unidadesHermanas?.findIndex((u: any) => u.id === params.id) ?? -1;
        const unidadAnterior = currentIndex > 0 ? unidadesHermanas?.[currentIndex - 1] : null;
        const unidadSiguiente = currentIndex >= 0 && currentIndex < (unidadesHermanas?.length ?? 0) - 1
            ? unidadesHermanas?.[currentIndex + 1]
            : null;

        return withCors(NextResponse.json({
            unidad,
            actividades: actividades || [],
            intentos: intentos || [],
            navegacion: {
                anterior: unidadAnterior,
                siguiente: unidadSiguiente,
                total: unidadesHermanas?.length || 0,
                posicion: currentIndex + 1
            }
        }), request);

    } catch (error) {
        console.error('Error fetching unit:', error);
        return withCors(NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        ), request);
    }
}
