import { requireInstructor } from '@/lib/auth-guard';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
<<<<<<< HEAD
        const auth = await requireInstructor();
        if (auth.error) return auth.error;
        const { supabaseAdmin } = auth;
=======
        const { supabaseAdmin, error: authError } = await requireInstructor();
        if (authError) return authError;
>>>>>>> pr-286

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

<<<<<<< HEAD
        interface Inscription {
            edicion_id: string;
            curso_id: string;
            [key: string]: unknown;
        }
        interface Edition {
            id: string;
            curso_id: string;
            [key: string]: unknown;
        }
        interface Course {
            id: string;
            [key: string]: unknown;
        }

        const typedInscriptions = (rawInscriptions || []) as unknown as Inscription[];
        const typedEditions = (editions || []) as unknown as Edition[];
        const typedCourses = (allCourses || []) as unknown as Course[];

        // 3. Manually combine data
        const enrichedInscriptions = typedInscriptions.map((ins) => {
            const ed = typedEditions.find((e) => e.id === ins.edicion_id);
            const courseDirect = typedCourses.find((c) => c.id === ins.curso_id);
            const courseViaEd = ed ? typedCourses.find((c) => c.id === ed.curso_id) : null;
=======
        // 3. Manually combine data
        const enrichedInscriptions = (rawInscriptions || []).map(ins => {
            const ed = (editions || []).find(e => e.id === ins.edicion_id);
            const courseDirect = (allCourses || []).find(c => c.id === ins.curso_id);
            const courseViaEd = ed ? (allCourses || []).find(c => c.id === ed.curso_id) : null;
>>>>>>> pr-286

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
