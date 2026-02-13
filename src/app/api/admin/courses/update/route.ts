import { requireAdmin } from '@/lib/auth-guard';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { supabaseAdmin, error: authError } = await requireAdmin();
        if (authError) return authError;

        const body = await request.json();
        const {
            id,
            nombre_es,
            nombre_eu,
            descripcion_es,
            descripcion_eu,
            precio,
            duracion_h,
            nivel,
            imagen_url,
            activo
        } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID del curso es obligatorio' }, { status: 400 });
        }

        // 2. Prepare Update Object
        const updateData: Record<string, unknown> = {};
        if (nombre_es !== undefined) updateData.nombre_es = nombre_es;
        if (nombre_eu !== undefined) updateData.nombre_eu = nombre_eu;
        if (descripcion_es !== undefined) updateData.descripcion_es = descripcion_es;
        if (descripcion_eu !== undefined) updateData.descripcion_eu = descripcion_eu;
        if (precio !== undefined) updateData.precio = parseFloat(precio);
        if (duracion_h !== undefined) updateData.duracion_h = parseInt(duracion_h);
        if (nivel !== undefined) updateData.nivel = nivel;
        if (imagen_url !== undefined) updateData.imagen_url = imagen_url;
        if (activo !== undefined) updateData.activo = activo;

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: 'No se enviaron datos para actualizar' }, { status: 400 });
        }

        // 3. Update Course
        const { data, error } = await supabaseAdmin
            .from('cursos')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating course:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, course: data });

    } catch (err: unknown) {
        console.error('API Error:', err);
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}
