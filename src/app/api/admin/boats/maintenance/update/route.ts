import { requireInstructor } from '@/lib/auth-guard';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
<<<<<<< HEAD
        const auth = await requireInstructor();
        if (auth.error) return auth.error;
        const { supabaseAdmin } = auth;
=======
        const { supabaseAdmin, error: authError } = await requireInstructor();
        if (authError) return authError;
>>>>>>> pr-286

        const body = await request.json();
        const { id, estado, notas, fecha_fin, coste, descripcion } = body;

        if (!id) {
            return NextResponse.json({ error: 'Missing log ID' }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin
            .from('mantenimiento_logs')
            .update({
                estado,
                notas,
                descripcion,
                fecha_fin: estado === 'completado' && !fecha_fin ? new Date().toISOString() : fecha_fin,
                coste
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, log: data });
    } catch (error: unknown) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
