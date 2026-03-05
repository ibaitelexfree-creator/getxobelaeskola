import { NextRequest, NextResponse } from 'next/server';
import { generateMarketingContent, triggerN8nVideo, MarketingProperty } from '@/lib/marketing/marketing-service';
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' });

export async function POST(req: NextRequest) {
    try {
        const { propertyId, triggerVideo = true } = await req.json();

        if (!propertyId) {
            return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
        }

        // 1. Fetch property data
        const [property] = await sql`SELECT * FROM properties WHERE id = ${propertyId}`;

        if (!property) {
            return NextResponse.json({ error: 'Property not found' }, { status: 404 });
        }

        // 2. Map to MarketingProperty interface
        const marketingProperty: MarketingProperty = {
            id: property.id,
            title: property.title,
            description: property.description || '',
            property_type: property.property_type || 'property',
            location: property.location,
            price: Number(property.price),
            currency: 'AED', // Defaulting to Dubai for now, should be dynamic
            bedrooms: property.bedrooms || 0,
            bathrooms: property.bathrooms || 0,
            amenities: property.amenities || [],
            photos: property.images || [],
            web_url: `${process.env.NEXT_PUBLIC_APP_URL}/properties/${property.id}`
        };

        // 3. Generate Content
        const content = await generateMarketingContent(marketingProperty);

        // 4. Trigger n8n if requested
        let videoStatus = 'skipped';
        if (triggerVideo) {
            try {
                await triggerN8nVideo(propertyId);
                videoStatus = 'triggered';
            } catch (videoError) {
                console.error('Failed to trigger n8n video:', videoError);
                videoStatus = 'failed';
            }
        }

        return NextResponse.json({
            success: true,
            content,
            videoStatus,
            propertyId
        });

    } catch (error: any) {
        console.error('Marketing generation API error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
