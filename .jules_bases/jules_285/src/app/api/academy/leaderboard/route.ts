import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-guard';
import { withCors, corsHeaders } from '@/lib/api-headers';

export const dynamic = 'force-dynamic';

export async function OPTIONS(request: Request) {
    const headers = corsHeaders(request);
    return new NextResponse(null, {
        status: 204,
        headers
    });
}

export async function GET(request: Request) {
    try {
        const { user, profile, error } = await requireAuth();
        if (error || !user) {
            return withCors(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }), request);
        }

        const supabase = createClient();

        // Fetch top 50 users for the leaderboard
        const { data: topUsers, error: dbError } = await supabase
            .from('profiles')
            .select('id, nombre, apellidos, avatar_url, xp, total_xp, current_streak, modules_completed, leaderboard_visibility')
            .neq('leaderboard_visibility', 'private')
            .order('total_xp', { ascending: false })
            .limit(50);

        if (dbError) {
            console.error('Leaderboard error:', dbError);
            return withCors(NextResponse.json({ error: 'Error loading leaderboard' }, { status: 500 }), request);
        }

        // Process users (mask anonymous)
        const leaderboard = (topUsers || []).map((p, index) => {
            if (p.leaderboard_visibility === 'anonymous') {
                return {
                    id: p.id,
                    rank: index + 1,
                    nombre: 'Navegante Anónimo',
                    apellidos: '',
                    avatar_url: null,
                    total_xp: p.total_xp,
                    current_streak: p.current_streak,
                    modules_completed: p.modules_completed || 0,
                    is_current_user: p.id === user.id
                };
            }
            return {
                id: p.id,
                rank: index + 1,
                nombre: p.nombre,
                apellidos: p.apellidos,
                avatar_url: p.avatar_url,
                total_xp: p.total_xp,
                current_streak: p.current_streak,
                modules_completed: p.modules_completed || 0,
                is_current_user: p.id === user.id
            };
        });

        // Get current user stats if not in top 50
        let currentUserStats = leaderboard.find(u => u.is_current_user);

        if (!currentUserStats) {
            // Find rank: Count users with more XP
            const { count, error: rankError } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .gt('total_xp', profile?.total_xp || 0);

            if (!rankError) {
                 currentUserStats = {
                    id: user.id,
                    rank: (count || 0) + 1,
                    nombre: profile?.nombre || '',
                    apellidos: profile?.apellidos || '',
                    avatar_url: profile?.avatar_url || null,
                    total_xp: profile?.total_xp || 0,
                    current_streak: profile?.current_streak || 0,
                    modules_completed: profile?.modules_completed || 0,
                    is_current_user: true
                 };
            }
        }

        return withCors(NextResponse.json({
            leaderboard,
            currentUser: currentUserStats,
            visibility: profile?.leaderboard_visibility || 'private'
        }), request);

    } catch (err) {
        console.error('Internal Server Error:', err);
        return withCors(NextResponse.json({ error: 'Internal Server Error' }, { status: 500 }), request);
    }
}
