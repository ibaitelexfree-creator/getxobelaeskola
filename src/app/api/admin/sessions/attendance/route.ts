import { requireInstructor } from '@/lib/auth-guard';
import { NextResponse } from 'next/server';

/**
 * Handles session attendance (listing and updating)
 */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    try {
        if (!sessionId) {
            return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
        }

<<<<<<< HEAD
        const auth = await requireInstructor();
        if (auth.error) return auth.error;
        const { supabaseAdmin } = auth;
=======
        const { supabaseAdmin, error: authError } = await requireInstructor();
        if (authError) return authError;
>>>>>>> pr-286

        const { data, error } = await supabaseAdmin
            .from('sesion_asistentes')
            .select(`
                *,
                student:profiles(id, nombre, apellidos, email)
            `)
            .eq('sesion_id', sessionId);

        if (error) throw error;

        return NextResponse.json({ success: true, attendance: data });
    } catch (error: unknown) {
        const err = error as Error;
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

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
        const { sessionId, studentId, asistencia, notas } = body;

        if (!sessionId || !studentId) {
            return NextResponse.json({ error: 'Session and Student IDs are required' }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin
            .from('sesion_asistentes')
            .upsert({
                sesion_id: sessionId,
                usuario_id: studentId,
                asistencia,
                notas
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, attendance: data });
    } catch (error: unknown) {
        const err = error as Error;
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
