
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-guard';

export const dynamic = 'force-dynamic';

// GET: Obtener todas las entradas del diario del alumno
export async function GET() {
    try {
        const { user, error } = await requireAuth();
        if (error || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createClient();
        const { data, error: dbError } = await supabase
            .from('bitacora_personal')
            .select('*')
            .eq('alumno_id', user.id)
            .order('fecha', { ascending: false });

        if (dbError) throw dbError;

        return NextResponse.json(data);
    } catch (err) {
        console.error('Error fetching diary entries:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST: Crear una nueva entrada en el diario
export async function POST(req: Request) {
    try {
        const { user, error } = await requireAuth();
        if (error || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const {
            contenido,
            estado_animo,
            tags,
            fecha,
            puerto_salida,
            tripulacion,
            viento_nudos,
            viento_direccion,
            maniobras,
            observaciones
        } = body;

        // Si no hay contenido explícito pero hay datos náuticos, generamos un contenido por defecto
        let finalContent = contenido;
        if (!finalContent && (puerto_salida || tripulacion || maniobras)) {
            finalContent = `Registro de Navegación: ${puerto_salida || 'Salida al mar'}`;
        }

        if (!finalContent) {
            return NextResponse.json({ error: 'Contenido es requerido' }, { status: 400 });
        }

        const supabase = createClient();
        const { data, error: dbError } = await supabase
            .from('bitacora_personal')
            .insert({
                alumno_id: user.id,
                contenido: finalContent,
                estado_animo: estado_animo || 'discovery',
                tags: tags || [],
                fecha: fecha || new Date().toISOString(),
                puerto_salida,
                tripulacion,
                viento_nudos,
                viento_direccion,
                maniobras,
                observaciones
            })
            .select()
            .single();

        if (dbError) throw dbError;

        return NextResponse.json(data);
    } catch (err) {
        console.error('Error creating diary entry:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// DELETE: Eliminar una entrada del diario
export async function DELETE(req: Request) {
    try {
        const { user, error } = await requireAuth();
        if (error || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID es requerido' }, { status: 400 });
        }

        const supabase = createClient();
        const { error: dbError } = await supabase
            .from('bitacora_personal')
            .delete()
            .eq('id', id)
            .eq('alumno_id', user.id);

        if (dbError) throw dbError;

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Error deleting diary entry:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
