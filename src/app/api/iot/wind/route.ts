import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        // Security Check
        const apiKey = request.headers.get('x-api-key');
        // In production, ensure IOT_API_KEY is set. Fallback is for demo/dev only.
        const validKey = process.env.IOT_API_KEY || 'club-nautico-iot-secret-2024';

        if (apiKey !== validKey) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { sensor_id, speed_knots, direction_deg, gust_knots, battery_level } = body;

        // Simple validation
        if (!sensor_id || speed_knots === undefined || direction_deg === undefined) {
            return NextResponse.json(
                { error: 'Missing required fields: sensor_id, speed_knots, direction_deg' },
                { status: 400 }
            );
        }

        const supabase = createAdminClient();

        const { error } = await supabase
            .from('iot_wind_readings')
            .insert({
                sensor_id,
                speed_knots,
                direction_deg,
                gust_knots,
                battery_level
            });

        if (error) {
            console.error('Database Error:', error);
            return NextResponse.json(
                { error: 'Failed to insert data' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
