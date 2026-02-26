import { requireAdmin } from '@/lib/auth-guard';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { supabaseAdmin, error: authError } = await requireAdmin();
        if (authError) return authError;

        const body = await request.json();
        const {
            nombre_es,
            nombre_eu,
            descripcion_es,
            descripcion_eu,
            precio,
            duracion_h,
            nivel,
            imagen_url,
            slug,
            visible
        } = body;

        // 2. Validate Input
        if (!nombre_es || !precio || !nivel) {
            return NextResponse.json({ error: 'Faltan campos obligatorios (Nombre, Precio, Nivel)' }, { status: 400 });
        }

        // 3. Generate Slug if missing
        let finalSlug = slug;
        if (!finalSlug) {
            finalSlug = nombre_es
                .toLowerCase()
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents
                .replace(/[^a-z0-9]+/g, '-') // replace non-alphanum with dash
                .replace(/^-+|-+$/g, ''); // trim dashes

            // Append random string to ensure uniqueness if needed? 
            // For now, let's trust the admin or let DB constraint fail if duplicate
        }

        // 4. Insert Course
        const { data, error } = await supabaseAdmin
            .from('cursos')
            .insert({
                nombre_es,
                nombre_eu: nombre_eu || nombre_es, // Fallback to ES if EU missing
                descripcion_es: descripcion_es || '',
                descripcion_eu: descripcion_eu || '',
                precio: parseFloat(precio),
                duracion_h: parseInt(duracion_h) || 0,
                nivel,
                imagen_url: imagen_url || '',
                slug: finalSlug,
                activo: true,
                visible: visible !== undefined ? visible : true
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating course:', error);
            // Check for unique violation on slug
            if (error.code === '23505') { // Postgres unique_violation
                return NextResponse.json({ error: 'Ya existe un curso con este slug' }, { status: 409 });
            }
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, course: data });

    } catch (err: unknown) {
        console.error('API Error:', err);
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}
