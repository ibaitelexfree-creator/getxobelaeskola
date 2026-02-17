import { requireAdmin } from '@/lib/auth-guard';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { supabaseAdmin, error: authError } = await requireAdmin();
        if (authError) return authError;

        const body = await request.json();
        const nombre = body.nombre?.trim();
        const tipo = body.tipo?.trim();
        const capacidad = body.capacidad;
        const matricula = body.matricula?.trim();
        const estado = body.estado?.trim();
        const notas = body.notas?.trim();
        const imagen_url = body.imagen_url?.trim();

        if (!nombre || !tipo || capacidad === undefined || capacidad === null) {
            return NextResponse.json({ error: 'Faltan campos obligatorios (Nombre, Tipo, Capacidad)' }, { status: 400 });
        }

        const capacityInt = parseInt(capacidad);
        if (isNaN(capacityInt) || capacityInt <= 0) {
            return NextResponse.json({ error: 'La capacidad debe ser un número positivo' }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin
            .from('embarcaciones')
            .insert({
                nombre,
                tipo,
                capacidad: capacityInt,
                matricula: matricula || '',
                estado: estado || 'disponible',
                notas: notas || '',
                imagen_url: imagen_url || ''
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
