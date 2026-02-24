import { requireInstructor } from '@/lib/auth-guard';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const auth = await requireInstructor();
        if (auth.error) return auth.error;
        const { supabaseAdmin } = auth;

        const { searchParams } = new URL(request.url);
        const courseId = searchParams.get('courseId');

        if (!courseId) {
            return NextResponse.json({ students: [] });
        }

        const { data: inscriptions, error: insError } = await supabaseAdmin
            .from('inscripciones')
            .select('perfil_id')
            .eq('curso_id', courseId);

        if (insError) throw insError;

        if (!inscriptions?.length) {
            return NextResponse.json({ students: [] });
        }

        const profileIds = (inscriptions as { perfil_id: string }[]).map((i) => i.perfil_id).filter(Boolean);

        const { data: students, error: profError } = await supabaseAdmin
            .from('profiles')
            .select('id, nombre, apellidos, email')
            .in('id', profileIds);

        if (profError) throw profError;

        return NextResponse.json({ students: students || [] });
    } catch (err: unknown) {
        const error = err as Error;
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
