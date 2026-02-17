import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const alumnoId = searchParams.get('alumno_id');
        const evaluacionId = searchParams.get('evaluacion_id');

        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
        }

        let query = supabase
            .from('intentos_evaluacion')
            .select(`
                *,
                evaluacion:evaluacion_id (
                    titulo_es,
                    titulo_eu,
                    tipo,
                    nota_aprobado
                )
            `)
            .eq('alumno_id', alumnoId || user.id)
            .order('created_at', { ascending: false });

        if (evaluacionId) {
            query = query.eq('evaluacion_id', evaluacionId);
        }

        const { data: intentos, error } = await query;

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ intentos });
    } catch {
        return NextResponse.json(
            { error: 'Error al obtener historial' },
            { status: 500 }
        );
    }
}
