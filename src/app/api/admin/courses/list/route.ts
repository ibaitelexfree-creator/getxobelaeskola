import { requireInstructor } from '@/lib/auth-guard';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const { supabaseAdmin, error: authError } = await requireInstructor();
        if (authError) return authError;

        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q') || '';

        // 2. Fetch All Courses (including inactive)
        let dbQuery = supabaseAdmin
            .from('cursos')
            .select('*');

        if (query) {
            dbQuery = dbQuery.or(`nombre_es.ilike.%${query}%,nombre_eu.ilike.%${query}%`);
        }

        const { data, error } = await dbQuery
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching courses:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, courses: data });

    } catch (err: unknown) {
        console.error('API Error:', err);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
