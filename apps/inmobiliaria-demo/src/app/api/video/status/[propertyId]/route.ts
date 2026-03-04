import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ propertyId: string }> }
) {
    try {
        const { propertyId } = await params;

        if (!propertyId) {
            return NextResponse.json({ error: 'propertyId is required' }, { status: 400 });
        }

        // Get latest video for this property
        const [video] = await sql`
            SELECT id, video_url, video_type, status, duration_seconds, error_message, created_at, updated_at
            FROM generated_videos 
            WHERE property_id = ${propertyId}
            ORDER BY created_at DESC 
            LIMIT 1
        `;

        if (!video) {
            return NextResponse.json({
                status: 'none',
                message: 'No video has been generated for this property',
            });
        }

        return NextResponse.json({
            status: video.status,
            videoUrl: video.video_url || null,
            videoType: video.video_type,
            durationSeconds: video.duration_seconds,
            error: video.error_message || null,
            createdAt: video.created_at,
            updatedAt: video.updated_at,
        });

    } catch (error: any) {
        console.error('Video status error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
