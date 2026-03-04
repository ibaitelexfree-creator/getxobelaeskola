import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
        }

        const [property] = await sql`
            SELECT * FROM properties WHERE id = ${id}
        `;

        if (!property) {
            return NextResponse.json({ error: 'Property not found' }, { status: 404 });
        }

        return NextResponse.json(property);
    } catch (error: any) {
        console.error('Error fetching property Details:', error);
        return NextResponse.json(
            { error: 'Internal server error while fetching property' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        await sql`DELETE FROM properties WHERE id = ${id}`;

        return NextResponse.json({ success: true, message: 'Property deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting property:', error);
        return NextResponse.json(
            { error: 'Internal server error while deleting property' },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        // Dynamic update using postgres.js (caution with fields)
        const allowedFields = ['title', 'price', 'location', 'property_type', 'status', 'description'];
        const updates: Record<string, any> = {};

        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                updates[field] = body[field];
            }
        }

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ error: 'No valid fields provided for update' }, { status: 400 });
        }

        const [updatedProperty] = await sql`
            UPDATE properties 
            SET ${sql(updates, ...Object.keys(updates))}
            WHERE id = ${id}
            RETURNING *
        `;

        if (updates.status === 'rejected' && updatedProperty.user_id) {
            try {
                const [user] = await sql`SELECT email, name FROM users WHERE id = ${updatedProperty.user_id}`;
                if (user && user.email) {
                    // Simulated email sending logic
                    console.log(`\n================= EMAIL SENDING SIMULATOR =================`);
                    console.log(`TO: ${user.email}`);
                    console.log(`SUBJECT: Aviso sobre su propiedad - No cumple los requisitos`);
                    console.log(`BODY:`);
                    console.log(`Hola ${user.name || 'Usuario'},\n\nLe informamos de que su propiedad "${updatedProperty.title}" ha sido revisada por nuestro equipo de administración.\nLamentablemente, en este momento no ha sido aprobada para su publicación pública, ya que no cumple con nuestros actuales requisitos de calidad o información disponible en la plataforma.\n\nPor favor, actualice la información o contacte con soporte si cree que se trata de un error.\n\nEl Equipo de Administración de Luxe Dubai Estates`);
                    console.log(`===========================================================\n`);
                }
            } catch (emailErr) {
                console.error('Error fetching user email to send rejection notice:', emailErr);
            }
        }

        return NextResponse.json({ success: true, property: updatedProperty });
    } catch (error: any) {
        console.error('Error updating property:', error);
        return NextResponse.json(
            { error: 'Internal server error while updating property' },
            { status: 500 }
        );
    }
}
