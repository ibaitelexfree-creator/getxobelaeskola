import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
    const supabase = createClient();
    const searchParams = request.nextUrl.searchParams;
    const moduloId = searchParams.get('modulo_id');

    if (!moduloId) {
        return NextResponse.json({ error: 'modulo_id is required' }, { status: 400 });
    }

    try {
        const { data: questions, error } = await supabase
            .from('foro_preguntas')
            .select(`
                *,
                profiles:usuario_id (
                    nombre,
                    apellidos,
                    avatar_url
                )
            `)
            .eq('modulo_id', moduloId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching questions:', error);
            return NextResponse.json({ error: 'Error loading questions' }, { status: 500 });
        }

        return NextResponse.json({ questions });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { modulo_id, titulo, contenido } = body;

        if (!modulo_id || !titulo || !contenido) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const { data: question, error } = await supabase
            .from('foro_preguntas')
            .insert({
                modulo_id,
                usuario_id: user.id,
                titulo,
                contenido
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating question:', error);
            return NextResponse.json({ error: 'Error creating question' }, { status: 500 });
        }

        return NextResponse.json({ question });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
