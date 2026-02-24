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
        const { searchParams } = new URL(request.url);
        const levelId = searchParams.get('level_id');
        const supabase = createClient();

        let query = supabase
            .from('cursos')
            .select(`
                id,
                slug,
                nombre_es,
                nombre_eu,
                descripcion_es,
                descripcion_eu,
                imagen_url,
                precio,
                nivel_formacion_id,
                nivel_formacion:nivel_formacion_id (
                    slug,
                    nombre_es,
                    nombre_eu
                ),
                categoria:categoria_id (
                    nombre_es,
                    nombre_eu
                )
            `)
            .eq('activo', true)
            .order('orden_en_nivel');

        if (levelId) {
            query = query.eq('nivel_formacion_id', levelId);
        }

        const { data: cursos, error } = await query;

        if (error) {
            console.error('Error fetching courses:', error);
            return withCors(NextResponse.json({ cursos: [] }), request);
        }

        return withCors(NextResponse.json({ cursos }), request);

    } catch (err) {
        console.error('Error in academy courses API:', err);
        return withCors(NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        ), request);
    }
}
