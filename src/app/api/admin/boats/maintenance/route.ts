import { requireInstructor } from '@/lib/auth-guard';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const boatId = searchParams.get('boatId');

    try {
        const { supabaseAdmin, error: authError } = await requireInstructor();
        if (authError) return authError;

        let query = supabaseAdmin
            .from('mantenimiento_logs')
            .select(`
                *,
                staff:realizado_por(nombre, apellidos)
            `)
            .order('created_at', { ascending: false });

        if (boatId) {
            query = query.eq('embarcacion_id', boatId);
        }

        const { data, error } = await query;
        if (error) throw error;

        return NextResponse.json({ success: true, logs: data });
    } catch (error: unknown) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { supabaseAdmin, user, error: authError } = await requireInstructor();
        if (authError) return authError;

        const body = await request.json();
        const { embarcacion_id, tipo, descripcion, coste, estado, notas } = body;

        if (!embarcacion_id || !tipo || !descripcion) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin
            .from('mantenimiento_logs')
            .insert({
                embarcacion_id,
                tipo,
                descripcion,
                coste: coste || 0,
                estado: estado || 'pendiente',
                notas,
                realizado_por: user.id // Log the creator
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, log: data });
    } catch (error: unknown) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
