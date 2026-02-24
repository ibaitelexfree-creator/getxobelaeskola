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

        // Obtener todos los niveles ordenados
        const { data: niveles, error } = await supabase
            .from('niveles_formacion')
            .select('*')
            .order('orden');

        if (error) {
            return withCors(NextResponse.json({ error: error.message }, { status: 500 }), request);
        }

        return withCors(NextResponse.json({ niveles }), request);
    } catch {
        return withCors(NextResponse.json(
            { error: 'Error al obtener niveles' },
            { status: 500 }
        ), request);
    }
}
