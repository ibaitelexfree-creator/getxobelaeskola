import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function POST(request: Request) {
    try {
        const data = await request.json();

        // Validate required fields
        if (!data.title || !data.price || !data.location) {
            return NextResponse.json(
                { error: 'Missing required fields: title, price, and location are mandatory.' },
                { status: 400 }
            );
        }

        // Insert into Neon database
        const [property] = await sql`
            INSERT INTO properties (
                title, 
                price, 
                location, 
                property_type, 
                bedrooms, 
                bathrooms, 
                description, 
                images,
                status
            ) VALUES (
                ${data.title}, 
                ${data.price}, 
                ${data.location}, 
                ${data.property_type || null}, 
                ${data.bedrooms || null}, 
                ${data.bathrooms || null}, 
                ${data.description || ''}, 
                ${data.images || []},
                'pending'
            ) RETURNING *
        `;

        console.log('Database insertion successful for:', property.title);

        return NextResponse.json(
            {
                success: true,
                message: 'Property successfully added to the database.',
                property: property
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Error adding property:', error);
        return NextResponse.json(
            {
                error: 'Internal server error while saving data',
                message: error.message || 'An unexpected error occurred'
            },
            { status: 500 }
        );
    }
}
