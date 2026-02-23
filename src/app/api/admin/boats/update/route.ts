import { requireInstructor } from '@/lib/auth-guard';
import { NextResponse } from 'next/server';
import { BoatUpdateSchema } from '@/lib/validators/boat';

export async function POST(request: Request) {
    try {
        const { profile, supabaseAdmin, error: authError } = await requireInstructor();
        if (authError) return authError;

        const body = await request.json();

        const validation = BoatUpdateSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({
                error: 'Datos inválidos',
                details: validation.error.format()
            }, { status: 400 });
        }

        const validData = validation.data;
        const { id } = validData;

        const isAdmin = profile.rol === 'admin';
        const updateData: Record<string, unknown> = {};

        // Admins can update everything
        if (isAdmin) {
            if (validData.nombre !== undefined) updateData.nombre = validData.nombre;
            if (validData.tipo !== undefined) updateData.tipo = validData.tipo;
            if (validData.capacidad !== undefined) updateData.capacidad = validData.capacidad;
            if (validData.matricula !== undefined) updateData.matricula = validData.matricula;
            if (validData.imagen_url !== undefined) updateData.imagen_url = validData.imagen_url;
            if (validData.notion_threshold !== undefined) updateData.notion_threshold = validData.notion_threshold;
        }

        // Everyone (Admin + Instructor) can update status and notes
        if (validData.estado !== undefined) updateData.estado = validData.estado;
        if (validData.notas !== undefined) updateData.notas = validData.notas;

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
