import { requireAdmin } from '@/lib/auth-guard';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
<<<<<<< HEAD
        const auth = await requireAdmin();
        if (auth.error) return auth.error;
        const { supabaseAdmin } = auth;
=======
        const { supabaseAdmin, error: authError } = await requireAdmin();
        if (authError) return authError;
>>>>>>> pr-286

        const { id, activo } = await request.json();

        // 2. Perform Soft Delete (or Restore)
        const targetState = activo === undefined ? false : activo; // Default to false (archive) if not specified

        const { data, error } = await supabaseAdmin
            .from('cursos')
            .update({
                activo: targetState
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error archiving course:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            course: data,
            message: targetState ? 'Curso restaurado' : 'Curso archivado'
        });

    } catch (err: unknown) {
        console.error('API Error:', err);
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}
