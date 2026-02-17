import { requireInstructor } from '@/lib/auth-guard';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const { supabaseAdmin, error: authError } = await requireInstructor();
        if (authError) return authError;

        const { searchParams } = new URL(request.url);
        const studentId = searchParams.get('student_id');

        if (!studentId) {
            return NextResponse.json({ error: 'student_id es requerido' }, { status: 400 });
        }

        // 1. Fetch Progress (all entities)
        const { data: progress } = await supabaseAdmin
            .from('progreso_alumno')
            .select('*')
            .eq('alumno_id', studentId);

        // 2. Fetch Skills
        const { data: skills } = await supabaseAdmin
            .from('habilidades_alumno')
            .select('*, habilidad:habilidades(*)')
            .eq('alumno_id', studentId);

        // 3. Fetch Certificates
        const { data: certificates } = await supabaseAdmin
            .from('certificados')
            .select('*, curso:cursos(nombre_es), nivel:niveles_formacion(nombre_es)')
            .eq('alumno_id', studentId);

        // 4. Fetch Achievements
        const { data: achievements } = await supabaseAdmin
            .from('logros_alumno')
            .select('*, logro:logros(*)')
            .eq('alumno_id', studentId);

        return NextResponse.json({
            progress: progress || [],
            skills: skills || [],
            certificates: certificates || [],
            achievements: achievements || []
        });

    } catch (err: unknown) {
        const error = err as Error;
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
