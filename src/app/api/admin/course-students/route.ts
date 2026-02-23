import { requireInstructor } from '@/lib/auth-guard';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const { supabaseAdmin, error: authError } = await requireInstructor();
        if (authError) return authError;

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

        const profileIds = inscriptions.map((i: any) => i.perfil_id).filter(Boolean);

        const { data: students, error: profError } = await supabaseAdmin
            .from('profiles')
            .select('id, nombre, apellidos, email')
            .in('id', profileIds);

        if (profError) throw profError;

        return NextResponse.json({ students: students || [] });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
