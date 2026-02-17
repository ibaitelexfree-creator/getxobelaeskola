
import { requireInstructor } from '@/lib/auth-guard';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { supabaseAdmin, error: authError } = await requireInstructor();
        if (authError) return authError;

        const body = await request.json();
        const { id, estado_entrega, log_seguimiento } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID es obligatorio' }, { status: 400 });
        }

        const updateData: Record<string, unknown> = {};
        if (estado_entrega !== undefined) updateData.estado_entrega = estado_entrega;
        if (log_seguimiento !== undefined) updateData.log_seguimiento = log_seguimiento;

        const { data, error } = await supabaseAdmin
            .from('reservas_alquiler')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, rental: data });
    } catch (error: unknown) {
        const err = error as Error;
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
