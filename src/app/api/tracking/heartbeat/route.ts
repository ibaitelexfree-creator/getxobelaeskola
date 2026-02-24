import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-guard';
import { isPointInWater } from '@/lib/geospatial/water-check';
import { fetchEuskalmetAlerts } from '@/lib/euskalmet';

export async function POST(req: Request) {
    try {
        const { user, error: authError } = await requireAuth();
        if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { lat, lng, speed, heading, accuracy } = body;

        if (lat === undefined || lng === undefined) {
            return NextResponse.json({ error: 'Missing lat or lng' }, { status: 400 });
        }

        const supabase = createClient();
        const in_water = isPointInWater(lat, lng);

        // Fetch Euskalmet alerts
        const alerts = await fetchEuskalmetAlerts();
        const hasActiveAlerts = alerts && alerts.length > 0;

        // Calculate dynamic server interval based on speed and alerts
        let server_interval = 60000; // default 60s
        if (!in_water) {
            server_interval = 120000; // 120s if on land
        } else {
            const currentSpeed = speed || 0;
            if (currentSpeed === 0) {
                server_interval = 60000; // 60s
            } else if (currentSpeed < 1) {
                server_interval = 30000; // 30s
            } else if (currentSpeed <= 3) {
                server_interval = 15000; // 15s
            } else if (currentSpeed <= 7) {
                server_interval = 10000; // 10s
            } else {
                server_interval = 5000; // 5s
            }

            // Adjust based on alerts
            if (hasActiveAlerts && server_interval > 10000) {
                server_interval = 10000; // max 10s if active alerts
            }
        }

        // We use UPSERT for user_live_locations. Usually, this means setting ON CONFLICT on user_id.
        // Supabase JS allows upsert which uses the primary key or unique constraints.
        const { error: upsertError } = await supabase
            .from('user_live_locations')
            .upsert({
                user_id: user.id,
                lat,
                lng,
                speed,
                heading,
                accuracy,
                in_water,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });

        if (upsertError) {
            console.error('Error upserting live location:', upsertError);
            throw upsertError;
        }

        // 5. Exploration Logic: If in water, we could save exploration segments
        // Note: In a high-traffic production app, we would buffer these points 
        // in Redis/Memory and only write to DB every 5-10 points.
        // For now, we only save if speed > 0.5 knots to avoid cluttering land/stopped points
        if (in_water && speed && speed > 0.25) {
            try {
                const { ExplorationService } = await import('@/lib/geospatial/exploration-service');
                // We create a tiny segment for now. 
                // A better approach is accumulate points in a session cookie or cache.
                await ExplorationService.saveExplorationSegment(user.id, [
                    // We need at least two points for a segment, using the current one duplicated
                    // or ideally fetching the previous one from the buffer.
                    { lat, lng, timestamp: Date.now(), speed }
                ]);
            } catch (e) {
                console.error('Exploration segment save error:', e);
            }
        }

        return NextResponse.json({
            success: true,
            in_water,
            server_interval
        });

    } catch (err: unknown) {
        console.error('Error in heartbeat endpoint:', err);
        return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal Server Error' }, { status: 500 });
    }
}
