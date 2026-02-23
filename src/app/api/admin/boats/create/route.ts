import { requireAdmin } from '@/lib/auth-guard';
import { NextResponse } from 'next/server';
import { BoatCreateSchema } from '@/lib/validators/boat';

export async function POST(request: Request) {
    try {
        const { supabaseAdmin, error: authError } = await requireAdmin();
        if (authError) return authError;

        const body = await request.json();

        const validation = BoatCreateSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({
                error: 'Datos inválidos',
                details: validation.error.format()
            }, { status: 400 });
        }

        const {
            nombre,
            tipo,
            capacidad,
            matricula,
            estado,
            notas,
            imagen_url,
            notion_threshold
        } = validation.data;

        const { data, error } = await supabaseAdmin
            .from('embarcaciones')
            .insert({
                nombre,
                tipo,
                capacidad,
                matricula: matricula || '',
                estado,
                notas: notas || '',
                imagen_url: imagen_url || '',
                notion_threshold
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, boat: data });
    } catch (error: unknown) {
        const err = error as Error;
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
