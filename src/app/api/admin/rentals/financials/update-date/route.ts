
import { requireAdmin } from '@/lib/auth-guard';
import { NextResponse } from 'next/server';

export async function PATCH(request: Request) {
    try {
        const auth = await requireAdmin();
        if (auth.error) return auth.error;
        const { supabaseAdmin } = auth;

        const { id, fecha_pago } = await request.json();

        if (!id || !fecha_pago) {
            return NextResponse.json({ error: 'Missing ID or date' }, { status: 400 });
        }

        const { error } = await supabaseAdmin
            .from('reservas_alquiler')
            .update({ fecha_pago })
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        const err = error as Error;
        console.error('Update date error:', err);
        let message = err.message;
        if (message.includes('column') && message.includes('fecha_pago')) {
            message = 'Error: La columna "fecha_pago" no existe en la base de datos. Por favor, ejecuta el script de migración en el SQL Editor de Supabase.';
        }
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
