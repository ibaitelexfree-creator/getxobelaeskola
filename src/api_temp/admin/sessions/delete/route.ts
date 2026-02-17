
import { requireAdmin } from '@/lib/auth-guard';
import { NextResponse } from 'next/server';
import { deleteGoogleEvent } from '@/lib/google-calendar';

export async function POST(request: Request) {
    try {
        const { supabaseAdmin, error: authError } = await requireAdmin();
        if (authError) return authError;

        const { id } = await request.json();

        // Check if there is a google event id before deleting
        const { data: session } = await supabaseAdmin
            .from('sesiones')
            .select('google_event_id')
            .eq('id', id)
            .single();

        if (session?.google_event_id) {
            try {
                await deleteGoogleEvent(session.google_event_id);
            } catch (calError) {
                console.error('Calendar Delete Error:', calError);
            }
        }

        const { error } = await supabaseAdmin
            .from('sesiones')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true, message: 'Sesión eliminada' });
    } catch (error: unknown) {
        const err = error as Error;
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
