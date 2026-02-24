import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-guard';

export async function GET() {
    try {
        const { user, error: authError } = await requireAuth();
        if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const supabase = createClient();

        const { data, error } = await supabase
            .from('exploration_tracks')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: true });

        if (error) throw error;

        return NextResponse.json({
            count: data.length,
            segments: data || []
        });

    } catch (err: unknown) {
        console.error('Error fetching exploration tracks:', err);
        return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal Server Error' }, { status: 500 });
    }
}
