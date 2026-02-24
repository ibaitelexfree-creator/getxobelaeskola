import { requireInstructor } from '@/lib/auth-guard';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const { supabaseAdmin, error: authError } = await requireInstructor();
        if (authError) return authError;

        const { searchParams } = new URL(request.url);
        const studentId = searchParams.get('studentId');
        if (!studentId) return NextResponse.json({ error: 'Falta studentId' }, { status: 400 });

        // 1. Fetch raw inscriptions
        const { data: rawInscriptions, error: insError } = await supabaseAdmin
            .from('inscripciones')
            .select('*')
            .eq('perfil_id', studentId);

        if (insError) throw insError;

        // 2. Fetch reference data for editions and courses
        const [
            { data: editions },
            { data: allCourses }
        ] = await Promise.all([
            supabaseAdmin.from('ediciones_curso').select('*'),
            supabaseAdmin.from('cursos').select('*')
        ]);

        // 3. Manually combine data
        const enrichedInscriptions = (rawInscriptions || []).map((ins: any) => {
            const ed = (editions || []).find((e: any) => e.id === ins.edicion_id);
            const courseDirect = (allCourses || []).find((c: any) => c.id === ins.curso_id);
            const courseViaEd = ed ? (allCourses || []).find((c: any) => c.id === ed.curso_id) : null;

            return {
                ...ins,
                cursos: courseDirect || null,
                ediciones_curso: ed ? {
                    ...ed,
                    cursos: courseViaEd || null
                } : null
            };
        });

        return NextResponse.json({ inscriptions: enrichedInscriptions });
    } catch (err: unknown) {
        const error = err as Error;
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
