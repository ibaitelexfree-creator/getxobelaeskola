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
            .from('embarcaciones')
            .select('*');

        if (query) {
            dbQuery = dbQuery.ilike('nombre', `%${query}%`);
        }

        const { data, error } = await dbQuery
            .order('nombre', { ascending: true });

        if (error) throw error;

        return NextResponse.json({ success: true, boats: data });
    } catch (error: unknown) {
        const err = error as Error;
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
