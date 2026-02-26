import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { id } = body; // This is the id of the review entry (repaso_errores.id)

        if (!id) {
            return NextResponse.json({ error: 'Missing id' }, { status: 400 });
        }

        const { error } = await supabase
            .from('repaso_errores')
            .update({ estado: 'dominada' })
            .eq('id', id)
            .eq('alumno_id', user.id);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error('Error updating review status:', e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
