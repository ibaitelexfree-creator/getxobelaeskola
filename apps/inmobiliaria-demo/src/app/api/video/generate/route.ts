import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import axios from 'axios';

export async function POST(req: NextRequest) {
    try {
        const { propertyId, videoType = 'cinematic_pan' } = await req.json();

        if (!propertyId) {
            return NextResponse.json({ error: 'propertyId is required' }, { status: 400 });
        }

        // 1. Verify property exists
        const [property] = await sql`SELECT * FROM properties WHERE id = ${propertyId}`;
        if (!property) {
            return NextResponse.json({ error: 'Property not found' }, { status: 404 });
        }

        // 2. Check if already processing
        const [existing] = await sql`
            SELECT id FROM generated_videos 
            WHERE property_id = ${propertyId} AND status = 'processing'
        `;
        if (existing) {
            return NextResponse.json(
                { error: 'A video is already being generated for this property', videoId: existing.id },
                { status: 409 }
            );
        }

        // 3. Insert tracking record
        const [video] = await sql`
            INSERT INTO generated_videos (property_id, video_type, status)
            VALUES (${propertyId}, ${videoType}, 'processing')
            RETURNING *
        `;

        // 4. Update property status
        await sql`UPDATE properties SET video_status = 'processing' WHERE id = ${propertyId}`;

        // 5. Trigger n8n workflow
        const webhookUrl = process.env.N8N_VIDEO_WEBHOOK_URL || 'https://n8n.srv1368175.hstgr.cloud/webhook/realstate-video-gen';

        try {
            await axios.post(webhookUrl, {
                propertyId: property.id.toString(),
                videoType,
                imageUrl: property.images?.[0] || '',
                propertyTitle: property.title,
                propertyType: property.property_type || 'property',
                callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://controlmanager.cloud/realstate'}/api/video/callback`,
            });
        } catch (webhookError: any) {
            // Mark as failed if webhook trigger fails
            await sql`UPDATE generated_videos SET status = 'failed', error_message = ${webhookError.message} WHERE id = ${video.id}`;
            await sql`UPDATE properties SET video_status = 'failed' WHERE id = ${propertyId}`;
            throw new Error(`n8n webhook failed: ${webhookError.message}`);
        }

        return NextResponse.json({
            success: true,
            message: 'Video generation started',
            videoId: video.id,
            estimatedMinutes: 3,
        });

    } catch (error: any) {
        console.error('Video generation error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
