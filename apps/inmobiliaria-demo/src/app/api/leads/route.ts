import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { full_name, email, phone, property_id, service_type, notes } = body;

        if (!full_name || !email) {
            return NextResponse.json(
                { error: 'Nombre y email son obligatorios.' },
                { status: 400 }
            );
        }

        const [lead] = await sql`
            INSERT INTO leads (
                full_name, 
                email, 
                phone, 
                property_id, 
                service_type, 
                notes
            ) VALUES (
                ${full_name}, 
                ${email}, 
                ${phone || null}, 
                ${property_id || null}, 
                ${service_type || null}, 
                ${notes || ''}
            ) RETURNING *
        `;

        return NextResponse.json({ success: true, lead }, { status: 201 });
    } catch (error: any) {
        console.error('Error saving lead:', error);
        return NextResponse.json(
            { error: 'Internal server error while saving lead' },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const leads = await sql`
            SELECT l.*, p.title as property_title 
            FROM leads l
            LEFT JOIN properties p ON l.property_id = p.id
            ORDER BY l.created_at DESC
        `;

        return NextResponse.json({ success: true, leads });
    } catch (error: any) {
        console.error('Error fetching leads:', error);
        return NextResponse.json(
            { error: 'Internal server error while fetching leads' },
            { status: 500 }
        );
    }
}
