import { createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { requireInstructor } from '@/lib/auth-guard';

export async function GET() {
    try {
        const { user, error: authError } = await requireInstructor();
        if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const supabaseAdmin = createAdminClient();

        // Get live locations updated in the last 15 minutes that are in water
        // JOIN with profiles to get user names
        const { data, error } = await supabaseAdmin
            .from('user_live_locations')
            .select(`
                user_id,
                lat,
                lng,
                speed,
                heading,
                accuracy,
                in_water,
                updated_at,
                profiles:user_id (
                    nombre,
                    apellido,
                    avatar_url,
                    rol
                )
            `)
            .eq('in_water', true)
            .gt('updated_at', new Date(Date.now() - 15 * 60 * 1000).toISOString())
            .order('updated_at', { ascending: false });

        if (error) throw error;

        // Clean up the structure for the frontend
        const locations = (data || []).map((loc: any) => ({
            userId: loc.user_id,
            lat: loc.lat,
            lng: loc.lng,
            speed: loc.speed,
            heading: loc.heading,
            updatedAt: loc.updated_at,
            profile: loc.profiles
        }));

        return NextResponse.json({
            count: locations.length,
            locations
        });

    } catch (err: unknown) {
        console.error('Error in live-map endpoint:', err);
        return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal Server Error' }, { status: 500 });
    }
}
