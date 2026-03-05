import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';
import sql from '@/lib/db';
import { createAdminClient } from '@/lib/supabase/admin';

const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(req: NextRequest) {
    try {
        const { imageUrl, propertyId } = await req.json();

        if (!imageUrl || !propertyId) {
            return NextResponse.json(
                { error: 'imageUrl and propertyId are required' },
                { status: 400 }
            );
        }

        // 1. Verify property exists
        const [property] = await sql`SELECT id FROM properties WHERE id = ${propertyId}`;
        if (!property) {
            return NextResponse.json({ error: 'Property not found' }, { status: 404 });
        }

        // 2. Update status to processing
        await sql`UPDATE properties SET depth_map_status = 'processing' WHERE id = ${propertyId}`;

        // 3. Call Replicate — Depth Anything V2 Large
        const output = await replicate.run(
            "cjwbw/depth-anything-v2:8a4e2fe2c0fa68e0afdb1a84eb7e296388f52082e09fdd62c10e5e3d878e4cba",
            {
                input: {
                    image: imageUrl,
                    encoder: "vitl"
                }
            }
        );

        // The result is a URL to the depth map image
        const depthMapOutputUrl = typeof output === 'string' ? output : (output as any)?.url || String(output);

        // 4. Download the depth map from Replicate's temporary URL
        const depthMapResponse = await fetch(depthMapOutputUrl);
        if (!depthMapResponse.ok) {
            throw new Error(`Failed to download depth map: ${depthMapResponse.statusText}`);
        }
        const depthMapBuffer = await depthMapResponse.arrayBuffer();

        // 5. Upload to Supabase Storage
        const supabase = createAdminClient();

        // Ensure bucket exists
        try {
            await supabase.storage.createBucket('depth-maps', { public: true });
        } catch {
            // Bucket already exists
        }

        const fileName = `${propertyId}-${Date.now()}.png`;
        const filePath = `depth-maps/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('depth-maps')
            .upload(filePath, depthMapBuffer, {
                contentType: 'image/png',
                upsert: true
            });

        if (uploadError) {
            throw new Error(`Storage upload failed: ${uploadError.message}`);
        }

        // 6. Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('depth-maps')
            .getPublicUrl(filePath);

        // 7. Save to database
        await sql`
            UPDATE properties 
            SET depth_maps = array_append(depth_maps, ${publicUrl}),
                depth_map_status = 'ready'
            WHERE id = ${propertyId}
        `;

        return NextResponse.json({
            success: true,
            depthMapUrl: publicUrl,
            propertyId
        });

    } catch (error: any) {
        console.error('Depth map generation error:', error);

        // Try to update status to failed
        try {
            const body = await req.clone().json();
            if (body.propertyId) {
                await sql`UPDATE properties SET depth_map_status = 'failed' WHERE id = ${body.propertyId}`;
            }
        } catch { /* ignore secondary error */ }

        return NextResponse.json(
            { error: error.message || 'Depth map generation failed' },
            { status: 500 }
        );
    }
}
