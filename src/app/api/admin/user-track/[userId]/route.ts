import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';
import { requireInstructor } from '@/lib/auth-guard';
import { LocationPoint } from '@/lib/geospatial/types';

export async function GET(
    req: Request,
    { params }: { params: { userId: string } }
) {
    try {
        const auth = await requireInstructor();
        if (auth.error) return auth.error;

        const userId = params.userId;
        const supabaseAdmin = createAdminClient();

        // 1. Get current live position
        const { data: currentPos } = await supabaseAdmin
            .from('user_live_locations')
            .select('*')
            .eq('user_id', userId)
            .single();

        // 2. Get today's tracking sessions from horas_navegacion
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { data: sessions, error: sessionsError } = await supabaseAdmin
            .from('horas_navegacion')
            .select('*')
            .eq('alumno_id', userId)
            .gte('fecha', today.toISOString())
            .order('fecha', { ascending: false });

        if (sessionsError) throw sessionsError;

        // 3. Get profile info
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        return NextResponse.json({
            profile: profile || null,
            currentPosition: currentPos || null,
            sessions: sessions || []
        });

    } catch (err: unknown) {
        console.error('Error fetching user track:', err);
        return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal Server Error' }, { status: 500 });
    }
}
