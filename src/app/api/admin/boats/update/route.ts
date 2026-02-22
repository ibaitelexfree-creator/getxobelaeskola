import { requireInstructor } from '@/lib/auth-guard';
import { NextResponse } from 'next/server';
import { boatUpdateSchema } from '@/lib/validators/boat';

export async function POST(request: Request) {
    try {
        const { profile, supabaseAdmin, error: authError } = await requireInstructor();
        if (authError) return authError;

        const body = await request.json();

        const validation = boatUpdateSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 });
        }

        const { id, ...data } = validation.data;
        const isAdmin = profile.rol === 'admin';

        const updateData: Record<string, unknown> = {};

        // Admins can update everything
        if (isAdmin) {
            if (data.nombre !== undefined) updateData.nombre = data.nombre;
            if (data.tipo !== undefined) updateData.tipo = data.tipo;
            if (data.capacidad !== undefined) updateData.capacidad = data.capacidad;
            if (data.matricula !== undefined) updateData.matricula = data.matricula;
            if (data.imagen_url !== undefined) updateData.imagen_url = data.imagen_url;
            if (data.notion_threshold !== undefined) updateData.notion_threshold = data.notion_threshold;
        }

        // Everyone (Admin + Instructor) can update status and notes
        if (data.estado !== undefined) updateData.estado = data.estado;
        if (data.notas !== undefined) updateData.notas = data.notas;

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: 'No se enviaron datos válidos para tu rol' }, { status: 400 });
        }

        const { data: updatedBoat, error } = await supabaseAdmin
            .from('embarcaciones')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, boat: updatedBoat });
    } catch (error: unknown) {
        const err = error as Error;
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
