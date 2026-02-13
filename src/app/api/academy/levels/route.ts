import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const supabase = await createClient();

        // Obtener todos los niveles ordenados
        const { data: niveles, error } = await supabase
            .from('niveles_formacion')
            .select('*')
            .order('orden');

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ niveles });
    } catch {
        return NextResponse.json(
            { error: 'Error al obtener niveles' },
            { status: 500 }
        );
    }
}
