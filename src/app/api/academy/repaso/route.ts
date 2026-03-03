import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data, error } = await supabase
            .from('repaso_errores')
            .select(`
                id,
                pregunta_id,
                estado,
                created_at,
                pregunta:pregunta_id (
                    id,
                    enunciado_es,
                    enunciado_eu,
                    opciones_es,
                    opciones_eu,
                    respuesta_correcta,
                    explicacion_es,
                    explicacion_eu,
                    tipo_pregunta,
                    imagen_url
                )
            `)
            .eq('alumno_id', user.id)
            .eq('estado', 'pendiente')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching repaso errors:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ questions: data });
    } catch (e) {
        console.error('Unexpected error in repaso GET:', e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
