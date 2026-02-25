import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface LeaderboardEntry {
    id: string;
    nombre: string | null;
    apellidos: string | null;
    avatar_url: string | null;
    public_profile: boolean;
    points: number;
    // Add other properties returned by get_leaderboard if known
}

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: leaderboard, error } = await supabase.rpc('get_leaderboard', { limit_count: 50 });

        if (error) {
            console.error('Error fetching leaderboard:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Mask private profiles server-side
        const maskedLeaderboard = ((leaderboard as unknown as LeaderboardEntry[]) || []).map((entry) => {
            if (entry.id === user.id) {
                return entry;
            }
            if (!entry.public_profile) {
                return {
                    ...entry,
                    nombre: null,
                    apellidos: null,
                    avatar_url: null
                };
            }
            return entry;
        });

        return NextResponse.json({
            leaderboard: maskedLeaderboard,
            currentUserId: user.id
        });

    } catch (error: unknown) {
        console.error('CRITICAL: Error fetching leaderboard:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
