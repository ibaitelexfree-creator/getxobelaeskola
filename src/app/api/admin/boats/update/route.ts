import { requireInstructor } from '@/lib/auth-guard';
import { NextResponse } from 'next/server';

export async function POST(_request: Request) {
    try {
        const auth = await requireInstructor();
        if (auth.error) return auth.error;
        const { profile, supabaseAdmin } = auth;

        const body = await _request.json();
        const {
            id,
            nombre,
            tipo,
            capacidad,
            matricula,
            estado,
            notas,
            imagen_url,
            notion_threshold
        } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID es obligatorio' }, { status: 400 });
        }

        const isAdmin = profile?.rol === 'admin';

        const updateData: Record<string, unknown> = {};

        // Admins can update everything
        if (isAdmin) {
            if (nombre !== undefined) updateData.nombre = nombre;
            if (tipo !== undefined) updateData.tipo = tipo;
            if (capacidad !== undefined) updateData.capacidad = parseInt(capacidad);
            if (matricula !== undefined) updateData.matricula = matricula;
            if (imagen_url !== undefined) updateData.imagen_url = imagen_url;
            if (notion_threshold !== undefined) updateData.notion_threshold = notion_threshold;
        }

        // Everyone (Admin + Instructor) can update status and notes
        if (estado !== undefined) updateData.estado = estado;
        if (notas !== undefined) updateData.notas = notas;

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: 'No se enviaron datos válidos para tu rol' }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin
            .from('embarcaciones')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, boat: data });
    } catch (error: unknown) {
        const err = error as Error;
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
