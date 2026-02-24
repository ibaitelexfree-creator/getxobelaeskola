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

        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Supabase admin client not initialized' }, { status: 500 });
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
                realizado_por: user.id
            })
            .select()
            .single();

        if (error) throw error;

        // --- NEW: SMART AUTO-UPDATE BOAT STATUS ---
        // A boat should be 'mantenimiento' if ANY log is 'pendiente' or 'en_proceso'
        const { data: activeLogs } = await supabaseAdmin
            .from('mantenimiento_logs')
            .select('id')
            .eq('embarcacion_id', embarcacion_id)
            .in('estado', ['pendiente', 'en_proceso']);

        const hasActiveMaintenance = activeLogs && activeLogs.length > 0;
        const newBoatStatus = hasActiveMaintenance ? 'mantenimiento' : 'disponible';

        await supabaseAdmin
            .from('embarcaciones')
            .update({ estado: newBoatStatus })
            .eq('id', embarcacion_id);
        // -------------------------------------------

        return NextResponse.json({ success: true, log: data });
    } catch (error: unknown) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
