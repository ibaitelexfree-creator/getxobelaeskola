
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-guard';
import { verifyUnitAccess } from '@/lib/academy/enrollment';
// Import Rate Limiter
import { rateLimit } from '@/lib/security/rate-limit';

export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { user, error } = await requireAuth();
        if (error || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // --- RATE LIMITING (Phase 5) ---
        // Limit: 60 requests per minute per user
        const limitResult = rateLimit(user.id, 60, 60);
        if (!limitResult.success) {
            return NextResponse.json(
                {
                    error: 'Too Many Requests',
                    retry_after: Math.ceil((limitResult.reset - Date.now()) / 1000)
                },
                { status: 429 }
            );
        }
        // -------------------------------

        const hasAccess = await verifyUnitAccess(user.id, params.id);

        if (!hasAccess) {
            return NextResponse.json(
                { error: 'Resource not found' },
                { status: 404 }
            );
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
            return NextResponse.json(
                { error: 'Resource not found' },
                { status: 404 }
            );
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

        return NextResponse.json({
            unidad,
            navegacion: {
                anterior: unidadAnterior,
                siguiente: unidadSiguiente,
                total: unidadesHermanas?.length || 0,
                posicion: currentIndex + 1
            }
        });

    } catch (error) {
        console.error('Error fetching unit:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
