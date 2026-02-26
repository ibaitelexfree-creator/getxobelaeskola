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

        let dbQuery = supabaseAdmin
            .from('profiles')
            .select('*')
            .in('rol', ['instructor', 'admin']);

        if (query) {
            dbQuery = dbQuery.or(`nombre.ilike.%${query}%,apellidos.ilike.%${query}%,email.ilike.%${query}%`);
        }

        const { data: staff, error } = await dbQuery
            .order('rol', { ascending: true }) // Put admins first
            .order('nombre', { ascending: true });

        if (error) throw error;

        return NextResponse.json({ staff });
    } catch (err: unknown) {
        const error = err as Error;
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
