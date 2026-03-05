import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { syncUser, getUserRole } from '@/lib/user-sync';
import { BASE_PATH } from '@/lib/constants';

export async function POST(request: Request) {
    console.log('--- Iniciando alta de propiedad ---');
    try {
        const supabaseAuth = await createClient();
        const { data: { user: authUser } } = await supabaseAuth.auth.getUser();

        if (!authUser) {
            console.warn('Usuario no autenticado');
            return NextResponse.json({ error: 'Debes estar autenticado para dar de alta una propiedad' }, { status: 401 });
        }

        // Sync user to Neon to ensure record exists
        await syncUser(authUser);

        const formData = await request.formData();

        const title = formData.get('title')?.toString() || '';
        const price = formData.get('price')?.toString() || '';
        const location = formData.get('location')?.toString() || '';
        const property_type = formData.get('property_type')?.toString() || '';
        const bedrooms = formData.get('bedrooms')?.toString() || '';
        const bathrooms = formData.get('bathrooms')?.toString() || '';
        const description = formData.get('description')?.toString() || '';

        // Obtener todos los archivos bajo la clave 'images'
        const files = formData.getAll('images') as File[];

        // Validación de campos requeridos
        if (!title || !price || !location) {
            return NextResponse.json(
                { error: 'Faltan campos obligatorios: el título, el precio y la ubicación son necesarios.' },
                { status: 400 }
            );
        }

        const uploadedImages: string[] = [];
        const supabase = createAdminClient();

        // 1. Procesar y subir cada imagen
        console.log(`Procesando ${files.length} archivos...`);
        for (const file of files) {
            if (file && file.size > 0 && typeof file !== 'string') {
                console.log(`Subiendo archivo: ${file.name} (${file.size} bytes)`);
                const arrayBuffer = await file.arrayBuffer();
                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
                const filePath = `listings/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('properties')
                    .upload(filePath, arrayBuffer, {
                        contentType: file.type || 'image/jpeg',
                        upsert: false
                    });

                if (uploadError) {
                    console.error(`Error subiendo imagen ${file.name}:`, uploadError);
                    continue;
                }

                const { data: { publicUrl } } = supabase.storage
                    .from('properties')
                    .getPublicUrl(filePath);

                if (publicUrl) {
                    uploadedImages.push(publicUrl);
                    console.log(`Imagen subida: ${publicUrl}`);
                }
            }
        }

        console.log(`Total de imágenes subidas: ${uploadedImages.length}`);

        // 2. Insertar el registro con user_id
        console.log('Insertando propiedad en la base de datos...');
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
                status,
                user_id
            ) VALUES (
                ${title}, 
                ${price ? parseFloat(price) : 0}, 
                ${location}, 
                ${property_type || null}, 
                ${bedrooms ? parseInt(bedrooms) : 0}, 
                ${bathrooms ? parseInt(bathrooms) : 0}, 
                ${description || ''}, 
                ${uploadedImages}::text[],
                'pending',
                ${authUser.id}
            ) RETURNING *
        `;
        console.log(`Propiedad creada con ID: ${property.id}`);

        // Pipeline fire-and-forget
        // Pipeline fire-and-forget
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        if (uploadedImages.length > 0) {
            fetch(`${appUrl}${BASE_PATH}/api/depth-map/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageUrl: uploadedImages[0], propertyId: property.id }),
            }).catch(() => { });

            fetch(`${appUrl}${BASE_PATH}/api/video/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ propertyId: property.id }),
            }).catch(() => { });
        }

        return NextResponse.json({ success: true, property }, { status: 201 });
    } catch (error: any) {
        console.error('Error catastrófico en alta:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const filterUser = searchParams.get('userId');
        const search = searchParams.get('search');
        const status = searchParams.get('status');

        const supabaseAuth = await createClient();
        const { data: { user: authUser } } = await supabaseAuth.auth.getUser();

        let properties;

        // Logic logic for filtering
        if (filterUser === 'me' && authUser) {
            // User wants their own properties
            properties = await sql`
                SELECT * FROM properties 
                WHERE user_id = ${authUser.id}
                ORDER BY created_at DESC
            `;
        } else {
            const userRole = authUser ? await getUserRole(authUser.id) : 'guest';

            if (userRole === 'admin') {
                // Admin can see all with filters
                let query = sql`SELECT * FROM properties WHERE 1=1`;

                if (search) {
                    query = sql`${query} AND (title ILIKE ${'%' + search + '%'} OR location ILIKE ${'%' + search + '%'})`;
                }
                if (status) {
                    query = sql`${query} AND status = ${status}`;
                }

                properties = await sql`${query} ORDER BY created_at DESC`;
            } else {
                // Regular users or guests only see published ones
                properties = await sql`
                    SELECT * FROM properties 
                    WHERE status = 'published'
                    ORDER BY created_at DESC
                `;
            }
        }

        return NextResponse.json({ success: true, properties });
    } catch (error: any) {
        console.error('Error fetching properties:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
