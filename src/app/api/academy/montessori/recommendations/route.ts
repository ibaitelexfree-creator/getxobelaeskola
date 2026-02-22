
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-guard';
import { withCors } from '@/lib/api-headers';
import { MONTESSORI_TOPICS } from '@/data/academy/montessori-topics';
import { getStudentRecommendations } from '@/lib/academy/montessori/recommender';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { user, error } = await requireAuth();
        if (error || !user) {
            return withCors(NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            ), request);
        }

        const supabase = createClient();

        // 1. Fetch recent failed attempts
        const { data: failedAttempts, error: attemptsError } = await supabase
            .from('intentos_evaluacion')
            .select('evaluacion_id, evaluacion:evaluacion_id(entidad_tipo, entidad_id)')
            .eq('alumno_id', user.id)
            .eq('aprobado', false)
            .order('created_at', { ascending: false })
            .limit(20);

        if (attemptsError) {
            console.error('Error fetching attempts:', attemptsError);
            return withCors(NextResponse.json({ error: 'Database Error' }, { status: 500 }), request);
        }

        // 2. Extract Unit IDs
        // We only care about failures in Units for now (as they map to topics best)
        const unitIds = failedAttempts
            .filter((a: any) => a.evaluacion?.entidad_tipo === 'unidad')
            .map((a: any) => a.evaluacion?.entidad_id)
            .filter((id: any) => id); // Remove nulls

        if (unitIds.length === 0) {
            // No failures? Return default recommendations (e.g., top rated or random)
            // The recommender handles empty tags by returning default scored items.
            const recommendations = getStudentRecommendations({}, MONTESSORI_TOPICS);
            return withCors(NextResponse.json({ recommendations }), request);
        }

        // 3. Fetch Unit Details (Slugs/Names) to use as Tags
        const { data: units, error: unitsError } = await supabase
            .from('unidades_didacticas')
            .select('id, slug, nombre_es')
            .in('id', unitIds);

        if (unitsError) {
             console.error('Error fetching units:', unitsError);
             return withCors(NextResponse.json({ error: 'Database Error' }, { status: 500 }), request);
        }

        // 4. Build Failed Tags Map
        const failedTags: Record<string, number> = {};

        // Count frequency based on attempts
        failedAttempts.forEach((attempt: any) => {
            const unitId = attempt.evaluacion?.entidad_id;
            const unit = units?.find((u: any) => u.id === unitId);

            if (unit) {
                // Use slug if available, otherwise normalize name
                // Also split slug by '-' to get individual keywords?
                // e.g. 'seguridad-maritima' -> 'seguridad', 'maritima'
                // This increases match probability with our topic tags.
                const keywords: string[] = [];

                if (unit.slug) {
                    keywords.push(...unit.slug.split('-'));
                } else if (unit.nombre_es) {
                     // Simple normalization
                     keywords.push(...unit.nombre_es.toLowerCase()
                        .replace(/[áéíóúñ]/g, (c: string) => "aeioun"["áéíóúñ".indexOf(c)])
                        .split(/\s+/)
                        .filter((w: string) => w.length > 3) // filter short words
                     );
                }

                keywords.forEach(kw => {
                    failedTags[kw] = (failedTags[kw] || 0) + 1;
                });
            }
        });

        // 5. Generate Recommendations
        const recommendations = getStudentRecommendations(failedTags, MONTESSORI_TOPICS);

        return withCors(NextResponse.json({
            recommendations,
            debug_tags: failedTags // Useful for frontend dev verification
        }), request);

    } catch (error) {
        console.error('Error generating recommendations:', error);
        return withCors(NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        ), request);
    }
}
