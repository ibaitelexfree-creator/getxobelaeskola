import { requireAdmin } from '@/lib/auth-guard';
import { NextResponse } from 'next/server';

export async function POST(_request: Request) {
    try {
        const { supabaseAdmin, error: authError } = await requireAdmin();
        if (authError) return authError;

        const { id } = await _request.json();

        const { error } = await supabaseAdmin
            .from('embarcaciones')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true, message: 'Embarcación eliminada' });
    } catch (error: unknown) {
        const err = error as Error;
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
