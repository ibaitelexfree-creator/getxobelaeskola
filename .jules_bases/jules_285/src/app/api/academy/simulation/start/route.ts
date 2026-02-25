
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function POST() {
    try {
        const supabase = await createClient();
        const supabaseAdmin = createAdminClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
        }

        // 1. Fetch all question IDs to pick random ones
        // We select only ID to keep it light
        const { data: allQuestions, error: idsError } = await supabaseAdmin
            .from('preguntas')
            .select('id');

        if (idsError) {
            console.error('Error fetching question IDs:', idsError);
            return NextResponse.json({ error: 'Error al obtener preguntas' }, { status: 500 });
        }

        if (!allQuestions || allQuestions.length === 0) {
            return NextResponse.json({ error: 'No hay preguntas disponibles' }, { status: 404 });
        }

        // 2. Shuffle and pick 60
        const shuffled = allQuestions.sort(() => 0.5 - Math.random());
        const selectedIds = (shuffled as any[]).slice(0, 60).map((q: any) => q.id);

        // 3. Fetch details for selected questions
        const { data: questions, error: detailsError } = await supabaseAdmin
            .from('preguntas')
            .select('id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, puntos, imagen_url')
            .in('id', selectedIds);

        if (detailsError) {
            console.error('Error fetching question details:', detailsError);
            return NextResponse.json({ error: 'Error al obtener detalles de preguntas' }, { status: 500 });
        }

        // 4. Return structure compatible with frontend
        return NextResponse.json({
            allowed: true,
            preguntas: questions,
            tiempo_limite_min: 90,
            tiempo_inicio: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error en simulación start:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
