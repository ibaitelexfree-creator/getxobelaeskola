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
        const query = searchParams.get('q') || '';
        const { data: students, error } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .or(`nombre.ilike.%${query}%,apellidos.ilike.%${query}%`)
            .limit(10);

        if (error) throw error;

        return NextResponse.json({ students });
    } catch (err: unknown) {
        const error = err as Error;
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
