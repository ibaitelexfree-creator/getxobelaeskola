
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // 1. Obtener catálogo y estado de habilidades
        const { data: skills, error: skillsError } = await supabase.rpc(
            'obtener_habilidades_alumno',
            { p_alumno_id: user.id }
        );

        if (skillsError) throw skillsError;

        // 2. Obtener rango y nivel
        const { data: rank, error: rankError } = await supabase.rpc(
            'calcular_rango_navegante',
            { p_alumno_id: user.id }
        );

        if (rankError) throw rankError;

        return NextResponse.json({
            skills,
            rank: rank && rank.length > 0 ? rank[0] : null
        });
    } catch (error: any) {
        console.error('Error fetching skills:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
