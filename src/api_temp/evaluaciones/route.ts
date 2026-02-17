import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(request.url);

        const entidadTipo = searchParams.get('entidad_tipo');
        const entidadId = searchParams.get('entidad_id');

        if (!entidadTipo || !entidadId) {
            return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('evaluaciones')
            .select('id, tipo, titulo_es, titulo_eu, num_preguntas, tiempo_limite_min')
            .eq('entidad_tipo', entidadTipo)
            .eq('entidad_id', entidadId)
            .eq('activa', true)
            .single();

        if (error || !data) {
            return NextResponse.json({ error: 'Evaluación no encontrada' }, { status: 404 });
        }

        return NextResponse.json(data);

    } catch (error) {
        console.error('Error en GET /api/academy/evaluaciones:', error);
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
    }
}
