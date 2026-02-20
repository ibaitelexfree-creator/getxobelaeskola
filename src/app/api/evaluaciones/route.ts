import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
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
        const supabase = await createClient();
        const { searchParams } = new URL(request.url);

        const entidadTipo = searchParams.get('entidad_tipo');
        const entidadId = searchParams.get('entidad_id');

        if (!entidadTipo || !entidadId) {
            return withCors(NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 }), request);
        }

        const { data, error } = await supabase
            .from('evaluaciones')
            .select('id, tipo, titulo_es, titulo_eu, num_preguntas, tiempo_limite_min')
            .eq('entidad_tipo', entidadTipo)
            .eq('entidad_id', entidadId)
            .eq('activa', true)
            .single();

        if (error || !data) {
            return withCors(NextResponse.json({ error: 'Evaluación no encontrada' }, { status: 404 }), request);
        }

        return withCors(NextResponse.json(data), request);

    } catch (error) {
        console.error('Error en GET /api/academy/evaluaciones:', error);
        return withCors(NextResponse.json({ error: 'Error del servidor' }, { status: 500 }), request);
    }
}
